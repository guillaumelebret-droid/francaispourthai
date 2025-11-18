
import { FlashcardData } from '../types';

// Helper to generate a simple ID from content
const generateId = (thai: string, french: string): string => {
    return btoa(unescape(encodeURIComponent(`${thai}-${french}`))).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
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

export const fetchAndParseCSV = async (url: string): Promise<FlashcardData[]> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const text = await response.text();
        
        // Handle different newline formats (\n, \r\n, \r)
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
    } catch (error) {
        console.error("Error fetching CSV:", error);
        throw error;
    }
};
