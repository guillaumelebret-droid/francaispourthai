
export interface FlashcardData {
    id: string;
    thai: string;
    french: string;
}

export enum ReviewStatus {
    AGAIN = 'AGAIN', // Je ne sais pas (Red)
    HARD = 'HARD',   // J'avais oublié (Orange)
    GOOD = 'GOOD',   // Je me rappelle (Green)
    EASY = 'EASY'    // C'est acquis (Blue)
}

export interface UserProgress {
    cardId: string;
    nextReview: number; // Timestamp
    interval: number;   // In minutes
    reps: number;       // Number of consecutive correct reviews
    lastStatus?: ReviewStatus; // The button clicked last time
}

export type LearningDirection = 'th_fr' | 'fr_th'; // th_fr = Thai Front / French Back

export interface AppState {
    cards: FlashcardData[];
    progress: Record<string, UserProgress>;
    currentCardId: string | null;
    isFlipped: boolean;
    isLoading: boolean;
    error: string | null;
    sessionCount: number;
    direction: LearningDirection;
}
