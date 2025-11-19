
import { FlashcardData } from '../types';

const CSV_CACHE_KEY = 'thai_french_csv_cache';

// Helper to generate a unique ID from content
// UPDATED: Now uses a hash of the full string to prevent collisions that were occurring 
// when truncated to 10 chars (fixing the 309 vs 707 words issue).
const generateId = (thai: string, french: string): string => {
    const raw = `${thai}|${french}`;
    
    // 1. Simple integer hash of the full content
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const hashSuffix = Math.abs(hash).toString(36);

    // 2. Readable prefix (cleaned base64), kept short but descriptive
    const prefix = btoa(unescape(encodeURIComponent(raw)))
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 12);

    return `${prefix}_${hashSuffix}`;
};

// Robust CSV line parser that handles quotes (e.g., "Bonjour, monde" stays as one field)
const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            // Handle double quotes if needed, but simple toggle for now
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current); // Don't trim here yet to preserve internal spacing if needed
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    
    // Clean up quotes and whitespace
    return result.map(s => s.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
};

// Extracted parsing logic to be used by both Network and Cache sources
const parseCSVText = (text: string): FlashcardData[] => {
    const lines = text.split(/\r?\n/);
    const cards: FlashcardData[] = [];
    const seenIds = new Set<string>(); // Set to track unique IDs

    lines.forEach((line, index) => {
        if (!line.trim()) return;
        
        // Skip header row (Index 0) strictly as requested
        if (index === 0) return;

        const parts = parseCSVLine(line);
        
        if (parts.length >= 2) {
            // Mapping per user request: 
            // Column A (index 0) = French
            // Column B (index 1) = Thai
            const french = parts[0];
            const thai = parts[1];
            
            if (thai && french) {
                const id = generateId(thai, french);
                
                // DEDUPLICATION: Only add the card if we haven't seen this ID before
                if (!seenIds.has(id)) {
                    cards.push({
                        id,
                        thai,
                        french
                    });
                    seenIds.add(id);
                }
            }
        }
    });
    return cards;
};

export const fetchAndParseCSV = async (url: string): Promise<FlashcardData[]> => {
    let text = '';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        text = await response.text();

        // Cache the successful fetch result
        try {
            localStorage.setItem(CSV_CACHE_KEY, text);
        } catch (e) {
            console.warn("Failed to cache CSV data locally:", e);
        }

    } catch (error) {
        console.warn("Error fetching CSV from network, attempting to load from cache...", error);
        
        // Fallback: Try to load from localStorage
        const cachedText = localStorage.getItem(CSV_CACHE_KEY);
        if (cachedText) {
            console.log("Loaded CSV data from local cache.");
            text = cachedText;
        } else {
            // If no cache and no network, re-throw the error
            throw error;
        }
    }

    return parseCSVText(text);
};
