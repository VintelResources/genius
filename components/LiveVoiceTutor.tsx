"use client";

import React from 'react';
const { useState, useEffect, useRef } = React;
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { UserLevel } from '../types';
import type { Subject } from '../types';
import { decode, decodeAudioData, createBlob } from '../services/geminiService';

interface LiveVoiceTutorProps {
  userLevel: UserLevel;
  activeSubject?: Subject;
  onClose: () => void;
}

const LiveVoiceTutor: React.FC<LiveVoiceTutorProps> = ({ userLevel, activeSubject, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcriptions, setTranscriptions] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('Ready to start conversation');
  const [inputLevel, setInputLevel] = useState(0);
  
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const stopAllAudio = () => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const startSession = async () => {
    setIsConnecting(true);
    setStatus('Initializing secure voice link...');
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    try {
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            setStatus('Neural connection established. Speak now.');
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setInputLevel(Math.sqrt(sum / inputData.length));

              const pcmBlob = createBlob([inputData.buffer]);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob as any });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const userText = currentInputTranscriptionRef.current;
              const modelText = currentOutputTranscriptionRef.current;
              if (userText) setTranscriptions(prev => [...prev, `You: ${userText}`]);
              if (modelText) setTranscriptions(prev => [...prev, `Genius: ${modelText}`]);
              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
            }

            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString));
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer as unknown as AudioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += (audioBuffer as unknown as AudioBuffer).duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              stopAllAudio();
            }
          },
          onerror: (e) => {
            console.error('Live API Error:', e);
            setStatus('Connection error. Retrying...');
          },
          onclose: () => {
            setIsActive(false);
            setStatus('Conversation ended.');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: userLevel === UserLevel.KINDERGARTEN ? 'Puck' : 'Zephyr' } },
          },
          systemInstruction: `You are a friendly real-time tutor for a ${userLevel} student focusing on ${activeSubject || 'general learning'}.`,
        },
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start Live session:', err);
      setIsConnecting(false);
      setStatus('Failed to access microphone.');
    }
  };

  const endSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    stopAllAudio();
    setIsActive(false);
  };

  useEffect(() => {
    return () => endSession();
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 text-white overflow-hidden">
      <div className="absolute top-10 right-10">
        <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
        </button>
      </div>

      <div className="max-w-2xl w-full text-center flex flex-col items-center gap-12">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className={`w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center shadow-z-10 transition-transform ${isActive ? 'animate-pulse' : ''}`}>
            <span className="text-5xl">{isActive ? 'ðŸ‘‚' : 'ðŸŽ™ï¸'}</span>
          </div>
        </div>

        <div className="space-y-6 w-full">
          <p className="text-xl font-bold">{status}</p>
          <div className="flex gap-4 justify-center">
            {!isActive ? (
              <button onClick={startSession} disabled={isConnecting} className="bg-indigo-600 text-white px-12 py-6 rounded-3xl font-black text-xl">Start</button>
            ) : (
              <button onClick={endSession} className="bg-rose-600 text-white px-12 py-6 rounded-3xl font-black text-xl">End</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceTutor;










