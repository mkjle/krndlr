import React from 'react';
import { Operation, operationNames } from '../types';

interface OptionsScreenProps {
  enabledOperations: Set<Operation>;
  onToggleOperation: (operation: Operation) => void;
  isDelayEnabled: boolean;
  onToggleDelay: () => void;
  isImmediateFeedbackEnabled: boolean;
  onToggleImmediateFeedback: () => void;
  taskComplexity: number | 'random';
  onTaskComplexityChange: (value: number | 'random') => void;
  numberOfTasks: number;
  onNumberOfTasksChange: (value: number) => void;
  onDone: () => void;
}

const allOperations = Object.values(Operation).filter(
  (v) => typeof v === 'number'
) as Operation[];

export const OptionsScreen: React.FC<OptionsScreenProps> = ({
  enabledOperations,
  onToggleOperation,
  isDelayEnabled,
  onToggleDelay,
  isImmediateFeedbackEnabled,
  onToggleImmediateFeedback,
  taskComplexity,
  onTaskComplexityChange,
  numberOfTasks,
  onNumberOfTasksChange,
  onDone,
}) => {
  return (
    <div className="w-full p-6 bg-slate-800 rounded-lg shadow-xl animate-fade-in">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Optionen</h1>
      
      <div className="space-y-6 mb-8">
        <div>
          <p className="text-slate-300 mb-3">Wähle die Aufgabentypen aus, die du trainieren möchtest.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allOperations.map((op) => (
              <label
                key={op}
                className="flex items-center p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition"
              >
                <input
                  type="checkbox"
                  checked={enabledOperations.has(op)}
                  onChange={() => onToggleOperation(op)}
                  className="w-5 h-5 rounded text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-600"
                />
                <span className="ml-3 text-slate-200">{operationNames[op]}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-700">
          <p className="text-slate-300 mb-3">Anzahl der Aufgaben: <span className="font-bold text-cyan-400">{numberOfTasks}</span></p>
          <input
            type="range"
            min="5"
            max="40"
            step="1"
            value={numberOfTasks}
            onChange={(e) => onNumberOfTasksChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        <div className="pt-6 border-t border-slate-700">
            <p className="text-slate-300 mb-3">Komplexität (Anzahl der Rechenschritte):</p>
            <div className="flex flex-wrap gap-2">
                {(['Zufällig', 2, 3, 4, 5] as const).map(value => {
                    const id = `complexity-${value}`;
                    const val = value === 'Zufällig' ? 'random' : value;
                    return (
                        <div key={id}>
                            <input
                                type="radio"
                                id={id}
                                name="taskComplexity"
                                value={val}
                                checked={taskComplexity === val}
                                onChange={() => onTaskComplexityChange(val)}
                                className="sr-only peer"
                            />
                            <label htmlFor={id} className="block cursor-pointer px-4 py-2 rounded-md transition bg-slate-700 peer-checked:bg-cyan-600 peer-checked:text-white hover:bg-slate-600">
                                {value}
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="pt-6 border-t border-slate-700">
          <label className="flex items-center p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition">
            <input
              type="checkbox"
              checked={isDelayEnabled}
              onChange={onToggleDelay}
              className="w-5 h-5 rounded text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-600"
            />
            <span className="ml-3 text-slate-200">Tastenverzögerung (0.45s)</span>
          </label>
        </div>

         <div className="pt-6 border-t border-slate-700">
          <label className="flex items-center p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition">
            <input
              type="checkbox"
              checked={isImmediateFeedbackEnabled}
              onChange={onToggleImmediateFeedback}
              className="w-5 h-5 rounded text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-600"
            />
            <span className="ml-3 text-slate-200">Sofortiges Feedback</span>
          </label>
          <p className="text-sm text-slate-400 mt-2 px-3">Wenn deaktiviert, siehst du erst in der Zusammenfassung, was richtig war.</p>
        </div>
      </div>


      <div className="flex justify-end">
        <button
          onClick={onDone}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-8 rounded-lg text-lg transition-transform transform hover:scale-105"
        >
          Fertig
        </button>
      </div>
    </div>
  );
};