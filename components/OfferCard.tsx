'use client';

import React, { useState } from 'react';
import { Offer } from '@/types/catalog';

interface OfferCardProps {
    offer: Offer;
    onOpenZoom: (images: string[], index: number) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onOpenZoom }) => {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    // Estado para controlar a expansão do texto
    const [isExpanded, setIsExpanded] = useState(false);

    const hasImages = offer.images && offer.images.length > 0;

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev === 0 ? offer.images.length - 1 : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev === offer.images.length - 1 ? 0 : prev + 1));
    };

    // Função para formatar datas respeitando o fuso horário local
    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        const trimmed = dateString.trim();

        // Caso já venha no padrão BR DD/MM/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
            return trimmed;
        }

        // Caso venha no padrão simples YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            const [year, month, day] = trimmed.split('-');
            return `${day}/${month}/${year}`;
        }

        const date = new Date(trimmed);
        if (isNaN(date.getTime())) return null;

        // Removido o timeZone: 'UTC' para exibir na hora local do dispositivo/navegador
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formattedCreatedDate = formatDate(offer.createdAt);
    const formattedExpiresDate = formatDate(offer.expiresAt);

    return (
        <div className="group flex flex-col bg-slate-50/50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/80 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300">
            {/* Mini Carrossel de Imagens */}
            <div className="relative h-60 bg-slate-200 dark:bg-slate-900 overflow-hidden">
                {hasImages ? (
                    <>
                        <img
                            src={offer.images[currentImgIndex]}
                            alt={offer.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                            onClick={() => onOpenZoom(offer.images, currentImgIndex)}
                        />
                        {offer.images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition shadow-lg backdrop-blur-sm border border-white/20 select-none"
                                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }}
                                >
                                    &#10094;
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition shadow-lg backdrop-blur-sm border border-white/20 select-none"
                                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }}
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
                    {/* Título clicável */}
                    <h3
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="font-serif font-bold text-xl text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition duration-300 mb-2 cursor-pointer select-none"
                    >
                        {offer.title}
                    </h3>

                    {/* Bloco de descrição expansível */}
                    <div
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="cursor-pointer group/desc mb-4 select-none"
                    >
                        <p className={`text-slate-600 dark:text-slate-300 text-sm leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                            {offer.description}
                        </p>

                        {/* Botão/Indicador de Expansão */}
                        <div className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1">
                            {isExpanded ? (
                                <>
                                    <span>Recolher descrição</span>
                                    <span>▲</span>
                                </>
                            ) : (
                                <>
                                    <span>Ler descrição completa</span>
                                    <span>▼</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bloco do Rodapé com Datas, ID e Galeria */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/85 flex items-end justify-between text-xs text-slate-400 dark:text-slate-500">
                    {/* Esquerda: Datas de Publicação e Validade */}
                    <div className="flex flex-col gap-1">
                        {formattedCreatedDate && (
                            <span className="font-medium text-slate-500 dark:text-slate-400">
                                Publicado: {formattedCreatedDate}
                            </span>
                        )}
                        <div className="font-medium">
                            {formattedExpiresDate ? (
                                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                    Validade: {formattedExpiresDate}
                                </span>
                            ) : (
                                <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                                    Validade: Indeterminada
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Direita: ID e Botão da Galeria */}
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            ID: {offer._id.substring(18)}
                        </span>
                        <button
                            onClick={() => onOpenZoom(offer.images || [], 0)}
                            className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold uppercase tracking-wider transition-colors"
                        >
                            Ver Galeria ({offer.images?.length || 0})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};