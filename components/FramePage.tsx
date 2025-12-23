
import React from 'react';
import { HikingPhoto, PuzzleShape } from '../types';
import { PuzzleCanvas } from './HeartCanvas';
import { FRAMES } from '../constants';

interface FramePageProps {
  photos: HikingPhoto[];
  collageTitle: string;
  initiator: string;
  aiStory: string;
  selectedShapes: PuzzleShape[];
  titleColor: string;
  titleFont: string;
  selectedFrameId: string;
  onFrameChange: (id: string) => void;
  onSave: () => void;
  onBack: () => void;
}

export const FramePage: React.FC<FramePageProps> = ({
  photos,
  collageTitle,
  initiator,
  aiStory,
  selectedShapes,
  titleColor,
  titleFont,
  selectedFrameId,
  onFrameChange,
  onSave,
  onBack
}) => {
  const currentFrame = FRAMES.find(f => f.id === selectedFrameId) || FRAMES[0];

  return (
    <div className="fixed inset-0 z-40 bg-[#1A1A1A] flex flex-col animate-fade-in overflow-hidden">
      {/* 顶部导航 */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-white active:scale-95 transition-all py-1"
        >
          <i className="fas fa-chevron-left text-sm"></i>
          <span className="text-sm font-bold">返回</span>
        </button>
        <h3 className="font-bold text-white text-sm">相框制作</h3>
        <button 
          onClick={onSave} 
          className="bg-[#07C160] text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg active:scale-95 transition-all"
        >
          确认保存
        </button>
      </div>

      {/* 预览区域 */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden bg-dot-pattern">
        <div className="scale-[0.8] md:scale-90 origin-center transform transition-all duration-500">
           <PuzzleCanvas 
              photos={photos}
              collageTitle={collageTitle}
              initiator={initiator}
              canvasRef={{ current: null } as any}
              aiStory={aiStory}
              selectedShapes={selectedShapes}
              titleColor={titleColor}
              titleFont={titleFont}
              frameClass={currentFrame.className}
              frameId={selectedFrameId}
           />
        </div>
      </div>

      {/* 底部选择器 */}
      <div className="bg-white rounded-t-[32px] p-6 pb-12 flex-shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Select Style</span>
            <span className="text-sm font-bold text-gray-800">相框风格库</span>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold border border-emerald-100">
            当前：{currentFrame.label}
          </span>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {FRAMES.map((frame) => (
            <button 
              key={frame.id}
              onClick={() => onFrameChange(frame.id)}
              className={`flex-shrink-0 group flex flex-col items-center gap-2 transition-all`}
            >
              <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all ${selectedFrameId === frame.id ? 'border-[#07C160] bg-emerald-50 shadow-md scale-105' : 'border-gray-100 bg-gray-50 hover:border-gray-300'}`}>
                {/* 缩略图模拟图标 */}
                <div className={`w-8 h-10 rounded-sm border ${frame.className.split(' ').find(c => c.startsWith('bg-')) || 'bg-white'} border-gray-200 shadow-xs`}></div>
              </div>
              <span className={`text-[10px] font-bold ${selectedFrameId === frame.id ? 'text-[#07C160]' : 'text-gray-400'}`}>
                {frame.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .bg-dot-pattern {
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
};
