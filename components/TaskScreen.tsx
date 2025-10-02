import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Task, Operation } from '../types';
import { speak } from '../speechService';

interface TaskScreenProps {
  task: Task;
  taskNumber: number;
  totalTasks: number;
  onComplete: (userAnswer: number | null, isCorrect: boolean, durationMs: number) => void;
  isDelayEnabled: boolean;
  isImmediateFeedbackEnabled: boolean;
  taskTime: number | 'dynamic';
  beepBefore: number | 'off';
  onPlayBeep: () => void;
  onAbort: () => void;
  deleteMode: 'all' | 'last';
  voiceVolume: number;
  showTimerBar: boolean;
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

const getBaseTimeForOperation = (op: Operation): number => {
    switch (op) {
        case Operation.Add:
        case Operation.Subtract:
            return 15;
        case Operation.Multiply:
        case Operation.Divide:
        case Operation.Square:
            return 20;
        case Operation.Cube:
            return 23;
        case Operation.SquareRoot:
            return 25;
        default:
            return 15; // Fallback for any unknown operation
    }
};

const calculateDynamicTime = (task: Task): number => {
    // additionalOps is the number of operations beyond the first one.
    // For Square, Cube, Sqrt, numbers.length is 1, so additionalOps is -1.
    // For single chained operations (e.g. 1+2), numbers.length is 2, so additionalOps is 0.
    const additionalOps = task.numbers.length - 2;
    const primaryTime = getBaseTimeForOperation(task.operation);

    // This handles tasks with only 1 operation (e.g. 1+2, 100/5, sqrt(25)).
    if (additionalOps <= 0) {
        return primaryTime;
    }

    // Special case: For a chain of ONLY additions, subsequent additions get half time.
    const isPureAdditionChain = task.operation === Operation.Add && !task.questionText.includes('-');
    if (isPureAdditionChain) {
        const additionalTime = additionalOps * (15 / 2); // 7.5s for each extra addition
        return Math.round(primaryTime + additionalTime);
    }
    
    // Default case: Sum of the time for the primary operation and the full time for all subsequent operations.
    // Subsequent operations are always Add or Subtract, which have a base time of 15.
    const additionalTime = additionalOps * 15;
    const totalTime = primaryTime + additionalTime;
    
    return Math.round(totalTime);
};


export const TaskScreen: React.FC<TaskScreenProps> = ({ task, taskNumber, totalTasks, onComplete, isDelayEnabled, isImmediateFeedbackEnabled, taskTime, beepBefore, onPlayBeep, onAbort, deleteMode, voiceVolume, showTimerBar }) => {
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pressingKey, setPressingKey] = useState<string | null>(null);
  const [timerProgress, setTimerProgress] = useState(100);
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

    if (isImmediateFeedbackEnabled) {
      setFeedback(isCorrect ? 'correct' : 'incorrect');
    }

    const feedbackDelay = isImmediateFeedbackEnabled ? 1200 : 500;
    setTimeout(() => {
      onCompleteRef.current(userAnswer, isCorrect, durationMs);
    }, feedbackDelay);
  }, [isSubmitting, task.answer, isImmediateFeedbackEnabled]);

  const inputValueRef = useRef(inputValue);
  useEffect(() => {
    inputValueRef.current = inputValue;
  }, [inputValue]);

  const submitAnswerRef = useRef(submitAnswer);
  useEffect(() => {
    submitAnswerRef.current = submitAnswer;
  }, [submitAnswer]);


  useEffect(() => {
    let beepTimer: ReturnType<typeof setTimeout> | undefined;
    let submitTimer: ReturnType<typeof setTimeout> | undefined;
    let progressInterval: ReturnType<typeof setInterval> | undefined;

    const startTimersAndMeasurement = () => {
        // Start measuring time only after the question has been read
        startTimeRef.current = Date.now();

        const totalTimeS = taskTime === 'dynamic' ? calculateDynamicTime(task) : taskTime;
        const totalTimeMs = totalTimeS * 1000;

        if (beepBefore !== 'off' && totalTimeS > beepBefore) {
            beepTimer = setTimeout(onPlayBeep, totalTimeMs - (beepBefore * 1000));
        }

        submitTimer = setTimeout(() => {
            submitAnswerRef.current(inputValueRef.current);
        }, totalTimeMs);
        
        if (showTimerBar) {
            progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current;
                const remaining = Math.max(0, totalTimeMs - elapsed);
                const progress = (remaining / totalTimeMs) * 100;
                setTimerProgress(progress);
            }, 50);
        }
    };

    // Speak the question, and *then* start the timers.
    speak(task.questionSpeech, voiceVolume).then(startTimersAndMeasurement);

    return () => {
        if (beepTimer) clearTimeout(beepTimer);
        if (submitTimer) clearTimeout(submitTimer);
        if (progressInterval) clearInterval(progressInterval);
        window.speechSynthesis.cancel();
    };
  }, [task, onPlayBeep, taskTime, beepBefore, voiceVolume, showTimerBar]);

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
      if (deleteMode === 'all') {
        setInputValue('');
      } else {
        setInputValue(prev => prev.slice(0, -1));
      }
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
         {showTimerBar && (
            <div className="w-full bg-slate-700 rounded-full h-4 mt-3 transition-opacity duration-300">
                <div 
                    className="bg-yellow-500 h-4 rounded-full" 
                    style={{ width: `${timerProgress}%`, transition: 'width 0.05s linear' }}>
                </div>
            </div>
        )}
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