'use client';

import React from 'react';
import { NoticeBanner } from '@/components/NoticeBanner';
import { SearchInput } from '@/components/SearchInput';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CitySelector } from '@/components/CitySelector';
import { TenantGroupSection } from '@/components/TenantGroupSection';
import { ImageModal } from '@/components/ImageModal';
import { useCatalog } from './hooks/useCatalog';

export default function LandingPage() {
    const {
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
    } = useCatalog();

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

            {/* BANNER COM AVISO DE RESPONSABILIDADE JURÍDICA */}
            <NoticeBanner />

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
                            <span>
                                Conecte seu anúncio a quem procura.{' '}
                                <strong className="underline font-extrabold">Anuncie: (18) 99726-1236</strong>
                            </span>
                        </a>
                    </div>

                    {/* BARRA DE PESQUISA COMBINADA */}
                    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-2xl p-2 border border-slate-200 dark:border-slate-800 transition-all relative">
                        {/* BANNER DE CARREGAMENTO DAS CIDADES */}
                        {isCitiesLoading && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs px-5 py-1.5 rounded-full shadow-xl border border-amber-300 flex items-center gap-2 animate-pulse z-30 whitespace-nowrap">
                                <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>⏳ CARREGANDO CIDADES DISPONÍVEIS...</span>
                            </div>
                        )}

                        {/* BANNER DE CARREGAMENTO DO CATÁLOGO DE OFERTAS */}
                        {loading && !isCitiesLoading && (
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

                            <SearchInput
                                search={search}
                                selectedCity={selectedCity}
                                onSearchChange={setSearch}
                                onClearSearch={handleClearSearch}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="max-w-7xl mx-auto px-4 py-12">
                {!selectedCity ? (
                    isCitiesLoading ? (
                        <div className="text-center py-16 px-6 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 dark:via-slate-900 dark:to-slate-900 rounded-3xl border-2 border-amber-500/40 shadow-2xl max-w-lg mx-auto transition-all animate-pulse">
                            <div className="mx-auto w-20 h-20 mb-6 flex items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30">
                                <svg className="animate-spin h-10 w-10" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mb-2 tracking-wide uppercase">
                                Buscando Cidades...
                            </h3>
                            <p className="text-slate-700 dark:text-slate-200 text-base font-semibold max-w-md mx-auto leading-relaxed">
                                Estamos localizando as cidades ativas com ofertas no sistema. Por favor, aguarde um segundo!
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-2">Para começar, escolha uma cidade</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
                                Digite ou selecione a cidade de interesse no campo em destaque acima para visualizar as ofertas e anúncios disponíveis.
                            </p>
                        </div>
                    )
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