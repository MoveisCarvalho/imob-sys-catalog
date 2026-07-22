'use client';

import React from 'react';

interface CitySelectorProps {
    cityInput: string;
    setCityInput: (value: string) => void;
    selectedCity: string;
    setSelectedCity: (value: string) => void;
    filteredCities: string[];
    isDropdownOpen: boolean;
    setIsDropdownOpen: (open: boolean) => void;
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    onClearCity: () => void;
    onSelectCity: (city: string) => void;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
    cityInput,
    setCityInput,
    selectedCity,
    setSelectedCity,
    filteredCities,
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownRef,
    onClearCity,
    onSelectCity,
}) => {
    return (
        <div className="relative flex-1 md:max-w-[280px]" ref={dropdownRef}>
            <div
                className={`relative p-[2px] rounded-xl transition-all duration-500 ${!selectedCity
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 animate-gradient-dynamic shadow-md shadow-amber-500/10'
                        : 'bg-transparent'
                    }`}
            >
                <div className="flex items-center px-4 py-3 bg-white dark:bg-slate-900 rounded-[10px] transition focus-within:bg-slate-50 dark:focus-within:bg-slate-800/40">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className={`w-4 h-4 mr-2 transition-colors ${!selectedCity ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>

                    <input
                        type="text"
                        placeholder="Selecione uma cidade..."
                        className="w-full outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent text-sm font-semibold"
                        value={cityInput}
                        onChange={(e) => {
                            setCityInput(e.target.value);
                            setIsDropdownOpen(true);
                            if (selectedCity) setSelectedCity('');
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                    />
                    {cityInput && (
                        <button
                            onClick={onClearCity}
                            className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
                            type="button"
                        >
                            &times;
                        </button>
                    )}
                </div>
            </div>

            {isDropdownOpen && (
                <ul className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 text-left text-sm py-1 transition-all">
                    {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                            <li
                                key={city}
                                onClick={() => onSelectCity(city)}
                                className="px-4 py-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                {city}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2.5 text-slate-400 dark:text-slate-500 italic">
                            Nenhuma cidade encontrada
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};