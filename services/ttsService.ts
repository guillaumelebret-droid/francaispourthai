
// Variable to hold the voices
let voices: SpeechSynthesisVoice[] = [];

// Function to populate voices
const populateVoices = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        voices = window.speechSynthesis.getVoices();
    }
};

// Initialize listeners immediately
if (typeof window !== 'undefined' && window.speechSynthesis) {
    populateVoices();
    // Chrome/Safari load voices asynchronously
    window.speechSynthesis.onvoiceschanged = populateVoices;
}

// FIX: Global reference to prevent Garbage Collection bug in Chrome
let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speakText = (text: string, lang: 'fr' | 'th') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn("Web Speech API not supported.");
        return;
    }

    // 1. Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // 2. Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance; // Keep strong reference

    // 3. Configure basic settings based on language
    if (lang === 'fr') {
        utterance.lang = 'fr-FR';
        utterance.rate = 0.85;
    } else {
        utterance.lang = 'th-TH';
        utterance.rate = 0.8; // Thai can be fast, slow it down a bit
    }
    utterance.pitch = 1;

    // 4. Attempt to select a high-quality voice
    if (voices.length === 0) {
        populateVoices();
    }

    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (lang === 'fr') {
        selectedVoice = 
            voices.find(v => v.name === 'Google français') || 
            voices.find(v => v.name.includes('Thomas')) || 
            voices.find(v => v.lang === 'fr-FR' && !v.localService) || 
            voices.find(v => v.lang === 'fr-FR') ||
            voices.find(v => v.lang.startsWith('fr'));
    } else {
        // Thai Voice Selection
        selectedVoice = 
            voices.find(v => v.lang === 'th-TH' && !v.localService) ||
            voices.find(v => v.lang === 'th-TH') ||
            voices.find(v => v.lang.startsWith('th'));
    }
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    // 5. Cleanup reference when done
    utterance.onend = () => {
        currentUtterance = null;
    };
    
    utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        currentUtterance = null;
    };

    // 6. Speak
    window.speechSynthesis.speak(utterance);
};

// Keep for backward compatibility if needed, simply wraps the new function
export const speakFrench = (text: string) => speakText(text, 'fr');
