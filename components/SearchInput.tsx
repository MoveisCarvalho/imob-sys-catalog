'use client';

import React from 'react';

interface SearchInputProps {
    search: string;
    selectedCity: string;
    onSearchChange: (value: string) => void;
    onClearSearch: () => void;
}

export function SearchInput({
    search,
    selectedCity,
    onSearchChange,
    onClearSearch,
}: SearchInputProps) {
    return (
        <div className="relative flex-1 flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>

            <input
                type="text"
                placeholder={
                    selectedCity
                        ? 'O que procura? (Ex: Terreno, Lanche, Moto...)'
                        : '⚠️ Selecione primeiro a cidade ao lado ou acima'
                }
                className="w-full pl-10 pr-10 py-3 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent text-sm rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800/40 transition disabled:cursor-not-allowed"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                disabled={!selectedCity}
            />

            {search && (
                <button
                    type="button"
                    onClick={onClearSearch}
                    className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition flex items-center justify-center"
                    title="Limpar pesquisa"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}