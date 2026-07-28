'use client';

import { useState, useEffect, useRef } from 'react';
import { TenantGroup } from '@/types/catalog';

// Função utilitária para remover acentos e padronizar textos
const normalizeText = (text: string = ''): string =>
    text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

export function useCatalog() {
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

    // Estados do Modal de Imagem
    const [modalImages, setModalImages] = useState<string[]>([]);
    const [currentModalIndex, setCurrentModalIndex] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Inicialização do Tema e Título da Aba
    useEffect(() => {
        document.title = 'Catálogo de Ofertas';

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
            const queryCity = encodeURIComponent(cityTerm.trim());

            // Solicitamos todos os dados da cidade (sem filtrar no backend) para podermos
            // realizar a filtragem refinada de múltiplas palavras no frontend.
            const url = `/api/catalog?search=&city=${queryCity}`;
            const res = await fetch(url);
            const data = await res.json();

            let rawCatalog: TenantGroup[] = [];
            if (data && typeof data === 'object' && 'catalog' in data) {
                rawCatalog = Array.isArray(data.catalog) ? data.catalog : [];
            } else {
                rawCatalog = Array.isArray(data) ? data : [];
            }

            // Se não houver busca digitada, exibe o catálogo completo da cidade
            if (!searchTerm.trim()) {
                setCatalog(rawCatalog);
                return;
            }

            // Separa os termos digitados em palavras individuais (ex: "terrenos casa" -> ["terrenos", "casa"])
            const searchWords = normalizeText(searchTerm).trim().split(/\s+/);

            // Filtra os cards para garantir que TODAS as palavras existam no card
            const filteredCatalog = rawCatalog
                .map((group) => {
                    const filteredOffers = (group.offers || []).filter((item: any) => {
                        const itemContent = normalizeText(
                            `${item.title || ''} ${item.description || ''} ${item.category || ''} ${item.tags?.join(' ') || ''}`
                        );

                        // Garante que TODAS as palavras buscadas existam no conteúdo
                        return searchWords.every((word) => itemContent.includes(word));
                    });

                    return {
                        ...group,
                        offers: filteredOffers,
                    };
                })
                // Oculta grupos/anunciantes que não possuem ofertas correspondentes
                .filter((group) => group.offers && group.offers.length > 0);

            setCatalog(filteredCatalog);
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

    const handleClearSearch = () => {
        setSearch('');
        setDebouncedSearch('');
    };

    return {
        catalog,
        search,
        setSearch,
        cityInput,
        setCityInput,
        selectedCity,
        setSelectedCity,
        filteredCities,
        isDropdownOpen,
        setIsDropdownOpen,
        dropdownRef,
        loading,
        isCitiesLoading,
        theme,
        modalImages,
        currentModalIndex,
        setCurrentModalIndex,
        isModalOpen,
        setIsModalOpen,
        toggleTheme,
        openZoomModal,
        handleSelectCity,
        handleClearCity,
        handleClearSearch,
    };
}