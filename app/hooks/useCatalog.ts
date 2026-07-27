'use client';

import { useState, useEffect, useRef } from 'react';
import { TenantGroup } from '@/types/catalog';

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