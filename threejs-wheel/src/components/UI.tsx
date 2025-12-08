import { useState } from 'react';
import { useStore } from '../store/useStore';

export const UI = () => {
  const { names, addNames, removeName, startSpin, isSpinning, winner, setWinner } = useStore();
  const [textInput, setTextInput] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      const newNames = textInput
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);
      
      if (newNames.length > 0) {
        addNames(newNames);
        setTextInput('');
      }
    }
  };

  const handleSpin = () => {
    if (!isSpinning && names.length > 0) {
      startSpin();
    }
  };

  return (
    <div className="ui-container">
      <div className="sidebar">
        <h2>Participants ({names.length}/60)</h2>
        <form onSubmit={handleAdd}>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter names (one per line)..."
            disabled={isSpinning || names.length >= 60}
            rows={5}
          />
          <button type="submit" disabled={isSpinning || names.length >= 60}>Add</button>
        </form>
        <ul className="name-list">
          {names.map((p) => (
            <li key={p.id} style={{ borderLeft: `5px solid ${p.color}` }}>
              {p.name}
              <button onClick={() => removeName(p.id)} disabled={isSpinning}>x</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="controls">
        <button 
            className="spin-button" 
            onClick={handleSpin} 
            disabled={isSpinning || names.length === 0}
        >
          {isSpinning ? 'Spinning...' : 'SPIN!'}
        </button>
      </div>

      {winner && (
        <div className="winner-overlay">
          <div className="winner-card">
            <h1>🎉 Winner! 🎉</h1>
            <h2 style={{ color: winner.color }}>{winner.name}</h2>
            <button onClick={() => setWinner(null as any)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
