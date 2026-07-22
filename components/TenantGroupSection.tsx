'use client';

import React from 'react';
import { TenantGroup } from '@/types/catalog';
import { OfferCard } from '@/components/OfferCard';

interface TenantGroupSectionProps {
    group: TenantGroup;
    onOpenZoom: (images: string[], index: number) => void;
}

export const TenantGroupSection: React.FC<TenantGroupSectionProps> = ({ group, onOpenZoom }) => {
    // Helper para formatar link do WhatsApp
    const getWhatsAppLink = (phone: string) => {
        if (!phone) return '#';
        const cleanNumber = phone.replace(/\D/g, '');
        const formattedNumber = cleanNumber.length <= 11 ? `55${cleanNumber}` : cleanNumber;
        return `https://wa.me/${formattedNumber}`;
    };

    // Helper para garantir protocolo HTTP/HTTPS na URL do site
    const formatUrl = (url?: string) => {
        if (!url) return '#';
        return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    };

    return (
        <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-slate-800/80 p-6 md:p-10">
            {/* Cabeçalho do Corretor / Tenant */}
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-6 mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                {/* Informações do Corretor */}
                <div>
                    <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">
                        {group.tenantName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <a
                            href={getWhatsAppLink(group.tenantPhone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors hover:underline"
                            title="Abrir no WhatsApp"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                            Contato: {group.tenantPhone}
                        </a>

                        {group.tenantCity && (
                            <>
                                <span className="text-slate-300 dark:text-slate-700 text-xs font-bold hidden sm:inline">•</span>
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                                    {group.tenantCity}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Botões de Ação do Tenant - Estrutura em Coluna (Empilhados) */}
                <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto mt-2 md:mt-0">

                    {/* Botão para Acessar o Website (Acima) */}
                    {group.websiteLink && (
                        <a
                            href={formatUrl(group.websiteLink)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all duration-300 shadow-sm w-full md:w-auto"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m-17.432-4.5A8.958 8.958 0 0 0 3 12c0 .778.099 1.533.284 2.253" />
                            </svg>
                            Acessar nosso site
                        </a>
                    )}

                    {/* Botão de Contato (Abaixo) */}
                    {group.tenantCardLink && (
                        <a
                            href={group.tenantCardLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm w-full md:w-auto"
                        >
                            Escolha como entrar em Contato
                        </a>
                    )}
                </div>
            </div>

            {/* Listagem dos Cards de Imóveis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {group.offers.map((offer) => (
                    <OfferCard key={offer._id} offer={offer} onOpenZoom={onOpenZoom} />
                ))}
            </div>
        </section>
    );
};