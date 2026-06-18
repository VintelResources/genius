"use client";

import { useMemo, useRef, useState } from "react";

type LanguageId = "ru" | "fr" | "en" | "es" | "la" | "af" | "sw" | "zh" | "yo";

type LanguageOption = {
  id: LanguageId;
  name: string;
  nativeName: string;
  locale: string;
  flag: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const LANGUAGES: LanguageOption[] = [
  { id: "ru", name: "Russian", nativeName: "Русский", locale: "ru-RU", flag: "🇷🇺" },
  { id: "fr", name: "French", nativeName: "Français", locale: "fr-FR", flag: "🇫🇷" },
  { id: "en", name: "English", nativeName: "English", locale: "en-US", flag: "🇬🇧" },
  { id: "es", name: "Spanish", nativeName: "Español", locale: "es-ES", flag: "🇪🇸" },
  { id: "la", name: "Latin", nativeName: "Latina", locale: "la", flag: "🏛️" },
  { id: "af", name: "Afrikaans", nativeName: "Afrikaans", locale: "af-ZA", flag: "🇿🇦" },
  { id: "sw", name: "Swahili", nativeName: "Kiswahili", locale: "sw-TZ", flag: "🇹🇿" },
  { id: "zh", name: "Chinese", nativeName: "中文", locale: "zh-CN", flag: "🇨🇳" },
  { id: "yo", name: "Yoruba", nativeName: "Yorùbá", locale: "yo-NG", flag: "🇳🇬" }
];

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
  }

  interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent {
    error: string;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly length: number;
    readonly isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
}

export default function LanguagesView() {
  const [selectedLanguageId, setSelectedLanguageId] = useState<LanguageId>("fr");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const selectedLanguage = useMemo(
    () => LANGUAGES.find((language) => language.id === selectedLanguageId) ?? LANGUAGES[0],
    [selectedLanguageId]
  );

  function speakText(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage.locale;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  function startVoiceInput() {
    if (typeof window === "undefined") {
      return;
    }

    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!RecognitionCtor) {
      setError("Voice input is not available in this browser.");
      return;
    }

    setError(null);

    const recognition = new RecognitionCtor();
    recognition.lang = selectedLanguage.locale;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length })
        .map((_, index) => event.results[index]?.[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (transcript) {
        setPrompt((current) => [current, transcript].filter(Boolean).join(" ").trim());
      }
    };

    recognition.onerror = (event) => {
      setError(`Voice input failed: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  function stopVoiceInput() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  async function askLanguageCoach() {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmedPrompt
    };

    setMessages((current) => [...current, userMessage]);

    try {
      const response = await fetch("/api/languages-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          languageId: selectedLanguage.id,
          languageName: selectedLanguage.name,
          locale: selectedLanguage.locale,
          message: trimmedPrompt,
          history: messages
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "The language coach request failed.");
      }

      const payload = await response.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: payload.reply
      };

      setMessages((current) => [...current, assistantMessage]);
      setPrompt("");

      if (payload.reply) {
        speakText(payload.reply);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await askLanguageCoach();
  }

  const starterPrompts = [
    `Teach me basic greetings in ${selectedLanguage.name}.`,
    `Explain how to introduce myself in ${selectedLanguage.name}.`,
    `Give me a short beginner lesson in ${selectedLanguage.name}.`,
    `Correct my sentence and explain the grammar in ${selectedLanguage.name}.`
  ];

  return (
    <section className="fg-card p-5 lg:p-6 text-white">
      <div className="flex flex-col gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Languages AI</div>
          <h2 className="mt-2 text-3xl font-black">Voice Language Coach</h2>
          <p className="mt-3 max-w-3xl text-sm text-white/70">
            Ask the AI to teach you in the selected language. You can type, speak, listen, and practice in real time.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {LANGUAGES.map((language) => {
            const active = language.id === selectedLanguageId;

            return (
              <button
                key={language.id}
                type="button"
                onClick={() => setSelectedLanguageId(language.id)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  active
                    ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-100"
                    : "border-white/10 bg-white/5 text-white"
                }`}
              >
                <div className="text-2xl">{language.flag}</div>
                <div className="mt-2 font-bold">{language.name}</div>
                <div className="text-sm text-white/70">{language.nativeName}</div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/70">
            Selected language: <span className="font-semibold text-white">{selectedLanguage.name}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {starterPrompts.map((starterPrompt) => (
              <button
                key={starterPrompt}
                type="button"
                onClick={() => setPrompt(starterPrompt)}
                className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/80 transition hover:bg-black/30"
              >
                {starterPrompt}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="mb-2 block text-sm font-semibold">Ask the language coach</label>

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={`Ask the AI to teach ${selectedLanguage.name}...`}
            className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white outline-none placeholder:text-white/40"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition disabled:opacity-50"
            >
              {isLoading ? "Teaching..." : "Ask AI"}
            </button>

            <button
              type="button"
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white"
            >
              {isListening ? "Stop Listening" : "Start Voice Input"}
            </button>

            <button
              type="button"
              onClick={() => {
                const lastAssistantMessage = [...messages].reverse().find((message) => message.role === "assistant");
                if (lastAssistantMessage) {
                  speakText(lastAssistantMessage.content);
                }
              }}
              className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white"
            >
              Speak Last Reply
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}
        </form>

        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
              No lesson yet. Ask something like: “Teach me greetings”, “Correct my sentence”, or “Explain past tense”.
            </div>
          ) : null}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-2xl border p-4 text-sm ${
                message.role === "assistant"
                  ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-50"
                  : "border-white/10 bg-black/20 text-white"
              }`}
            >
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/50">
                {message.role === "assistant" ? "AI Teacher" : "You"}
              </div>
              <div className="whitespace-pre-wrap leading-6">{message.content}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}




