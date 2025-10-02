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
  taskTime: number | 'dynamic';
  onTaskTimeChange: (value: number | 'dynamic') => void;
  beepBefore: number | 'off';
  onBeepBeforeChange: (value: number | 'off') => void;
  deleteMode: 'all' | 'last';
  onDeleteModeChange: (value: 'all' | 'last') => void;
  beepVolume: number;
  onBeepVolumeChange: (value: number) => void;
  voiceVolume: number;
  onVoiceVolumeChange: (value: number) => void;
  showTimerBar: boolean;
  onShowTimerBarChange: (value: boolean) => void;
  onDone: () => void;
}

const allOperations = Object.values(Operation).filter(
  (v) => typeof v === 'number'
) as Operation[];

const beepVolumeLevels = [
    { label: 'Leise', value: 0.3 },
    { label: 'Mittel', value: 0.6 },
    { label: 'Laut', value: 1.0 },
];

const voiceVolumeLevels = [
    { label: 'Leise', value: 0.4 },
    { label: 'Mittel', value: 0.7 },
    { label: 'Laut', value: 1.0 },
];

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
  taskTime,
  onTaskTimeChange,
  beepBefore,
  onBeepBeforeChange,
  deleteMode,
  onDeleteModeChange,
  beepVolume,
  onBeepVolumeChange,
  voiceVolume,
  onVoiceVolumeChange,
  showTimerBar,
  onShowTimerBarChange,
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
           <p className="text-sm text-slate-400 mt-2 px-1">Ändern der Auswahl setzt die Komplexität auf 2.</p>
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
             <p className="text-sm text-slate-400 mt-2 px-1">Ändern der Komplexität aktiviert wieder alle Aufgabentypen.</p>
        </div>
        
        <div className="pt-6 border-t border-slate-700">
            <p className="text-slate-300 mb-3">Zeit pro Aufgabe:</p>
            <div className="flex flex-wrap gap-2 mb-4">
                {(['Statisch', 'Dynamisch'] as const).map(value => {
                    const id = `time-mode-${value}`;
                    const val = value === 'Statisch' ? (typeof taskTime === 'number' ? taskTime : 18) : 'dynamic';
                    const isChecked = (value === 'Dynamisch' && taskTime === 'dynamic') || (value === 'Statisch' && typeof taskTime === 'number');
                    return (
                        <div key={id}>
                            <input
                                type="radio"
                                id={id}
                                name="taskTimeMode"
                                value={String(val)}
                                checked={isChecked}
                                onChange={() => onTaskTimeChange(val)}
                                className="sr-only peer"
                            />
                            <label htmlFor={id} className="block cursor-pointer px-4 py-2 rounded-md transition bg-slate-700 peer-checked:bg-cyan-600 peer-checked:text-white hover:bg-slate-600">
                                {value}
                            </label>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-4">
                <input
                    type="range"
                    min="10"
                    max="60"
                    step="1"
                    value={typeof taskTime === 'number' ? taskTime : 18}
                    onChange={(e) => onTaskTimeChange(parseInt(e.target.value, 10))}
                    disabled={taskTime === 'dynamic'}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className={`font-bold w-20 text-center ${taskTime === 'dynamic' ? 'text-slate-500' : 'text-cyan-400'}`}>
                    {typeof taskTime === 'number' ? `${taskTime}s` : 'Dynamisch'}
                </span>
            </div>
            {taskTime === 'dynamic' && <p className="text-sm text-slate-400 mt-2 px-1">Die Zeit wird intelligent basierend auf der Komplexität der Aufgabe berechnet.</p>}
        </div>

        <div className="pt-6 border-t border-slate-700">
            <p className="text-slate-300 mb-3">Warnton vor Zeitablauf:</p>
             <div className="flex flex-wrap gap-2">
                {(['Aus', 3, 5, 7, 10] as const).map(value => {
                    const id = `beep-${value}`;
                    const val = value === 'Aus' ? 'off' : value;
                    return (
                        <div key={id}>
                            <input
                                type="radio"
                                id={id}
                                name="beepBefore"
                                value={String(val)}
                                checked={beepBefore === val}
                                onChange={() => onBeepBeforeChange(val)}
                                className="sr-only peer"
                            />
                            <label htmlFor={id} className="block cursor-pointer px-4 py-2 rounded-md transition bg-slate-700 peer-checked:bg-cyan-600 peer-checked:text-white hover:bg-slate-600">
                                {value === 'Aus' ? value : `${value}s`}
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>
        
        <div className="pt-6 border-t border-slate-700">
            <p className="text-slate-300 mb-3">Warnton Lautstärke:</p>
             <div className="flex flex-wrap gap-2">
                {beepVolumeLevels.map(({ label, value }) => {
                    const id = `volume-${label}`;
                    return (
                        <div key={id}>
                            <input
                                type="radio"
                                id={id}
                                name="beepVolume"
                                value={value}
                                checked={beepVolume === value}
                                onChange={() => onBeepVolumeChange(value)}
                                className="sr-only peer"
                            />
                            <label htmlFor={id} className="block cursor-pointer px-4 py-2 rounded-md transition bg-slate-700 peer-checked:bg-cyan-600 peer-checked:text-white hover:bg-slate-600">
                                {label}
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>

         <div className="pt-6 border-t border-slate-700">
            <p className="text-slate-300 mb-3">Stimme Lautstärke:</p>
             <div className="flex flex-wrap gap-2">
                {voiceVolumeLevels.map(({ label, value }) => {
                    const id = `voice-volume-${label}`;
                    return (
                        <div key={id}>
                            <input
                                type="radio"
                                id={id}
                                name="voiceVolume"
                                value={value}
                                checked={voiceVolume === value}
                                onChange={() => onVoiceVolumeChange(value)}
                                className="sr-only peer"
                            />
                            <label htmlFor={id} className="block cursor-pointer px-4 py-2 rounded-md transition bg-slate-700 peer-checked:bg-cyan-600 peer-checked:text-white hover:bg-slate-600">
                                {label}
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="pt-6 border-t border-slate-700">
            <p className="text-slate-300 mb-3">Verhalten der "Löschen"-Taste:</p>
             <div className="flex flex-wrap gap-2">
                {(['Alles', 'Letzte Ziffer'] as const).map(value => {
                    const id = `delete-mode-${value}`;
                    const val = value === 'Alles' ? 'all' : 'last';
                    return (
                        <div key={id}>
                            <input
                                type="radio"
                                id={id}
                                name="deleteMode"
                                value={val}
                                checked={deleteMode === val}
                                onChange={() => onDeleteModeChange(val)}
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
        
        <div className="pt-6 border-t border-slate-700">
          <label className="flex items-center p-3 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition">
            <input
              type="checkbox"
              checked={showTimerBar}
              onChange={() => onShowTimerBarChange(!showTimerBar)}
              className="w-5 h-5 rounded text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-600"
            />
            <span className="ml-3 text-slate-200">Verbleibende Zeit anzeigen</span>
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