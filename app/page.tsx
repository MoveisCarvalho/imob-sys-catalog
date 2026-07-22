'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TenantGroup } from '@/types/catalog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CitySelector } from '@/components/CitySelector';
import { TenantGroupSection } from '@/components/TenantGroupSection';
import { ImageModal } from '@/components/ImageModal';

export default function LandingPage() {
    const [catalog, setCatalog] = useState<TenantGroup[]>([]);
    const [search, setSearch] = useState('');

    // Estados de seleção de cidade
    const [cityInput, setCityInput] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [filteredCities, setFilteredCities] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false); // <-- NOVO: Carregamento da lista inicial de cidades
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Estados do Modal
    const [modalImages, setModalImages] = useState<string[]>([]);
    const [currentModalIndex, setCurrentModalIndex] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Inicialização do Tema
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

    // Carrega cidades iniciais
    useEffect(() => {
        const fetchInitialCities = async () => {
            try {
                setIsCitiesLoading(true);
                const res = await fetch(`/api/catalog?search=&city=`);
                const data = await res.json();
                if (data && typeof data === 'object' && 'cities' in data && Array.isArray(data.cities)) {
                    setAvailableCities(data.cities);
                }
            } catch (err) {
                console.error('Erro ao carregar cidades iniciais:', err);
            } finally {
                setIsCitiesLoading(false);
            }
        };
        fetchInitialCities();
    }, []);

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtra cidades ao digitar
    useEffect(() => {
        if (cityInput.trim() === '') {
            setFilteredCities(availableCities);
        } else {
            const filtered = availableCities.filter((city) =>
                city.toLowerCase().includes(cityInput.toLowerCase())
            );
            setFilteredCities(filtered);
        }
    }, [cityInput, availableCities]);

    // Debounce na busca do catálogo
    useEffect(() => {
        if (!selectedCity) {
            setCatalog([]);
            setLoading(false);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            fetchCatalog();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, selectedCity]);

    // Interceptador do Botão Voltar do celular para o Modal
    useEffect(() => {
        if (!isModalOpen) return;

        window.history.pushState({ modalOpen: true }, '');

        const handlePopState = () => {
            setIsModalOpen(false);
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (window.history.state?.modalOpen) {
                window.history.back();
            }
        };
    }, [isModalOpen]);

    const fetchCatalog = async () => {
        if (!selectedCity) return;

        try {
            setLoading(true);
            const querySearch = encodeURIComponent(search.trim());
            const queryCity = encodeURIComponent(selectedCity.trim());

            const url = `/api/catalog?search=${querySearch}&city=${queryCity}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data && typeof data === 'object' && 'catalog' in data) {
                setCatalog(Array.isArray(data.catalog) ? data.catalog : []);
            } else {
                setCatalog(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error('Erro ao carregar o catálogo:', err);
        } finally {
            setLoading(false);
        }
    };

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

    const openZoomModal = (images: string[], initialIndex: number) => {
        if (!images || images.length === 0) return;
        setModalImages(images);
        setCurrentModalIndex(initialIndex);
        setIsModalOpen(true);
    };

    // SELEÇÃO DE CIDADE: Seta loading como true IMEDIATAMENTE ao clicar
    const handleSelectCity = (city: string) => {
        setSelectedCity(city);
        setCityInput(city);
        setIsDropdownOpen(false);
        setLoading(true); // <-- Dá resposta visual instantânea ao usuário
    };

    const handleClearCity = () => {
        setSelectedCity('');
        setCityInput('');
        setCatalog([]);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
            <style
                dangerouslySetInnerHTML={{
                    __html: `
          @keyframes gradient-shift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
          }
          .animate-gradient-dynamic {
              background-size: 200% 200%;
              animation: gradient-shift 3s ease infinite;
          }
      `,
                }}
            />

            {/* CABEÇALHO */}
            <header
                className="relative min-h-[280px] py-8 flex items-center justify-center bg-cover bg-center transition-all duration-300"
                style={{
                    backgroundImage:
                        theme === 'dark'
                            ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.92), rgba(2, 6, 23, 0.98)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')`
                            : `linear-gradient(to bottom, rgba(255, 255, 255, 0.85), rgba(248, 250, 252, 0.95)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')`,
                }}
            >
                <ThemeToggle theme={theme} onToggle={toggleTheme} />

                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center flex flex-col gap-4">
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

                    {/* BARRA DE PESQUISA COMBINADA */}
                    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-2xl p-2 border border-slate-200 dark:border-slate-800 transition-all relative">

                        {/* NOVO: AVISO FLUTUANTE DE PROCESSANDO */}
                        {loading && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce z-20">
                                <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processando ofertas para {selectedCity}...</span>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-2">
                            <CitySelector
                                cityInput={cityInput}
                                setCityInput={setCityInput}
                                selectedCity={selectedCity}
                                setSelectedCity={setSelectedCity}
                                filteredCities={filteredCities}
                                isDropdownOpen={isDropdownOpen}
                                setIsDropdownOpen={setIsDropdownOpen}
                                dropdownRef={dropdownRef}
                                onClearCity={handleClearCity}
                                onSelectCity={handleSelectCity}
                            />

                            <div className="h-px md:h-8 w-full md:w-px bg-slate-200 dark:bg-slate-800 my-1 md:my-auto"></div>

                            <input
                                type="text"
                                placeholder={selectedCity ? 'O que procura? (Ex: Terreno, Piscina, Sobrado...)' : '⚠️ Selecione primeiro a cidade ao lado'}
                                className="w-full flex-1 px-4 py-3 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent text-sm rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800/40 transition disabled:cursor-not-allowed"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                disabled={!selectedCity || loading}
                            />

                            {/* BOTÃO COM ÍCONE E TEXTO DE PROCESSANDO */}
                            <button
                                onClick={fetchCatalog}
                                disabled={!selectedCity || loading}
                                className="bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white dark:text-slate-950 px-6 py-3 rounded-xl transition-all font-bold text-sm whitespace-nowrap shadow-sm disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[130px]"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Processando...</span>
                                    </>
                                ) : (
                                    'Pesquisar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="max-w-7xl mx-auto px-4 py-16">
                {!selectedCity ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                        <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-2">Para começar, escolha uma cidade</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                            {isCitiesLoading ? (
                                <span className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Carregando lista de cidades disponíveis...
                                </span>
                            ) : (
                                'Digite ou selecione a cidade de interesse no campo em destaque acima para visualizar as ofertas e anúncios disponíveis.'
                            )}
                        </p>
                    </div>
                ) : loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
                        <p className="mt-4 text-slate-400 dark:text-slate-500 font-light flex items-center justify-center gap-2">
                            <span>Buscando as melhores oportunidades em <strong>{selectedCity}</strong>...</span>
                        </p>
                    </div>
                ) : catalog.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Nenhum anúncio localizado para sua busca em {selectedCity}.</p>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {catalog.map((group) => (
                            <TenantGroupSection key={group.tenantId} group={group} onOpenZoom={openZoomModal} />
                        ))}
                    </div>
                )}
            </main>

            {/* MODAL DE ZOOM DA GALERIA */}
            <ImageModal
                isOpen={isModalOpen}
                images={modalImages}
                currentIndex={currentModalIndex}
                setCurrentIndex={setCurrentModalIndex}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}