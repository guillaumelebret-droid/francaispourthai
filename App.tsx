
import React, { useState, useEffect, useCallback } from 'react';
import { FlashcardData, ReviewStatus, UserProgress, LearningDirection } from './types';
import { fetchAndParseCSV } from './services/csvService';
import { loadProgress, saveProgress, selectNextCard, calculateNextReview, getProgressId, cleanupOrphanedProgress } from './services/srsService';
import { speakText } from './services/ttsService';
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
    
    // State for learning direction (defaults to Thai -> French)
    const [direction, setDirection] = useState<LearningDirection>(() => {
        const saved = localStorage.getItem('learning_direction');
        return (saved === 'fr_th' || saved === 'th_fr') ? saved as LearningDirection : 'th_fr';
    });

    // --- Data Loading ---
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let loadedCards: FlashcardData[] = [];
            
            if (GOOGLE_SHEET_URL.includes('123456789')) {
                console.log("Using mock data");
                const mockBlob = new Blob([MOCK_CSV_CONTENT.trim()], { type: 'text/csv' });
                const mockUrl = URL.createObjectURL(mockBlob);
                loadedCards = await fetchAndParseCSV(mockUrl);
            } else {
                loadedCards = await fetchAndParseCSV(GOOGLE_SHEET_URL);
            }

            if (loadedCards.length === 0) throw new Error("No cards found in CSV.");

            setCards(loadedCards);
            
            let storedProgress = loadProgress();
            
            // Cleanup: Remove progress for cards that no longer exist in the CSV
            // This handles cases where rows are deleted from the Google Sheet
            const cleanedProgress = cleanupOrphanedProgress(storedProgress, loadedCards);
            
            // If cleanup occurred, save immediately to keep storage tidy
            if (cleanedProgress !== storedProgress) {
                saveProgress(cleanedProgress);
                storedProgress = cleanedProgress;
            }

            setProgress(storedProgress);

            // Pick initial card based on current direction
            const next = selectNextCard(loadedCards, storedProgress, direction);
            setCurrentCard(next);
            
        } catch (err: any) {
            setError(err.message || "Error loading data");
        } finally {
            setLoading(false);
        }
    }, [direction]); // Reload if logic depends on clean state, but strictly selectNextCard handles it

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- Direction Toggle ---
    const toggleDirection = () => {
        const newDir = direction === 'th_fr' ? 'fr_th' : 'th_fr';
        setDirection(newDir);
        localStorage.setItem('learning_direction', newDir);
        
        // Reset current card view
        setIsFlipped(false);
        setCurrentCard(null); // clear momentarily
        
        // Select new card for the new direction immediately
        setTimeout(() => {
            const next = selectNextCard(cards, progress, newDir);
            setCurrentCard(next);
        }, 50);
    };

    // --- Interaction Handlers ---

    const handleFlip = useCallback(() => {
        if (!currentCard || isFlipped) return;
        
        setIsFlipped(true);
        // Play audio for the ANSWER (Back side)
        if (direction === 'th_fr') {
            speakText(currentCard.french, 'fr');
        } else {
            speakText(currentCard.thai, 'th');
        }
    }, [currentCard, isFlipped, direction]);

    const handlePlayAudio = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentCard) {
            // Always play the answer side language
            if (direction === 'th_fr') {
                speakText(currentCard.french, 'fr');
            } else {
                speakText(currentCard.thai, 'th');
            }
        }
    }, [currentCard, direction]);

    const handleRate = useCallback((status: ReviewStatus) => {
        if (!currentCard) return;

        // 1. Calculate new progress using the direction-specific ID
        const pid = getProgressId(currentCard.id, direction);
        const currentCardProgress = progress[pid];
        const newProgress = calculateNextReview(pid, status, currentCardProgress);

        // 2. Update state and storage
        const updatedProgress = {
            ...progress,
            [pid]: newProgress
        };
        setProgress(updatedProgress);
        saveProgress(updatedProgress);

        // 3. Reset view
        setIsFlipped(false);
        
        // 4. Select next card
        setTimeout(() => {
            const next = selectNextCard(cards, updatedProgress, direction);
            setCurrentCard(next);
        }, 200);

    }, [currentCard, progress, cards, direction]);

    const handleReload = () => {
        loadData();
    };

    const getNextReviewTimeMessage = () => {
        const now = Date.now();
        // Filter progress keys to only include current direction
        const futureReviews = Object.keys(progress)
            .filter(key => {
                const isRevKey = key.endsWith('_rev');
                if (direction === 'fr_th') return isRevKey;
                return !isRevKey;
            })
            .map(key => progress[key].nextReview)
            .filter(time => time > now)
            .sort((a, b) => a - b);

        if (futureReviews.length === 0) return null;

        const nextTime = futureReviews[0];
        const diffMs = nextTime - now;
        const diffMinutes = Math.ceil(diffMs / (1000 * 60));

        if (diffMinutes < 60) {
            return `Prochaine carte disponible dans environ ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}.`;
        } else {
            const diffHours = Math.ceil(diffMinutes / 60);
            return `Prochaine carte disponible dans environ ${diffHours} heure${diffHours > 1 ? 's' : ''}.`;
        }
    };

    // --- Render Helpers ---

    // Components for Flags
    const FrenchFlag = () => (
        <div className="w-8 h-5 rounded-sm overflow-hidden shadow-sm flex border border-slate-100 shrink-0">
            <div className="w-1/3 h-full bg-blue-700"></div>
            <div className="w-1/3 h-full bg-white"></div>
            <div className="w-1/3 h-full bg-red-600"></div>
        </div>
    );

    const ThaiFlag = () => (
        <div className="w-8 h-5 rounded-sm overflow-hidden shadow-sm flex flex-col border border-slate-100 shrink-0">
            <div className="h-[16.6%] w-full bg-red-600"></div>
            <div className="h-[16.6%] w-full bg-white"></div>
            <div className="h-[33.2%] w-full bg-blue-900"></div>
            <div className="h-[16.6%] w-full bg-white"></div>
            <div className="h-[16.6%] w-full bg-red-600"></div>
        </div>
    );

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
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={handleReload} className="px-6 py-2 bg-blue-600 text-white rounded-full">Réessayer</button>
            </div>
        );
    }

    // Filtered stats for progress bar
    const directionStats = cards.reduce((acc, card) => {
        // Create a subset of progress object that only contains keys for current direction
        // BUT ProgressBar expects the full object and maps cards. 
        // We need to trick ProgressBar or update it.
        // Easier: pass a "view" of progress where keys match card.id
        const pid = getProgressId(card.id, direction);
        if (progress[pid]) {
            acc[card.id] = progress[pid];
        }
        return acc;
    }, {} as Record<string, UserProgress>);

    return (
        <div className="h-full w-full flex flex-col bg-slate-100 relative overflow-hidden">
            {/* Dynamic Header */}
            <header className="flex-none h-16 px-4 flex items-center justify-between bg-white border-b border-slate-200 z-20 shadow-sm">
                
                {/* Language Switcher Area - Centered via Flex logic */}
                <div className="flex items-center justify-center w-full gap-3">
                    
                    {direction === 'th_fr' ? (
                        <>
                            {/* Thai Front -> French Back */}
                            {/* Header: Thai Left -> French Right */}
                            <div className="flex items-center gap-2">
                                <ThaiFlag />
                                <span className="font-thai font-normal text-blue-900 text-sm sm:text-base">ภาษาไทย</span>
                            </div>
                            
                            <button 
                                onClick={toggleDirection}
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors active:scale-90"
                                aria-label="Changer de direction"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-2">
                                <span className="font-bold text-blue-900 text-sm sm:text-base">Français</span>
                                <FrenchFlag />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* French Front -> Thai Back */}
                            {/* Header: French Left -> Thai Right */}
                            <div className="flex items-center gap-2">
                                <FrenchFlag />
                                <span className="font-bold text-blue-900 text-sm sm:text-base">Français</span>
                            </div>

                            <button 
                                onClick={toggleDirection}
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors active:scale-90"
                                aria-label="Changer de direction"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-2">
                                <span className="font-thai font-normal text-blue-900 text-sm sm:text-base">ภาษาไทย</span>
                                <ThaiFlag />
                            </div>
                        </>
                    )}

                </div>
                
                {/* Reload Button - Absolute right or pushed right */}
                <div className="absolute right-4">
                     <button 
                        onClick={handleReload}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Progress Bar with stats specific to direction */}
            <div className="flex-none z-10">
                <ProgressBar cards={cards} progress={directionStats} />
            </div>

            {/* Main Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
                {!currentCard ? (
                    <div className="text-center max-w-sm mx-auto">
                        <h2 className="text-2xl font-bold text-blue-900 mb-2">Félicitations !</h2>
                        <p className="text-slate-600 mb-4">Aucune carte à réviser dans ce sens pour le moment.</p>
                        {getNextReviewTimeMessage() && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
                                ⏳ {getNextReviewTimeMessage()}
                            </div>
                        )}
                        <button onClick={handleReload} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg">Actualiser</button>
                    </div>
                ) : (
                    <>
                        <div className="w-full max-w-md flex justify-center mb-4 z-0">
                           <CardView 
                                card={currentCard} 
                                isFlipped={isFlipped} 
                                direction={direction}
                                onFlip={handleFlip}
                                onPlayAudio={handlePlayAudio} 
                           />
                        </div>

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
                    </>
                )}
            </main>
            
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50 to-transparent -z-0 pointer-events-none"></div>
        </div>
    );
};

export default App;
