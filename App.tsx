import React, { useState, useCallback } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TaskScreen } from './components/TaskScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { OptionsScreen } from './components/OptionsScreen';
import { generateRun } from './services/taskGenerator';
import type { Task, UserAnswer } from './types';
import { GameState, Operation } from './types';

const allOperations = Object.values(Operation).filter(
  (v) => typeof v === 'number'
) as Operation[];

// --- Audio Service Logic using HTMLAudioElement ---

let beepAudioElement: HTMLAudioElement | null = null;

/**
 * Generates a WAV audio file as a base64 Data URI.
 * This is more reliable for simple sounds than Web Audio API across some browsers.
 */
const createWavDataUri = (): string => {
    const sampleRate = 44100;
    const durationSeconds = 0.7; // A single, longer beep
    const frequency = 660; // E5 note, less piercing than before
    const volume = 0.5;

    const numFrames = Math.floor(sampleRate * durationSeconds);
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit audio
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numFrames * blockAlign;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + dataSize, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // "fmt " sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // Sub-chunk size
    view.setUint16(20, 1, true); // Audio format (1 = PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true); // Bits per sample

    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataSize, true);

    // PCM data
    let offset = 44;
    for (let i = 0; i < numFrames; i++) {
        const angle = (i / sampleRate) * frequency * 2 * Math.PI;
        const sample = Math.sin(angle) * volume * 32767;
        view.setInt16(offset, sample, true);
        offset += bytesPerSample;
    }

    // Convert to base64
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = window.btoa(binary);

    return `data:audio/wav;base64,${base64}`;
};


/**
 * Initializes the audio system. Must be called from a user gesture (e.g., button click)
 * to create the audio element.
 */
const initAudio = (): void => {
  if (beepAudioElement) {
    return;
  }
  
  try {
    beepAudioElement = new Audio(createWavDataUri());
  } catch (e) {
    console.error("Failed to create audio element.", e);
  }
};

/**
 * Plays the warning beep sound.
 * @param volume - The volume of the beep, from 0.0 to 1.0.
 */
const playBeep = (volume: number): void => {
  if (!beepAudioElement) {
    console.warn('Audio not initialized. Cannot play beep. Ensure initAudio() was called on a user gesture.');
    return;
  }

  beepAudioElement.currentTime = 0;
  beepAudioElement.volume = volume;
  beepAudioElement.play().catch(e => console.error("Audio playback failed", e));
};
// --- End of Audio Service Logic ---


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Welcome);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [enabledOperations, setEnabledOperations] = useState<Set<Operation>>(
    new Set(allOperations)
  );
  const [isDelayEnabled, setIsDelayEnabled] = useState<boolean>(true);
  const [taskComplexity, setTaskComplexity] = useState<number | 'random'>('random');
  const [isImmediateFeedbackEnabled, setIsImmediateFeedbackEnabled] = useState<boolean>(true);
  const [numberOfTasks, setNumberOfTasks] = useState<number>(20);
  const [taskTime, setTaskTime] = useState<number | 'dynamic'>('dynamic');
  const [beepBefore, setBeepBefore] = useState<number | 'off'>(5);
  const [deleteMode, setDeleteMode] = useState<'all' | 'last'>('all');
  const [beepVolume, setBeepVolume] = useState<number>(1.0);
  const [voiceVolume, setVoiceVolume] = useState<number>(1.0);
  const [showTimerBar, setShowTimerBar] = useState<boolean>(false);

  const playBeepSound = useCallback(() => {
    playBeep(beepVolume);
  }, [beepVolume]);

  const startNewRun = useCallback(() => {
    // Initialize/resume AudioContext on user gesture.
    initAudio(); 

    const newTasks = generateRun(Array.from(enabledOperations), numberOfTasks, taskComplexity);
    setTasks(newTasks);
    setUserAnswers([]);
    setCurrentTaskIndex(0);
    setGameState(GameState.Task);
  }, [enabledOperations, taskComplexity, numberOfTasks]);
  
  const toggleDelay = () => setIsDelayEnabled(prev => !prev);
  const toggleImmediateFeedback = () => setIsImmediateFeedbackEnabled(prev => !prev);

  const abortRun = () => {
    window.speechSynthesis.cancel();
    setGameState(GameState.Welcome);
  };

  const handleToggleOperation = (operation: Operation) => {
    setEnabledOperations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(operation)) {
        if (newSet.size > 1) {
          newSet.delete(operation);
        }
      } else {
        newSet.add(operation);
      }
      return newSet;
    });
    // Lock complexity to 2 whenever operations are manually changed
    setTaskComplexity(2);
  };
  
  const handleTaskComplexityChange = (complexity: number | 'random') => {
    setTaskComplexity(complexity);
    // When complexity is changed, re-enable all operations for a full challenge
    setEnabledOperations(new Set(allOperations));
  };


  const handleTaskCompletion = useCallback((userAnswer: number | null, isCorrect: boolean, durationMs: number) => {
    setUserAnswers(prev => [...prev, { task: tasks[currentTaskIndex], userAnswer, isCorrect, durationMs }]);
    
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      setGameState(GameState.Summary);
    }
  }, [currentTaskIndex, tasks]);
  
  const showOptions = () => setGameState(GameState.Options);
  const showWelcome = () => setGameState(GameState.Welcome);

  const renderContent = () => {
    switch (gameState) {
      case GameState.Task:
        return (
          <TaskScreen
            key={currentTaskIndex}
            task={tasks[currentTaskIndex]}
            taskNumber={currentTaskIndex + 1}
            totalTasks={tasks.length}
            onComplete={handleTaskCompletion}
            isDelayEnabled={isDelayEnabled}
            isImmediateFeedbackEnabled={isImmediateFeedbackEnabled}
            taskTime={taskTime}
            beepBefore={beepBefore}
            onPlayBeep={playBeepSound}
            onAbort={abortRun}
            deleteMode={deleteMode}
            voiceVolume={voiceVolume}
            showTimerBar={showTimerBar}
          />
        );
      case GameState.Summary:
        return (
          <SummaryScreen
            results={userAnswers}
            onStartNewRun={startNewRun}
          />
        );
      case GameState.Options:
        return (
            <OptionsScreen 
                enabledOperations={enabledOperations}
                onToggleOperation={handleToggleOperation}
                isDelayEnabled={isDelayEnabled}
                onToggleDelay={toggleDelay}
                isImmediateFeedbackEnabled={isImmediateFeedbackEnabled}
                onToggleImmediateFeedback={toggleImmediateFeedback}
                taskComplexity={taskComplexity}
                onTaskComplexityChange={handleTaskComplexityChange}
                numberOfTasks={numberOfTasks}
                onNumberOfTasksChange={setNumberOfTasks}
                taskTime={taskTime}
                onTaskTimeChange={setTaskTime}
                beepBefore={beepBefore}
                onBeepBeforeChange={setBeepBefore}
                deleteMode={deleteMode}
                onDeleteModeChange={setDeleteMode}
                beepVolume={beepVolume}
                onBeepVolumeChange={setBeepVolume}
                voiceVolume={voiceVolume}
                onVoiceVolumeChange={setVoiceVolume}
                showTimerBar={showTimerBar}
                onShowTimerBarChange={setShowTimerBar}
                onDone={showWelcome}
            />
        );
      case GameState.Welcome:
      default:
        return <WelcomeScreen onStart={startNewRun} onShowOptions={showOptions} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-2xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;