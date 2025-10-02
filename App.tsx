import React, { useState, useCallback, useRef } from 'react';
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
  const [beepVolume, setBeepVolume] = useState<number>(0.6);
  const [voiceVolume, setVoiceVolume] = useState<number>(1.0);
  const [showTimerBar, setShowTimerBar] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeepSound = useCallback(() => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // "schrilles" & "aggressiv" -> higher frequency and square wave
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(2800, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(beepVolume, audioCtx.currentTime);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.7);
  }, [beepVolume]);

  const startNewRun = useCallback(() => {
    // Initialize AudioContext on first user interaction
    if (!audioCtxRef.current) {
        try {
             audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
        }
    }

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