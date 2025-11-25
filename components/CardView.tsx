
import React, { useState } from 'react';
import { FlashcardData, LearningDirection } from '../types';

interface CardViewProps {
    card: FlashcardData;
    isFlipped: boolean;
    direction: LearningDirection;
    onFlip: () => void;
    onPlayAudio: (e: React.MouseEvent) => void;
}

export const CardView: React.FC<CardViewProps> = ({ card, isFlipped, direction, onFlip, onPlayAudio }) => {
    const [showDetails, setShowDetails] = useState(false);
    
    // Configure content based on direction
    const isThaiFront = direction === 'th_fr';

    // Labels and Texts configuration
    const frontLabel = isThaiFront ? 'ภาษาไทย' : 'Français';
    const frontText = isThaiFront ? card.thai : card.french;
    const frontLangClass = isThaiFront ? 'font-thai' : 'font-sans';
    
    const tapToRevealText = isThaiFront ? 'แตะเพื่อดูคำตอบ' : 'Toucher pour révéler';

    const backLabel = isThaiFront ? 'ภาษาฝรั่งเศส' : 'Thai';
    const backText = isThaiFront ? card.french : card.thai;
    const backLangClass = isThaiFront ? 'font-sans' : 'font-thai';
    
    const audioButtonText = isThaiFront ? 'ฟังเสียง' : 'Écouter';

    // Logic for clickable French word
    // We only enable click if it IS the French word AND we have extras
    const hasExtras = !!card.extras;
    
    const isFrontFrench = !isThaiFront; // If not Thai Front, then Front is French
    const isBackFrench = isThaiFront;   // If Thai Front, then Back is French

    const handleFrenchClick = (e: React.MouseEvent) => {
        if (hasExtras) {
            e.stopPropagation(); // Prevent card flip
            setShowDetails(true);
        }
    };

    // Helper to render the French text with potential interactivity
    const renderFrenchText = (text: string, isClickable: boolean, sizeClass: string) => {
        if (!isClickable || !hasExtras) {
            return (
                <h2 className={`${sizeClass} font-semibold text-slate-800 leading-tight select-none font-sans`}>
                    {text}
                </h2>
            );
        }

        return (
            <div 
                onClick={handleFrenchClick}
                className="relative group cursor-pointer"
            >
                <h2 className={`${sizeClass} font-semibold text-blue-700 leading-tight select-none font-sans underline decoration-dotted decoration-blue-300 underline-offset-8`}>
                    {text}
                    {/* Info Icon Indicator */}
                    <span className="absolute -top-1 -right-4 text-blue-400 opacity-50 text-base group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </span>
                </h2>
            </div>
        );
    };

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
                <div className="absolute w-full h-full backface-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-blue-50 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                    <span className={`text-blue-600 text-xs font-bold tracking-widest mb-4 uppercase opacity-60 ${isThaiFront ? 'font-thai' : ''}`}>
                        {frontLabel}
                    </span>
                    
                    {isFrontFrench ? (
                        renderFrenchText(frontText, true, 'text-6xl')
                    ) : (
                        <h2 className={`text-6xl font-semibold text-slate-800 leading-tight select-none ${frontLangClass}`}>
                            {frontText}
                        </h2>
                    )}

                    <p className={`mt-8 text-slate-400 text-sm animate-pulse ${isThaiFront ? 'font-thai' : ''}`}>
                        {tapToRevealText}
                    </p>
                    
                    {FrontFlag}

                    {/* Modal Overlay for Front Side (if needed) */}
                    {isFrontFrench && showDetails && (
                        <div 
                            className="absolute inset-0 z-50 bg-white/95 flex flex-col p-6 text-left cursor-default animate-[fadeIn_0.2s_ease-out]"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            <button 
                                onClick={() => setShowDetails(false)}
                                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            
                            <h3 className="text-2xl font-bold text-blue-700 mb-6 font-sans">{card.french}</h3>
                            
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {card.extras?.infoLines.map((line, idx) => (
                                    <p key={idx} className="text-slate-700 text-lg border-b border-slate-100 pb-2 last:border-0">{line}</p>
                                ))}
                                
                                {card.extras?.passeCompose && (
                                    <>
                                        <div className="my-6 border-t-2 border-dashed border-slate-200"></div>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <span className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Passé Composé</span>
                                            <p className="text-xl text-blue-900 font-medium">{card.extras.passeCompose}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Back Side */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-blue-600 shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col items-center justify-center p-8 text-center text-white overflow-hidden">
                    <span className={`text-blue-200 text-xs font-bold tracking-widest mb-4 uppercase opacity-80 ${isThaiFront ? 'font-thai' : ''}`}>
                        {backLabel}
                    </span>
                    
                    {isBackFrench ? (
                        // Need a specific render for back side because renderFrenchText assumes dark text
                         hasExtras ? (
                            <div 
                                onClick={handleFrenchClick}
                                className="relative group cursor-pointer mb-8"
                            >
                                <h2 className="text-5xl font-bold leading-tight break-words font-sans underline decoration-dotted decoration-blue-300 underline-offset-8">
                                    {backText}
                                    <span className="absolute -top-1 -right-4 text-blue-200 opacity-60 text-base group-hover:opacity-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </h2>
                            </div>
                         ) : (
                            <h2 className={`text-5xl font-bold leading-tight break-words mb-8 select-none ${backLangClass}`}>
                                {backText}
                            </h2>
                         )
                    ) : (
                        <h2 className={`text-5xl font-bold leading-tight break-words mb-8 select-none ${backLangClass}`}>
                            {backText}
                        </h2>
                    )}
                    
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

                    {/* Modal Overlay for Back Side */}
                    {isBackFrench && showDetails && (
                        <div 
                            className="absolute inset-0 z-50 bg-white flex flex-col p-6 text-left cursor-default animate-[fadeIn_0.2s_ease-out] text-slate-800"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            <button 
                                onClick={() => setShowDetails(false)}
                                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            
                            <h3 className="text-2xl font-bold text-blue-700 mb-6 font-sans">{card.french}</h3>
                            
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {card.extras?.infoLines.map((line, idx) => (
                                    <p key={idx} className="text-slate-700 text-lg border-b border-slate-100 pb-2 last:border-0">{line}</p>
                                ))}
                                
                                {card.extras?.passeCompose && (
                                    <>
                                        <div className="my-6 border-t-2 border-dashed border-slate-200"></div>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <span className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Passé Composé</span>
                                            <p className="text-xl text-blue-900 font-medium">{card.extras.passeCompose}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
