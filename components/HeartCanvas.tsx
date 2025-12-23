
import React from 'react';
import { HikingPhoto, PuzzleShape } from '../types';

interface PuzzleCanvasProps {
  photos: HikingPhoto[];
  collageTitle: string;
  initiator: string;
  canvasRef: React.RefObject<HTMLDivElement>;
  aiStory?: string;
  selectedShapes: PuzzleShape[];
  onCellClick?: (gridId: string) => void;
  targetGridIndex?: string | null;
  titleColor?: string;
  titleFont?: string;
  frameClass?: string;
  frameId?: string;
}

export const PuzzleCanvas: React.FC<PuzzleCanvasProps> = ({ 
  photos, 
  collageTitle, 
  initiator,
  canvasRef, 
  aiStory, 
  selectedShapes,
  onCellClick,
  targetGridIndex,
  titleColor = '#000000',
  titleFont = 'font-sans-bold',
  frameClass = 'bg-white border-gray-100 shadow-sm',
  frameId = 'none'
}) => {
  const getPhotoForGridId = (gridId: string) => {
    return photos.find(p => p.gridIndex === gridId);
  };

  return (
    <div 
      ref={canvasRef}
      className={`relative p-6 md:p-8 rounded-2xl transition-all duration-500 max-w-sm mx-auto overflow-hidden ${frameClass}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* 拍立得装饰：底部指纹/笔触感 */}
      {frameId === 'polaroid' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-300 font-cursive opacity-60">
          Capture the Peak Moment
        </div>
      )}

      {/* 复古笺装饰：邮戳 */}
      {frameId === 'retro' && (
        <div className="absolute top-4 right-4 w-12 h-12 border-2 border-red-800/20 rounded-full flex items-center justify-center rotate-12 pointer-events-none">
          <div className="text-[8px] text-red-800/30 font-bold leading-none text-center">
            SUMMIT<br/>STAMP
          </div>
        </div>
      )}

      {/* 海报头部 */}
      <div className="mb-8 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50/50 text-emerald-600 rounded-full text-[9px] font-bold tracking-widest mb-3 uppercase border border-emerald-100/30">
          {selectedShapes.map(s => <i key={s.id} className={`fas ${s.icon} mx-0.5`}></i>)}
          <span className="ml-1 tracking-tighter">Peak Moment Collage</span>
        </div>
        
        <h2 
          className={`text-3xl tracking-tighter mb-2 leading-tight transition-all duration-300 ${titleFont}`}
          style={{ color: titleColor }}
        >
          {collageTitle || "众心成峰"}
        </h2>
        
        <div className="flex items-center justify-center gap-2 text-gray-400 text-[9px] font-bold">
          <span className="w-4 h-px bg-gray-200"></span>
          <span>INITIATED BY {initiator.toUpperCase() || "CLIMBER"}</span>
          <span className="w-4 h-px bg-gray-200"></span>
        </div>
      </div>

      {/* 拼图主体 */}
      <div className="flex flex-col gap-10 relative z-10">
        {selectedShapes.map((shape) => (
          <div key={shape.id} className="relative">
            <div 
              className="grid gap-1.5 mx-auto" 
              style={{ 
                gridTemplateColumns: `repeat(${shape.mask[0].length}, 1fr)`,
                width: '100%',
                maxWidth: '280px' 
              }}
            >
              {shape.mask.map((row, rIdx) => (
                row.map((cell, cIdx) => {
                  const isActive = cell === 1;
                  const gridId = `${shape.id}_${rIdx}_${cIdx}`;
                  const currentPhoto = isActive ? getPhotoForGridId(gridId) : null;
                  const isTargeted = targetGridIndex === gridId;
                  
                  return (
                    <div 
                      key={gridId}
                      onClick={() => isActive && onCellClick?.(gridId)}
                      className={`aspect-square relative overflow-hidden transition-all duration-300 rounded-md border ${
                        isActive 
                          ? isTargeted 
                            ? 'bg-emerald-100 ring-2 ring-[#07C160] z-20 shadow-lg scale-110 border-[#07C160] animate-pulse' 
                            : currentPhoto 
                              ? 'border-transparent shadow-sm cursor-pointer'
                              : 'bg-gray-50/50 border-dashed border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer' 
                          : 'opacity-0 pointer-events-none border-transparent'
                      }`}
                    >
                      {isActive && currentPhoto ? (
                        <img 
                          src={currentPhoto.url} 
                          className="absolute inset-0 w-full h-full object-cover"
                          alt="Moment"
                          crossOrigin="anonymous"
                        />
                      ) : isActive && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                           {isTargeted ? (
                             <i className="fas fa-arrow-up text-[12px] text-emerald-500 animate-bounce"></i>
                           ) : (
                             <i className="fas fa-plus text-[8px] opacity-40"></i>
                           )}
                        </div>
                      )}
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* AI 文案 */}
      {aiStory && (
        <div className="mt-10 px-6 py-8 bg-gray-50/30 rounded-2xl relative border-t border-b border-emerald-100/30 z-10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-[10px] text-emerald-600 font-bold border border-emerald-50 rounded-full">INSCRIPTION</div>
          <p className="text-black text-sm leading-relaxed text-center font-serif px-2 font-medium whitespace-pre-wrap italic">
            "{aiStory}"
          </p>
        </div>
      )}

      {/* 底部信息 */}
      <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-end relative z-10">
        <div>
          <p className="text-[8px] text-gray-400 font-bold uppercase mb-2 tracking-tighter">Team Members</p>
          <div className="flex -space-x-2">
            {photos.slice(0, 6).map((p) => (
              <div key={p.id} className="w-6 h-6 rounded-full border-2 border-white bg-emerald-100 overflow-hidden shadow-sm">
                <img src={p.url} className="w-full h-full object-cover" crossOrigin="anonymous" />
              </div>
            ))}
            {photos.length > 6 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] text-gray-400 font-bold">
                +{photos.length - 6}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[7px] text-gray-300 font-bold uppercase tracking-[0.2em]">Collective Memory</p>
        </div>
      </div>
    </div>
  );
};
