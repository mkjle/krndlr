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

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Welcome);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [enabledOperations, setEnabledOperations] = useState<Set<Operation>>(
    new Set(allOperations)
  );
  const [isDelayEnabled, setIsDelayEnabled] = useState<boolean>(true);

  const startNewRun = useCallback(() => {
    const newTasks = generateRun(Array.from(enabledOperations));
    setTasks(newTasks);
    setUserAnswers([]);
    setCurrentTaskIndex(0);
    setGameState(GameState.Task);
  }, [enabledOperations]);
  
  const toggleDelay = () => setIsDelayEnabled(prev => !prev);

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
            onAbort={abortRun}
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