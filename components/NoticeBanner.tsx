'use client';

import React from 'react';

export function NoticeBanner() {
    return (
        <div className="w-full bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/60 dark:border-slate-800/60 py-1.5 px-4 text-center backdrop-blur-sm">
            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight flex items-center justify-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Toda publicação é de inteira responsabilidade do anunciante (lojista).</span>
            </p>
        </div>
    );
}