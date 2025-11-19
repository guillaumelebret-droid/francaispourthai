
import React from 'react';
import { FlashcardData, LearningDirection } from '../types';

interface CardViewProps {
    card: FlashcardData;
    isFlipped: boolean;
    direction: LearningDirection;
    onFlip: () => void;
    onPlayAudio: (e: React.MouseEvent) => void;
}

export const CardView: React.FC<CardViewProps> = ({ card, isFlipped, direction, onFlip, onPlayAudio }) => {
    
    // Configure content based on direction
    // th_fr: Front = Thai, Back = French (Mode Thai Speaker learning French)
    // fr_th: Front = French, Back = Thai
    const isThaiFront = direction === 'th_fr';

    // Labels and Texts configuration
    const frontLabel = isThaiFront ? 'ภาษาไทย' : 'Français';
    const frontText = isThaiFront ? card.thai : card.french;
    const frontLangClass = isThaiFront ? 'font-thai' : 'font-sans';
    
    const tapToRevealText = isThaiFront ? 'แตะเพื่อดูคำตอบ' : 'Toucher pour révéler';

    // Flag on Front
    const FrontFlag = isThaiFront ? (
        // Thai Flag
         <div className="absolute bottom-0 left-0 w-full h-2 flex">
             <div className="w-1/3 h-full bg-red-500"></div>
             <div className="w-1/3 h-full bg-white"></div>
             <div className="w-1/3 h-full bg-blue-800"></div>
        </div>
    ) : (
        // French Flag
        <div className="absolute bottom-0 left-0 w-full h-2 flex">
             <div className="w-1/3 h-full bg-blue-700"></div>
             <div className="w-1/3 h-full bg-white"></div>
             <div className="w-1/3 h-full bg-red-500"></div>
        </div>
    );

    const backLabel = isThaiFront ? 'ภาษาฝรั่งเศส' : 'Thai';
    const backText = isThaiFront ? card.french : card.thai;
    const backLangClass = isThaiFront ? 'font-sans' : 'font-thai';
    
    const audioButtonText = isThaiFront ? 'ฟังเสียง' : 'Écouter';

    // Flag on Back
    const BackFlag = isThaiFront ? (
        // French Flag
        <div className="absolute bottom-0 left-0 w-full h-2 flex">
             <div className="w-1/3 h-full bg-blue-700"></div>
             <div className="w-1/3 h-full bg-white"></div>
             <div className="w-1/3 h-full bg-red-500"></div>
        </div>
    ) : (
        // Thai Flag
        <div className="absolute bottom-0 left-0 w-full h-2 flex">
             <div className="w-1/3 h-full bg-red-500"></div>
             <div className="w-1/3 h-full bg-white"></div>
             <div className="w-1/3 h-full bg-blue-800"></div>
        </div>
    );

    return (
        <div className="perspective-1000 w-full max-w-sm aspect-[3/4] relative cursor-pointer touch-manipulation" onClick={onFlip}>
            <div 
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* Front Side */}
                <div className="absolute w-full h-full backface-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-blue-50 flex flex-col items-center justify-center p-8 text-center">
                    <span className={`text-blue-600 text-xs font-bold tracking-widest mb-4 uppercase opacity-60 ${isThaiFront ? 'font-thai' : ''}`}>
                        {frontLabel}
                    </span>
                    <h2 className={`text-6xl font-semibold text-slate-800 leading-tight select-none ${frontLangClass}`}>
                        {frontText}
                    </h2>
                    <p className={`mt-8 text-slate-400 text-sm animate-pulse ${isThaiFront ? 'font-thai' : ''}`}>
                        {tapToRevealText}
                    </p>
                    
                    {FrontFlag}
                </div>

                {/* Back Side */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-blue-600 shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center p-8 text-center text-white">
                    <span className={`text-blue-200 text-xs font-bold tracking-widest mb-4 uppercase opacity-80 ${isThaiFront ? 'font-thai' : ''}`}>
                        {backLabel}
                    </span>
                    <h2 className={`text-5xl font-bold leading-tight break-words mb-8 select-none ${backLangClass}`}>
                        {backText}
                    </h2>
                    
                     {/* Audio Button */}
                    <button 
                        onClick={onPlayAudio}
                        className="flex items-center justify-center gap-3 px-6 py-3 bg-white text-blue-700 rounded-full shadow-md active:bg-blue-50 active:scale-95 transition-all group z-20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        <span className={`text-base font-bold ${isThaiFront ? 'font-thai' : ''}`}>{audioButtonText}</span>
                    </button>

                     {BackFlag}
                </div>
            </div>
        </div>
    );
};
