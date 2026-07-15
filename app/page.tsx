"use client";

import React, { useState, useEffect } from 'react';

interface Offer {
    _id: string;
    title: string;
    description: string;
    images: string[];
}

interface TenantGroup {
    tenantId: string;
    tenantName: string;
    tenantPhone: string;
    tenantCity: string;
    tenantCardLink: string;
    offers: Offer[];
}

export default function LandingPage() {
    const [catalog, setCatalog] = useState<TenantGroup[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Controle do Tema (Light / Dark)
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const [activeImageIndexes, setActiveImageIndexes] = useState<Record<string, number>>({});
    const [modalImages, setModalImages] = useState<string[]>([]);
    const [currentModalIndex, setCurrentModalIndex] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Inicializa o tema verificando o localStorage ou preferência do sistema
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Função para alternar o tema
    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // Monitora as alterações de busca e cidade
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCatalog();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, selectedCity]);

    const fetchCatalog = async () => {
        try {
            setLoading(true);
            const querySearch = encodeURIComponent(search.trim());
            const queryCity = encodeURIComponent(selectedCity.trim());

            const url = `/api/catalog?search=${querySearch}&city=${queryCity}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data && typeof data === 'object' && 'catalog' in data) {
                setCatalog(Array.isArray(data.catalog) ? data.catalog : []);
                if (Array.isArray(data.cities) && selectedCity === '') {
                    setAvailableCities(data.cities);
                }
            } else {
                setCatalog(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Erro ao carregar o catálogo:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevImage = (offerId: string, totalImages: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveImageIndexes(prev => {
            const current = prev[offerId] || 0;
            return { ...prev, [offerId]: current === 0 ? totalImages - 1 : current - 1 };
        });
    };

    const handleNextImage = (offerId: string, totalImages: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveImageIndexes(prev => {
            const current = prev[offerId] || 0;
            return { ...prev, [offerId]: current === totalImages - 1 ? 0 : current + 1 };
        });
    };

    const openZoomModal = (images: string[], initialIndex: number) => {
        if (!images || images.length === 0) return;
        setModalImages(images);
        setCurrentModalIndex(initialIndex);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
            {/* CABEÇALHO COM GRADIENTE DINÂMICO */}
            <header
                className="relative min-h-[280px] py-8 flex items-center justify-center bg-cover bg-center transition-all duration-300"
                style={{
                    backgroundImage: theme === 'dark'
                        ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.92), rgba(2, 6, 23, 0.98)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')`
                        : `linear-gradient(to bottom, rgba(255, 255, 255, 0.85), rgba(248, 250, 252, 0.95)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')`
                }}
            >
                {/* Botão Seletor de Tema */}
                <button
                    onClick={toggleTheme}
                    className="absolute top-4 right-4 z-20 bg-slate-900/10 hover:bg-slate-900/20 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-800 dark:text-white p-2.5 rounded-full transition-all duration-300 border border-slate-900/10 dark:border-white/20 backdrop-blur-sm shadow-sm"
                    title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
                >
                    {theme === 'light' ? (
                        // Ícone da Lua (Aparece no Modo Claro para ir pro Escuro)
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-700">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                        </svg>
                    ) : (
                        // Ícone do Sol (Aparece no Modo Escuro para ir pro Claro)
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-amber-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.42 12.42l1.58 1.58M3 12h2.25m13.5 0H21M6.01 17.99l1.58-1.58M16.28 7.72l1.58-1.58M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z" />
                        </svg>
                    )}
                </button>

                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center flex flex-col gap-4">
                    {/* Linha informativa */}
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs md:text-sm">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                            Ofertas em um único lugar, sem burocracia.
                        </span>
                        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
                        <a
                            href="https://wa.me/5518997261236"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-600 dark:text-amber-400 hover:underline font-bold transition-colors"
                        >
                            Anuncie aqui: (18) 99726-1236
                        </a>
                    </div>

                    {/* Barra de Filtros Combinada */}
                    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-2xl p-2 border border-slate-200 dark:border-slate-850 transition-all">
                        <div className="flex flex-col md:flex-row gap-2">
                            {/* Input de Busca */}
                            <input
                                type="text"
                                placeholder="O que procura? (Ex: Terreno, Piscina, Sobrado...)"
                                className="w-full px-4 py-3 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent text-sm rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800/40 transition"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <div className="h-px md:h-8 w-full md:w-px bg-slate-200 dark:bg-slate-800 my-1 md:my-auto"></div>

                            {/* Seletor Dinâmico de Cidades */}
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="px-4 py-3 outline-none text-slate-700 dark:text-slate-300 text-sm bg-transparent cursor-pointer min-w-[180px] font-medium"
                            >
                                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Todas as cidades</option>
                                {availableCities.map((cidade) => (
                                    <option key={cidade} value={cidade} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                                        {cidade}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={fetchCatalog}
                                className="bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-slate-950 px-6 py-3 rounded-xl transition-all font-bold text-sm whitespace-nowrap shadow-sm"
                            >
                                Pesquisar
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="max-w-7xl mx-auto px-4 py-16">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
                        <p className="mt-4 text-slate-400 dark:text-slate-500 font-light">Buscando as melhores oportunidades...</p>
                    </div>
                ) : catalog.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Nenhum anúncio localizado para sua busca.</p>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {catalog.map((group) => (
                            <section
                                key={group.tenantId}
                                className="bg-white dark:bg-slate-905/40 dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-md transition-all duration-305 border border-slate-200 dark:border-slate-800/80 p-6 md:p-10"
                            >
                                {/* Cabeçalho do Corretor */}
                                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>

                                        <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">{group.tenantName}</h2>

                                        {/* LINHA ÚNICA: CONTATO + CIDADE JUNTOS */}
                                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                            <span>Contato: {group.tenantPhone}</span>
                                            {group.tenantCity && (
                                                <>
                                                    <span className="text-slate-300 dark:text-slate-700 text-xs font-bold">•</span>
                                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                                                        {group.tenantCity}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                    </div>
                                    {group.tenantCardLink && (
                                        <a
                                            href={group.tenantCardLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center bg-slate-900 dark:bg-slate-800 hover:bg-amber-600 dark:hover:bg-amber-500 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm"
                                        >
                                            Entrar em Contato
                                        </a>
                                    )}
                                </div>

                                {/* Listagem dos Cards de Imóveis */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {group.offers.map((offer) => {
                                        const currentImgIndex = activeImageIndexes[offer._id] || 0;
                                        const hasImages = offer.images && offer.images.length > 0;

                                        return (
                                            <div
                                                key={offer._id}
                                                className="group flex flex-col bg-slate-50/50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-205 dark:border-slate-800/80 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300"
                                            >
                                                {/* Mini Carrossel de Imagens */}
                                                <div className="relative h-60 bg-slate-200 dark:bg-slate-900 overflow-hidden">
                                                    {hasImages ? (
                                                        <>
                                                            <img
                                                                src={offer.images[currentImgIndex]}
                                                                alt={offer.title}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                                                                onClick={() => openZoomModal(offer.images, currentImgIndex)}
                                                            />
                                                            {offer.images.length > 1 && (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => handlePrevImage(offer._id, offer.images.length, e)}
                                                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition shadow-lg backdrop-blur-sm border border-white/20 select-none"
                                                                        style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" }}
                                                                    >
                                                                        &#10094;
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handleNextImage(offer._id, offer.images.length, e)}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition shadow-lg backdrop-blur-sm border border-white/20 select-none"
                                                                        style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))" }}
                                                                    >
                                                                        &#10095;
                                                                    </button>
                                                                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[11px] px-2 py-1 rounded-md font-semibold">
                                                                        {currentImgIndex + 1} de {offer.images.length}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm italic">
                                                            Sem fotos cadastradas
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Descrição e Detalhes */}
                                                <div className="p-6 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition duration-300 mb-2">
                                                            {offer.title}
                                                        </h3>
                                                        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4 leading-relaxed">
                                                            {offer.description}
                                                        </p>
                                                    </div>
                                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800/85 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                                                        <span>ID: {offer._id.substring(18)}</span>
                                                        <button
                                                            onClick={() => openZoomModal(offer.images || [], 0)}
                                                            className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold uppercase tracking-wider transition-colors"
                                                        >
                                                            Ver Galeria ({offer.images?.length || 0})
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>

            {/* MODAL DE ZOOM DA GALERIA */}
            {isModalOpen && modalImages.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 transition-opacity duration-300">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-6 right-6 text-white text-4xl hover:text-amber-400 transition z-50 font-light"
                    >
                        &times;
                    </button>

                    {modalImages.length > 1 && (
                        <button
                            onClick={() => setCurrentModalIndex(prev => prev === 0 ? modalImages.length - 1 : prev - 1)}
                            className="absolute left-4 md:left-8 text-white hover:text-amber-400 text-5xl transition z-50 select-none active:scale-95"
                            style={{ filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.9))" }}
                        >
                            &#10094;
                        </button>
                    )}

                    <div className="relative max-w-4xl max-h-[85vh] w-full px-4 flex items-center justify-center">
                        <img
                            src={modalImages[currentModalIndex]}
                            alt="Imóvel em Destaque"
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-transform duration-300"
                        />
                    </div>

                    {modalImages.length > 1 && (
                        <button
                            onClick={() => setCurrentModalIndex(prev => prev === modalImages.length - 1 ? 0 : prev + 1)}
                            className="absolute right-4 md:right-8 text-white hover:text-amber-400 text-5xl transition z-50 select-none active:scale-95"
                            style={{ filter: "drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.9))" }}
                        >
                            &#10095;
                        </button>
                    )}

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5">
                        {modalImages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentModalIndex(idx)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentModalIndex ? 'bg-amber-400 scale-125' : 'bg-white/30 hover:bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}