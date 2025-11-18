
// The URL provided by the user, converted to CSV export format
// Original: https://docs.google.com/spreadsheets/d/1pZPaw490yIO7Oy9UfPNkslw-Og6LlldexTgDInbp1Wo/edit?usp=sharing
export const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1pZPaw490yIO7Oy9UfPNkslw-Og6LlldexTgDInbp1Wo/export?format=csv";

export const FALLBACK_DATA_URL = "https://raw.githubusercontent.com/gist/placeholder/vocab.csv"; 

// Mock data is only used if the URL above contains '123456789' or if fetching fails in dev modes specific configs.
// Structure updated to: French (Col A), Thai (Col B)
export const MOCK_CSV_CONTENT = `
French,Thai
Bonjour,สวัสดี
Merci,ขอบคุณ
Oui,ใช่
Non,ไม่
`;