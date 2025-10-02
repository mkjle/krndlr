import React from 'react';
import { Operation, operationNames } from '../types';

interface OptionsScreenProps {
  enabledOperations: Set<Operation>;
  onToggleOperation: (operation: Operation) => void;
  isDelayEnabled: boolean;
  onToggleDelay: () => void;
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
  onDone,
}) => {
  return (
    <div className="w-full p-6 bg-slate-800 rounded-lg shadow-xl animate-fade-in">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Optionen</h1>
      
      <div className="space-y-4 mb-8">
        <p className="text-slate-300">Wähle die Aufgabentypen aus, die du trainieren möchtest.</p>
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

        <div className="pt-4 border-t border-slate-700">
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