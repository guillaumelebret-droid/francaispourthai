
import React, { useState, useEffect, useCallback } from 'react';
import { FlashcardData, ReviewStatus, UserProgress } from './types';
import { fetchAndParseCSV } from './services/csvService';
import { loadProgress, saveProgress, selectNextCard, calculateNextReview } from './services/srsService';
import { speakFrench } from './services/ttsService';
import { CardView } from './components/CardView';
import { ControlBar } from './components/ControlBar';
import { ProgressBar } from './components/ProgressBar';
import { GOOGLE_SHEET_URL, MOCK_CSV_CONTENT } from './constants';

const App: React.FC = () => {
    const [cards, setCards] = useState<FlashcardData[]>([]);
    const [progress, setProgress] = useState<Record<string, UserProgress>>({});
    const [currentCard, setCurrentCard] = useState<FlashcardData | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Loading ---
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let loadedCards: FlashcardData[] = [];
            
            // Check if URL is the default placeholder or valid
            if (GOOGLE_SHEET_URL.includes('123456789')) {
                console.log("Using mock data (Please update GOOGLE_SHEET_URL in constants.ts)");
                const mockBlob = new Blob([MOCK_CSV_CONTENT.trim()], { type: 'text/csv' });
                const mockUrl = URL.createObjectURL(mockBlob);
                loadedCards = await fetchAndParseCSV(mockUrl);
            } else {
                loadedCards = await fetchAndParseCSV(GOOGLE_SHEET_URL);
            }

            if (loadedCards.length === 0) throw new Error("No cards found in CSV.");

            setCards(loadedCards);
            
            // Load progress from storage
            const storedProgress = loadProgress();
            setProgress(storedProgress);

            // Pick initial card
            const next = selectNextCard(loadedCards, storedProgress);
            setCurrentCard(next);
            
        } catch (err: any) {
            setError(err.message || "Error loading data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- Interaction Handlers ---

    const handleFlip = useCallback(() => {
        if (!currentCard || isFlipped) return;
        
        setIsFlipped(true);
        // Trigger audio automatically on reveal
        speakFrench(currentCard.french);
    }, [currentCard, isFlipped]);

    const handlePlayAudio = useCallback((e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering card flip logic if any
        if (currentCard) {
            speakFrench(currentCard.french);
        }
    }, [currentCard]);

    const handleRate = useCallback((status: ReviewStatus) => {
        if (!currentCard) return;

        // 1. Calculate new progress for current card
        const currentCardProgress = progress[currentCard.id];
        const newProgress = calculateNextReview(currentCard.id, status, currentCardProgress);

        // 2. Update state and storage
        const updatedProgress = {
            ...progress,
            [currentCard.id]: newProgress
        };
        setProgress(updatedProgress);
        saveProgress(updatedProgress);

        // 3. Reset view
        setIsFlipped(false);
        
        // 4. Select next card immediately (small delay for animation smoothness)
        setTimeout(() => {
            const next = selectNextCard(cards, updatedProgress);
            setCurrentCard(next);
        }, 200);

    }, [currentCard, progress, cards]);

    const handleReload = () => {
        loadData();
    };

    // --- Render ---

    if (loading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 text-blue-600">
                <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-semibold">Chargement...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-slate-50">
                <div className="text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-slate-700 mb-4">{error}</p>
                <button 
                    onClick={handleReload}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full shadow-lg active:scale-95 transition-transform"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (!currentCard) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Félicitations !</h2>
                <p className="text-slate-600 mb-8">Vous avez terminé votre session pour le moment.</p>
                <ProgressBar cards={cards} progress={progress} />
                <button 
                    onClick={handleReload}
                    className="mt-8 px-6 py-2 bg-blue-100 text-blue-700 font-semibold rounded-full"
                >
                    Actualiser les données
                </button>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col bg-slate-100 relative overflow-hidden">
            {/* Header */}
            <header className="flex-none h-14 px-6 flex items-center justify-between bg-white border-b border-slate-200 z-10">
                <div className="flex items-center gap-3">
                   {/* French Flag: Blue, White, Red vertical stripes */}
                   <div className="w-8 h-5 rounded-sm overflow-hidden shadow-sm flex relative border border-slate-100">
                        <div className="w-1/3 h-full bg-blue-700"></div>
                        <div className="w-1/3 h-full bg-white"></div>
                        <div className="w-1/3 h-full bg-red-600"></div>
                   </div>
                   <h1 className="font-bold text-blue-900 text-lg flex items-center">
                        Français - <span className="font-thai ml-1 font-normal">ภาษาไทย</span>
                   </h1>
                </div>
                <button 
                    onClick={handleReload}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    aria-label="Reload Data"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </header>

            {/* Progress Bar */}
            <div className="flex-none z-10">
                <ProgressBar cards={cards} progress={progress} />
            </div>

            {/* Main Card Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
                <div className="w-full max-w-md flex justify-center mb-4 z-0">
                   <CardView 
                        card={currentCard} 
                        isFlipped={isFlipped} 
                        onFlip={handleFlip}
                        onPlayAudio={handlePlayAudio} 
                   />
                </div>

                {/* Controls */}
                <div className="w-full max-w-md h-20 flex items-center justify-center z-10">
                    {isFlipped ? (
                        <ControlBar isVisible={isFlipped} onRate={handleRate} />
                    ) : (
                         <button 
                            onClick={handleFlip}
                            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg active:bg-blue-700 transition-colors"
                        >
                            Voir réponse
                        </button>
                    )}
                </div>
            </main>

            {/* Background decor */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50 to-transparent -z-0 pointer-events-none"></div>
        </div>
    );
};

export default App;
