
import { FlashcardData, UserProgress, ReviewStatus } from '../types';

const STORAGE_KEY = 'thai_french_progress';
const MAX_ACTIVE_LEARNING_CARDS = 50; // Only limit cards that are NOT 'EASY' yet

// Save progress to localStorage
export const saveProgress = (progress: Record<string, UserProgress>) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        console.error("Failed to save progress", e);
    }
};

// Load progress from localStorage
export const loadProgress = (): Record<string, UserProgress> => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        return {};
    }
};

// Select the next card based on SRS logic
export const selectNextCard = (cards: FlashcardData[], progress: Record<string, UserProgress>): FlashcardData | null => {
    if (cards.length === 0) return null;

    const now = Date.now();
    
    // 1. Identify Due Cards (Active cards where nextReview <= now)
    // These are the absolute priority.
    const dueCards = cards.filter(card => {
        const p = progress[card.id];
        return p && p.nextReview <= now;
    });

    // PRIORITY 1: Due Cards
    if (dueCards.length > 0) {
        // Sort by due date: overdue first
        dueCards.sort((a, b) => {
            return progress[a.id].nextReview - progress[b.id].nextReview;
        });
        return dueCards[0];
    }

    // 2. Progressive Mix Logic
    // We want to introduce new cards ONLY if we aren't overwhelmed.
    // We count how many cards are currently "In Learning" (Active but NOT Easy/Mastered).
    const activeIds = Object.keys(progress);
    const learningCount = activeIds.filter(id => {
        const p = progress[id];
        // If last status was EASY, we consider it "Mastered" enough to not block new cards.
        // Or if reps are high enough (e.g. > 4). Let's stick to the requested "Acquis" logic.
        return p.lastStatus !== ReviewStatus.EASY; 
    }).length;

    // PRIORITY 2: New Cards
    // Only show a new card if we are under the limit of "difficult cards currently in rotation"
    if (learningCount < MAX_ACTIVE_LEARNING_CARDS) {
        // Find the first card in the CSV that has NO progress record
        const newCard = cards.find(c => !progress[c.id]);
        if (newCard) {
            return newCard;
        }
    }

    // PRIORITY 3: NO LOOPING
    // If no cards are due NOW, and we can't add new cards (or ran out), 
    // we return NULL. This triggers the "Congratulations" screen.
    // We strictly DO NOT show cards scheduled for the future.
    return null;
};

// Calculate next schedule based on rating
export const calculateNextReview = (cardId: string, rating: ReviewStatus, currentProgress?: UserProgress): UserProgress => {
    const now = Date.now();
    const ONE_MINUTE = 60 * 1000;
    const ONE_DAY = 24 * 60 * 60 * 1000;

    let nextInterval: number; // in ms relative to now
    let newReps = currentProgress ? currentProgress.reps : 0;

    switch (rating) {
        case ReviewStatus.AGAIN: // Je ne sais pas (Red)
            newReps = 0; 
            // Immediate retry (1 min)
            nextInterval = 1 * ONE_MINUTE; 
            break;
        case ReviewStatus.HARD: // J'avais oublié (Orange)
            // Reset reps slightly to ensure it comes back but not from zero
            newReps = 0; 
            nextInterval = 5 * ONE_MINUTE; 
            break;
        case ReviewStatus.GOOD: // Je me rappelle (Green)
            newReps += 1;
            // Simple exponential backoff
            if (newReps === 1) nextInterval = 1 * ONE_DAY;
            else if (newReps === 2) nextInterval = 3 * ONE_DAY;
            else nextInterval = Math.pow(1.8, newReps) * ONE_DAY; 
            break;
        case ReviewStatus.EASY: // C'est acquis (Blue)
            newReps += 1;
            // Big jump
            if (newReps === 1) nextInterval = 3 * ONE_DAY;
            else nextInterval = Math.pow(2.5, newReps) * ONE_DAY;
            break;
        default:
            nextInterval = 1 * ONE_MINUTE;
            break;
    }

    return {
        cardId,
        nextReview: now + nextInterval,
        interval: nextInterval,
        reps: newReps,
        lastStatus: rating // Save the specific button clicked for stats
    };
};
