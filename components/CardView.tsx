
import React from 'react';
import { FlashcardData } from '../types';

interface CardViewProps {
    card: FlashcardData;
    isFlipped: boolean;
    onFlip: () => void;
    onPlayAudio: (e: React.MouseEvent) => void;
}

export const CardView: React.FC<CardViewProps> = ({ card, isFlipped, onFlip, onPlayAudio }) => {
    return (
        <div className="perspective-1000 w-full max-w-sm aspect-[3/4] relative cursor-pointer touch-manipulation" onClick={onFlip}>
            <div 
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* Front (Thai) */}
                <div className="absolute w-full h-full backface-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-blue-50 flex flex-col items-center justify-center p-8 text-center">
                    <span className="text-blue-600 text-xs font-bold tracking-widest mb-4 uppercase opacity-60">Thai</span>
                    <h2 className="text-6xl font-thai font-semibold text-slate-800 leading-tight select-none">
                        {card.thai}
                    </h2>
                    <p className="mt-8 text-slate-400 text-sm animate-pulse">Toucher pour révéler</p>
                    
                    {/* Decorative flag element */}
                    <div className="absolute bottom-0 left-0 w-full h-2 flex">
                         <div className="w-1/3 h-full bg-red-500"></div>
                         <div className="w-1/3 h-full bg-white"></div>
                         <div className="w-1/3 h-full bg-blue-800"></div>
                    </div>
                </div>

                {/* Back (French) */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-blue-600 shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center p-8 text-center text-white">
                    <span className="text-blue-200 text-xs font-bold tracking-widest mb-4 uppercase opacity-80">Français</span>
                    <h2 className="text-5xl font-bold leading-tight break-words mb-8 select-none">
                        {card.french}
                    </h2>
                    
                     {/* Audio Button - Enlarged for mobile accessibility */}
                    <button 
                        onClick={onPlayAudio}
                        className="flex items-center justify-center gap-3 px-6 py-3 bg-white text-blue-700 rounded-full shadow-md active:bg-blue-50 active:scale-95 transition-all group z-20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        <span className="text-base font-bold">Écouter</span>
                    </button>

                     {/* Decorative flag element (France) */}
                     <div className="absolute bottom-0 left-0 w-full h-2 flex">
                         <div className="w-1/3 h-full bg-blue-700"></div>
                         <div className="w-1/3 h-full bg-white"></div>
                         <div className="w-1/3 h-full bg-red-500"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
