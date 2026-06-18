import { getPublicVoiceConfig } from "@/lib/public-env";

export function stopVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
}

export function speakText(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voiceName?: string;
  }
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const value = text.trim();

  if (!value) {
    return;
  }

  const voiceConfig = getPublicVoiceConfig();

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(value);
  utterance.rate = options?.rate ?? 0.95;
  utterance.pitch = options?.pitch ?? 1;
  utterance.volume = options?.volume ?? 1;

  const selectedVoiceName = options?.voiceName || voiceConfig.voiceName;
  const voices = window.speechSynthesis.getVoices();

  if (selectedVoiceName) {
    const selectedVoice = voices.find((voice) => voice.name === selectedVoiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
}

