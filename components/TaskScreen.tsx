import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Task } from '../types';
import { speak } from '../services/speechService';

interface TaskScreenProps {
  task: Task;
  taskNumber: number;
  totalTasks: number;
  onComplete: (userAnswer: number | null, isCorrect: boolean, durationMs: number) => void;
  isDelayEnabled: boolean;
  onAbort: () => void;
}

type FeedbackState = 'idle' | 'correct' | 'incorrect';

const getFeedbackClasses = (state: FeedbackState) => {
  switch (state) {
    case 'correct':
      return 'border-green-500 ring-green-500 text-green-300';
    case 'incorrect':
      return 'border-red-500 ring-red-500 text-red-300';
    default:
      return 'border-slate-600 text-gray-200';
  }
};

const playBeep = () => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (!audioCtx) return;

        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        oscillator.connect(audioCtx.destination);
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            audioCtx.close().catch(e => console.error("Error closing AudioContext", e));
        }, 200);
    } catch (e) {
        console.error("Could not play beep sound", e);
    }
};

export const TaskScreen: React.FC<TaskScreenProps> = ({ task, taskNumber, totalTasks, onComplete, isDelayEnabled, onAbort }) => {
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pressingKey, setPressingKey] = useState<string | null>(null);
  const startTimeRef = useRef(Date.now());
  
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const submitAnswer = useCallback((currentInput: string) => {
    if (isSubmitting) return;

    const durationMs = Date.now() - startTimeRef.current;
    setIsSubmitting(true);
    const finalInputValue = currentInput.trim();
    const userAnswer = (finalInputValue === '' || finalInputValue === '-') ? null : parseInt(finalInputValue, 10);
    const isCorrect = userAnswer !== null && userAnswer === task.answer;

    setFeedback(isCorrect ? 'correct' : 'incorrect');

    setTimeout(() => {
      onCompleteRef.current(userAnswer, isCorrect, durationMs);
    }, 1200);
  }, [isSubmitting, task.answer]);

  const inputValueRef = useRef(inputValue);
  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  const submitAnswerRef = useRef(submitAnswer);
  useEffect(() => {
    submitAnswerRef.current = submitAnswer;
  }, [submitAnswer]);


  useEffect(() => {
    speak(task.questionSpeech);

    const beepTimer = setTimeout(playBeep, 30000);

    const submitTimer = setTimeout(() => {
        submitAnswerRef.current(inputValueRef.current);
    }, 35000);

    return () => {
        clearTimeout(beepTimer);
        clearTimeout(submitTimer);
        window.speechSynthesis.cancel();
    };
  }, [task]);

  const handleDelayedInput = (action: () => void, key: string) => {
    if (isSubmitting || pressingKey) return;

    if (isDelayEnabled) {
      setPressingKey(key);
      setTimeout(() => {
        action();
        setPressingKey(null);
      }, 450);
    } else {
      action();
    }
  };
  
  const handleNumpadClick = (value: string) => {
    if (value === '-' && inputValue.length > 0) return;
    handleDelayedInput(() => {
      setInputValue(prev => prev + value);
    }, value);
  };

  const handleDelete = () => {
     handleDelayedInput(() => {
      setInputValue('');
    }, 'delete');
  };
  
  const handleOkClick = () => {
    if (inputValue.trim() === '' || inputValue.trim() === '-') return;
    submitAnswer(inputValue);
  };

  const numpadLayout = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="flex flex-col items-center p-6 bg-slate-800 rounded-lg shadow-xl w-full relative">
       <button 
        onClick={onAbort} 
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        aria-label="Runde abbrechen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="w-full mb-6 text-center">
        <p className="text-lg font-semibold text-cyan-400">Aufgabe {taskNumber} von {totalTasks}</p>
        <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1">
          <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(taskNumber / totalTasks) * 100}%` }}></div>
        </div>
      </div>

      <div className="h-24 flex items-center justify-center w-full mb-6" aria-hidden="true">
        {/* This space is intentionally left blank as the question is audio-only */}
      </div>

      <div className="w-full max-w-xs mx-auto">
        <div 
          className={`w-full text-center text-4xl p-3 bg-slate-900 border-2 rounded-md h-[72px] flex items-center justify-center font-mono transition-all duration-300 mb-4 ${getFeedbackClasses(feedback)}`}
          aria-label="Current Answer"
        >
          {inputValue || <span className="text-slate-500">...</span>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {numpadLayout.map(key => (
            <button key={key} onClick={() => handleNumpadClick(key)} disabled={isSubmitting} className="aspect-square text-3xl font-semibold rounded-lg transition-all duration-100 disabled:opacity-50 bg-slate-700 hover:bg-slate-600 active:bg-slate-500">
              {key}
            </button>
          ))}
          <button onClick={() => handleNumpadClick('-')} disabled={isSubmitting || inputValue.length > 0} className="aspect-square text-3xl font-semibold rounded-lg transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-700 hover:bg-slate-600 active:bg-slate-500">
            -
          </button>
          <button onClick={() => handleNumpadClick('0')} disabled={isSubmitting} className="aspect-square text-3xl font-semibold rounded-lg transition-all duration-100 disabled:opacity-50 bg-slate-700 hover:bg-slate-600 active:bg-slate-500">
            0
          </button>
          <button onClick={handleDelete} disabled={isSubmitting} className="aspect-square text-xl font-semibold rounded-lg transition-all duration-100 disabled:opacity-50 bg-rose-800 hover:bg-rose-700 active:bg-rose-600">
            Löschen
          </button>
        </div>

        <button
          onClick={handleOkClick}
          disabled={isSubmitting || inputValue.trim() === '' || inputValue.trim() === '-'}
          className="w-full bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-500 text-white font-bold py-4 px-6 rounded-lg text-xl transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          OK
        </button>
      </div>
    </div>
  );
};