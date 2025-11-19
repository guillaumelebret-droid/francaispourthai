
import { FlashcardData, UserProgress, ReviewStatus, LearningDirection } from '../types';

const STORAGE_KEY = 'thai_french_progress';
const MAX_ACTIVE_LEARNING_CARDS = 50; 

// Helper to generate unique ID based on direction
export const getProgressId = (cardId: string, direction: LearningDirection): string => {
    return direction === 'th_fr' ? cardId : `${cardId}_rev`;
};

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

// Cleanup function to remove progress for cards that no longer exist in the CSV
export const cleanupOrphanedProgress = (
    currentProgress: Record<string, UserProgress>, 
    validCards: FlashcardData[]
): Record<string, UserProgress> => {
    const validIds = new Set(validCards.map(c => c.id));
    const cleanedProgress: Record<string, UserProgress> = {};
    let hasChanges = false;

    Object.keys(currentProgress).forEach(key => {
        // Check if key is a straight ID or a reverse ID (ending in _rev)
        const baseId = key.endsWith('_rev') ? key.replace('_rev', '') : key;

        if (validIds.has(baseId)) {
            cleanedProgress[key] = currentProgress[key];
        } else {
            hasChanges = true;
        }
    });

    // If we removed something, return the cleaned object, otherwise return original to preserve ref equality if possible
    return hasChanges ? cleanedProgress : currentProgress;
};

// Select the next card based on SRS logic and direction
export const selectNextCard = (
    cards: FlashcardData[], 
    progress: Record<string, UserProgress>,
    direction: LearningDirection = 'th_fr'
): FlashcardData | null => {
    if (cards.length === 0) return null;

    const now = Date.now();
    
    // 1. Identify Due Cards
    const dueCards = cards.filter(card => {
        const pid = getProgressId(card.id, direction);
        const p = progress[pid];
        return p && p.nextReview <= now;
    });

    // PRIORITY 1: Due Cards
    if (dueCards.length > 0) {
        dueCards.sort((a, b) => {
            const pA = progress[getProgressId(a.id, direction)];
            const pB = progress[getProgressId(b.id, direction)];
            return pA.nextReview - pB.nextReview;
        });
        return dueCards[0];
    }

    // 2. Progressive Mix Logic
    // Count learning cards specifically for this direction
    const activeIds = Object.keys(progress).filter(k => {
        // Simple check: if direction is th_fr, key shouldn't end in _rev (mostly)
        // if direction is fr_th, key SHOULD end in _rev.
        // Safest is just to assume the progress map is mixed and we filter based on current cards
        return true; 
    });

    // Better way to count active learning cards for CURRENT direction
    let currentDirectionLearningCount = 0;
    cards.forEach(c => {
        const pid = getProgressId(c.id, direction);
        const p = progress[pid];
        if (p && p.lastStatus !== ReviewStatus.EASY) {
            currentDirectionLearningCount++;
        }
    });

    // PRIORITY 2: New Cards
    if (currentDirectionLearningCount < MAX_ACTIVE_LEARNING_CARDS) {
        // Find the first card with NO progress record for this direction
        const newCard = cards.find(c => !progress[getProgressId(c.id, direction)]);
        if (newCard) {
            return newCard;
        }
    }

    // PRIORITY 3: NO LOOPING
    return null;
};

// Calculate next schedule based on rating
// Note: cardId passed here should already be the direction-specific ID (the key in the progress map)
export const calculateNextReview = (progressKey: string, rating: ReviewStatus, currentProgress?: UserProgress): UserProgress => {
    const now = Date.now();
    const ONE_MINUTE = 60 * 1000;
    const ONE_DAY = 24 * 60 * 60 * 1000;

    let nextInterval: number; 
    let newReps = currentProgress ? currentProgress.reps : 0;

    switch (rating) {
        case ReviewStatus.AGAIN: 
            newReps = 0; 
            nextInterval = 1 * ONE_MINUTE; 
            break;
        case ReviewStatus.HARD: 
            newReps = 0; 
            nextInterval = 5 * ONE_MINUTE; 
            break;
        case ReviewStatus.GOOD: 
            newReps += 1;
            if (newReps === 1) nextInterval = 0.5 * ONE_DAY; 
            else if (newReps === 2) nextInterval = 3 * ONE_DAY;
            else nextInterval = Math.pow(1.8, newReps) * ONE_DAY; 
            break;
        case ReviewStatus.EASY: 
            newReps += 1;
            if (newReps === 1) nextInterval = 3 * ONE_DAY;
            else nextInterval = Math.pow(2.5, newReps) * ONE_DAY;
            break;
        default:
            nextInterval = 1 * ONE_MINUTE;
            break;
    }

    return {
        cardId: progressKey, // Store the progressKey (e.g., "abc_rev") as the ID in the record
        nextReview: now + nextInterval,
        interval: nextInterval,
        reps: newReps,
        lastStatus: rating 
    };
};
