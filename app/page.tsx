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
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Estados de seleção de cidade
    const [cityInput, setCityInput] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [filteredCities, setFilteredCities] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
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

    // Debounce da digitação da busca (500ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Dispara busca no backend
    useEffect(() => {
        if (!selectedCity) {
            setCatalog([]);
            setLoading(false);
            return;
        }

        fetchCatalog(debouncedSearch, selectedCity);
    }, [debouncedSearch, selectedCity]);

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

    const fetchCatalog = async (searchTerm = debouncedSearch, cityTerm = selectedCity) => {
        if (!cityTerm) return;

        try {
            setLoading(true);
            const querySearch = encodeURIComponent(searchTerm.trim());
            const queryCity = encodeURIComponent(cityTerm.trim());

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

    const handleSelectCity = (city: string) => {
        setSelectedCity(city);
        setCityInput(city);
        setIsDropdownOpen(false);
        setLoading(true);
    };

    const handleClearCity = () => {
        setSelectedCity('');
        setCityInput('');
        setSearch('');
        setDebouncedSearch('');
        setCatalog([]);
        setLoading(false);
    };

    // Função para limpar o texto da pesquisa
    const handleClearSearch = () => {
        setSearch('');
        setDebouncedSearch('');
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

            {/* CABEÇALHO FIXO (STICKY) */}
            <header
                className="sticky top-0 z-40 py-3 md:py-4 flex items-center justify-center bg-cover bg-center shadow-md backdrop-blur-md transition-all duration-300 border-b border-slate-200/50 dark:border-slate-800/50"
                style={{
                    backgroundImage:
                        theme === 'dark'
                            ? `linear-gradient(to bottom, rgba(15, 23, 42, 0.94), rgba(2, 6, 23, 0.98)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')`
                            : `linear-gradient(to bottom, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.97)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')`,
                }}
            >
                <ThemeToggle theme={theme} onToggle={toggleTheme} />

                <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center flex flex-col gap-2.5">

                    {/* LINHA SUPERIOR */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-200/40 dark:border-slate-800/40 pb-2">

                        {selectedCity ? (
                            <div className="flex items-center gap-2 animate-fadeIn">
                                <span className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
                                    Ofertas em:
                                </span>
                                <h1 className="text-xl md:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight drop-shadow-sm flex items-center gap-1">
                                    📍 {selectedCity}
                                </h1>
                            </div>
                        ) : (
                            <span className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                                Ofertas em um único lugar, sem burocracia.
                            </span>
                        )}

                        <a
                            href="https://wa.me/5518997261236"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md hover:shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <span className="text-sm animate-bounce">📢</span>
                            <span>Conecte seu anúncio a quem procura. <strong className="underline font-extrabold">Anuncie aqui: (18) 99726-1236</strong></span>
                        </a>

                    </div>

                    {/* BARRA DE PESQUISA COMBINADA */}
                    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-2xl p-2 border border-slate-200 dark:border-slate-800 transition-all relative">

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

                            {/* CAMPO DE PESQUISA COM ÍCONE DE LUPA E BOTÃO LIMPAR */}
                            <div className="relative flex-1 flex items-center">
                                {/* Ícone da Lupa */}
                                <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                <input
                                    type="text"
                                    placeholder={selectedCity ? 'O que procura? (Ex: Terreno, Piscina, Sobrado...)' : '⚠️ Selecione primeiro a cidade ao lado ou acima'}
                                    className="w-full pl-10 pr-10 py-3 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent text-sm rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800/40 transition disabled:cursor-not-allowed"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    disabled={!selectedCity}
                                />

                                {/* Botão Limpar (só aparece quando houver texto) */}
                                {search && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center justify-center"
                                        title="Limpar pesquisa"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="max-w-7xl mx-auto px-4 py-12">
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