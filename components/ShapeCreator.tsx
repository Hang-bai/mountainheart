
import React, { useState } from 'react';
import { PuzzleShape } from '../types';

interface ShapeCreatorProps {
  onSave: (shape: PuzzleShape) => void;
  onClose: () => void;
}

export const ShapeCreator: React.FC<ShapeCreatorProps> = ({ onSave, onClose }) => {
  const ROWS = 7;
  const COLS = 7;
  const [grid, setGrid] = useState<number[][]>(
    Array(ROWS).fill(0).map(() => Array(COLS).fill(0))
  );
  const [name, setName] = useState('');

  const toggleCell = (r: number, c: number) => {
    const newGrid = [...grid.map(row => [...row])];
    newGrid[r][c] = newGrid[r][c] === 1 ? 0 : 1;
    setGrid(newGrid);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('请给你的样式起个名字');
      return;
    }
    const hasActive = grid.some(row => row.includes(1));
    if (!hasActive) {
      alert('请至少点击勾选一个格子');
      return;
    }

    let minR = ROWS, maxR = 0, minC = COLS, maxC = 0;
    grid.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val === 1) {
          minR = Math.min(minR, r);
          maxR = Math.max(maxR, r);
          minC = Math.min(minC, c);
          maxC = Math.max(maxC, c);
        }
      });
    });

    const trimmedMask = grid.slice(minR, maxR + 1).map(row => row.slice(minC, maxC + 1));

    const newShape: PuzzleShape = {
      id: `custom_${Date.now()}`,
      label: name,
      mask: trimmedMask,
      icon: 'fa-signature',
      promptTheme: '自由与创意',
    };
    onSave(newShape);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">创作专属样式</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Style Name</p>
          <input 
            type="text" 
            placeholder="例如：北斗七星" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-black outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Draw Grid (点击勾选)</p>
          <div className="grid gap-1 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {grid.map((row, rIdx) => 
              row.map((cell, cIdx) => (
                <button
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => toggleCell(rIdx, cIdx)}
                  className={`aspect-square rounded-md transition-all ${cell === 1 ? 'bg-[#07C160] shadow-md scale-95' : 'bg-white border border-gray-100 hover:border-emerald-200'}`}
                />
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm">取消</button>
          <button onClick={handleSave} className="flex-1 py-3 bg-[#07C160] text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-100">保存样式</button>
        </div>
      </div>
    </div>
  );
};
