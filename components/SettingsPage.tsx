import React from 'react';

interface SettingsPageProps {
    onClose: () => void;
    onReload: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onClose, onReload }) => {
    return (
        <div className="h-full w-full flex flex-col bg-slate-50 animate-[fadeIn_0.2s_ease-out] absolute top-0 left-0 z-50">
            {/* Header */}
            <header className="flex-none h-16 px-4 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm z-20">
                <h1 className="text-lg font-bold text-slate-800">Configuration</h1>
                <button 
                    onClick={onClose}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    aria-label="Retour"
                >
                    {/* Flèche droite vers gauche (Back) */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <button 
                        onClick={onReload}
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 active:bg-blue-50 transition-colors group border-b border-slate-100 last:border-0"
                    >
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-active:scale-95 transition-transform shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-semibold text-slate-800">
                                Actualiser / อัปเดตข้อมูล
                            </span>
                            <span className="text-xs text-slate-400 mt-0.5">
                                Recharger la liste depuis Google Sheets
                            </span>
                        </div>
                    </button>
                </div>
                
                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-300">Thai-French Flashcards v1.1</p>
                </div>
            </main>
        </div>
    );
};