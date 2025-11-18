
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
// If the utterance object is garbage collected before speech ends, it stops abruptly.
let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speakFrench = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn("Web Speech API not supported.");
        return;
    }

    // 1. Cancel any ongoing speech to prevent queue buildup
    window.speechSynthesis.cancel();

    // 2. Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance; // Keep strong reference

    // 3. Configure basic settings
    utterance.lang = 'fr-FR';
    utterance.rate = 0.85; // Slightly slower for learning
    utterance.pitch = 1;

    // 4. Attempt to select a high-quality French voice
    // Sometimes voices array is empty on first load, try to fetch again
    if (voices.length === 0) {
        populateVoices();
    }

    const frenchVoice = 
        voices.find(v => v.name === 'Google français') || // Android high quality
        voices.find(v => v.name.includes('Thomas')) || // iOS high quality
        voices.find(v => v.lang === 'fr-FR' && !v.localService) || // Network voices usually better
        voices.find(v => v.lang === 'fr-FR') ||
        voices.find(v => v.lang.startsWith('fr'));
    
    if (frenchVoice) {
        utterance.voice = frenchVoice;
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
