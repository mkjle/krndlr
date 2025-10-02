import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
  onShowOptions: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onShowOptions }) => {
  return (
    <div className="text-center p-8 bg-slate-800 rounded-lg shadow-xl animate-fade-in">
      <h1 className="text-4xl font-bold text-cyan-400 mb-4">Kopfrechnen</h1>
      <p className="text-lg text-slate-300 mb-8">
        Kopfrechnen für den DLR-Test. Die Aufgabe wird nur vorgelesen.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onShowOptions}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-500"
        >
          Optionen
        </button>
        <button
          onClick={onStart}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-500"
        >
          Neue Runde starten
        </button>
      </div>
    </div>
  );
};