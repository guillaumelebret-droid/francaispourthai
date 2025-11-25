
import { FlashcardData, FlashcardDetails } from '../types';

const CSV_CACHE_KEY = 'thai_french_csv_cache';

// Helper to generate a unique ID from content
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

// Robust CSV line parser that handles quotes
const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    
    return result.map(s => s.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
};

const parseCSVText = (text: string): FlashcardData[] => {
    const lines = text.split(/\r?\n/);
    const cards: FlashcardData[] = [];
    const seenIds = new Set<string>();

    lines.forEach((line, index) => {
        if (!line.trim()) return;
        
        // Skip header row
        if (index === 0) return;

        const parts = parseCSVLine(line);
        
        if (parts.length >= 2) {
            // Column Mapping:
            // 0: French
            // 1: Thai
            // 2-7: Info Lines (C, D, E, F, G, H)
            // 8: Passé Composé (I)
            const french = parts[0];
            const thai = parts[1];
            
            // Extract Extras
            const infoLines = parts.slice(2, 8).filter(s => s && s.trim() !== '');
            const passeCompose = parts[8] && parts[8].trim() !== '' ? parts[8] : undefined;

            let extras: FlashcardDetails | undefined = undefined;
            if (infoLines.length > 0 || passeCompose) {
                extras = {
                    infoLines,
                    passeCompose
                };
            }
            
            if (thai && french) {
                const id = generateId(thai, french);
                
                if (!seenIds.has(id)) {
                    cards.push({
                        id,
                        thai,
                        french,
                        extras
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

        try {
            localStorage.setItem(CSV_CACHE_KEY, text);
        } catch (e) {
            console.warn("Failed to cache CSV data locally:", e);
        }

    } catch (error) {
        console.warn("Error fetching CSV from network, attempting to load from cache...", error);
        
        const cachedText = localStorage.getItem(CSV_CACHE_KEY);
        if (cachedText) {
            console.log("Loaded CSV data from local cache.");
            text = cachedText;
        } else {
            throw error;
        }
    }

    return parseCSVText(text);
};
