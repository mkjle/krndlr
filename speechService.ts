let germanVoice: SpeechSynthesisVoice | null = null;

const setGermanVoice = () => {
  if (!window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  const germanVoices = voices.filter(voice => voice.lang === 'de-DE' || voice.lang.startsWith('de-'));

  // Prefer voices with names that suggest they are male
  const preferredMaleNames = ['Stefan', 'Yannick', 'Google Deutsch'];
  let foundVoice: SpeechSynthesisVoice | undefined;

  for (const name of preferredMaleNames) {
    foundVoice = germanVoices.find(v => v.name.includes(name));
    if (foundVoice) break;
  }

  // Fallback to any voice that might be labeled "Male"
  if (!foundVoice) {
    foundVoice = germanVoices.find(v => v.name.toLowerCase().includes('male'));
  }

  // Final fallback to the first available German voice
  if (!foundVoice) {
    foundVoice = germanVoices[0];
  }
  
  if (foundVoice) {
    germanVoice = foundVoice;
  }
};

if (typeof window !== 'undefined' && window.speechSynthesis) {
  // Voices may load asynchronously.
  if (window.speechSynthesis.getVoices().length > 0) {
    setGermanVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = setGermanVoice;
  }
}

export const speak = (text: string, volume: number = 1.0): Promise<void> => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      console.warn("Speech Synthesis not supported by this browser.");
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Ensure the German voice is set if it was loaded asynchronously
    if (!germanVoice) {
      setGermanVoice();
    }

    if (germanVoice) {
      utterance.voice = germanVoice;
    }
    
    utterance.lang = 'de-DE';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.volume = volume; // Set the volume

    utterance.onend = () => {
      resolve();
    };
    
    utterance.onerror = (event) => {
      // 'canceled' is a common error when window.speechSynthesis.cancel() is called.
      // We can safely ignore it and resolve the promise.
      if ((event as SpeechSynthesisErrorEvent).error === 'canceled') {
        resolve();
        return;
      }
      console.error("SpeechSynthesisUtterance.onerror", event);
      resolve(); // Resolve anyway to not block the app
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
};