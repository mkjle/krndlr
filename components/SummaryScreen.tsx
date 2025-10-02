import React from 'react';
import type { UserAnswer } from '../types';

interface SummaryScreenProps {
  results: UserAnswer[];
  onStartNewRun: () => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ results, onStartNewRun }) => {
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const totalTasks = results.length;
  const scorePercentage = totalTasks > 0 ? ((correctAnswers / totalTasks) * 100).toFixed(0) : 0;

  const totalTime = results.reduce((acc, r) => acc + (r.durationMs || 0), 0);
  const averageTimeSeconds = totalTasks > 0 ? (totalTime / totalTasks / 1000).toFixed(1) : '0.0';

  return (
    <div className="w-full p-6 bg-slate-800 rounded-lg shadow-xl animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">Runde abgeschlossen!</h1>
          <p className="text-xl text-slate-300 mt-2">
            Dein Ergebnis: {correctAnswers} / {totalTasks} (<span className="font-bold text-cyan-400">{scorePercentage}%</span>)
          </p>
           <p className="text-lg text-slate-400 mt-1">
            Durchschnittliche Zeit: <span className="font-semibold text-white">{averageTimeSeconds}s</span>
          </p>
        </div>
        <button
          onClick={onStartNewRun}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 mt-1"
        >
          Neue Runde starten
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2">
        <div className="space-y-3">
          {results.map(({ task, userAnswer, isCorrect, durationMs }, index) => (
            <div key={task.id} className={`p-4 rounded-md flex items-center justify-between ${isCorrect ? 'bg-green-900/40' : 'bg-red-900/40'}`}>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 font-mono text-lg">{String(index + 1).padStart(2, '0')}</span>
                <p className="font-mono text-lg text-slate-200">{task.questionText.replace('?', '')}</p>
                <p className="font-mono text-lg text-slate-200 font-bold">{task.answer}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 w-20 text-right">{(durationMs / 1000).toFixed(1)}s</span>
                <span className={`font-mono text-lg w-48 text-right ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                  Deine Antwort: {userAnswer ?? '—'}
                </span>
                {isCorrect ? <CheckIcon /> : <XIcon />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};