'use client';

import React from 'react';

interface ImageModalProps {
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
    onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
    isOpen,
    images,
    currentIndex,
    setCurrentIndex,
    onClose,
}) => {
    if (!isOpen || images.length === 0) return null;

    return (
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 transition-opacity duration-300 select-none"
        >
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white text-4xl hover:text-amber-400 transition z-50 font-light hidden md:block cursor-pointer"
            >
                &times;
            </button>

            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/80 font-medium text-xs tracking-widest bg-slate-900/60 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md z-50">
                {currentIndex + 1} / {images.length}
            </div>

            {images.length > 1 && (
                <button
                    onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-3 md:left-8 text-white hover:text-amber-400 text-4xl md:text-5xl transition z-50 select-none active:scale-95 p-2 bg-black/20 rounded-full backdrop-blur-sm"
                >
                    &#10094;
                </button>
            )}

            <div className="relative max-h-[70vh] md:max-h-[80vh] max-w-[90vw] flex items-center justify-center">
                <img
                    src={images[currentIndex]}
                    alt={`Imagem ${currentIndex + 1} em zoom`}
                    className="max-h-[70vh] md:max-h-[80vh] max-w-[90vw] object-contain select-none shadow-2xl rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {images.length > 1 && (
                <button
                    onClick={() => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 md:right-8 text-white hover:text-amber-400 text-4xl md:text-5xl transition z-50 select-none active:scale-95 p-2 bg-black/20 rounded-full backdrop-blur-sm"
                >
                    &#10095;
                </button>
            )}

            <button
                onClick={onClose}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white px-6 py-3 rounded-full flex items-center gap-2 text-sm font-semibold border border-white/20 backdrop-blur-md shadow-lg transition-all cursor-pointer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                Fechar Imagem
            </button>
        </div>
    );
};