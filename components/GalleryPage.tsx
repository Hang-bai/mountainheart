
import React, { useState } from 'react';
import { HikingPhoto } from '../types';
import { PhotoCard } from './PhotoCard';

interface GalleryPageProps {
  photos: HikingPhoto[];
  sortMethod: 'time' | 'name';
  onSortChange: (method: 'time' | 'name') => void;
  onDelete: (id: string) => void;
  onShare: (photo: HikingPhoto) => void;
  onBack: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ 
  photos, 
  sortMethod, 
  onSortChange, 
  onDelete, 
  onShare, 
  onBack 
}) => {
  const [previewPhoto, setPreviewPhoto] = useState<HikingPhoto | null>(null);

  const sortedPhotos = [...photos].sort((a, b) => {
    if (sortMethod === 'name') {
      return a.contributor.localeCompare(b.contributor, 'zh-CN');
    }
    return b.createdAt - a.createdAt;
  });

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('zh-CN', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#F7F7F7] flex flex-col animate-fade-in overflow-hidden">
      {/* 顶部导航 */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 shadow-sm flex-shrink-0">
        <button 
          onClick={onBack} 
          className="flex items-center gap-1 text-gray-600 active:scale-95 transition-transform"
        >
          <i className="fas fa-chevron-left"></i>
          <span className="text-sm font-bold">返回</span>
        </button>
        <div className="text-center">
          <h3 className="font-bold text-black text-sm">队员足迹墙</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{photos.length} MOMENTS RECORDED</p>
        </div>
        <div className="w-12"></div> {/* 占位平衡 */}
      </div>

      {/* 工具栏 */}
      <div className="px-4 py-3 bg-white/50 backdrop-blur-md flex items-center justify-between flex-shrink-0">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => onSortChange('time')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${sortMethod === 'time' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
          >
            最新发布
          </button>
          <button 
            onClick={() => onSortChange('name')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${sortMethod === 'name' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}
          >
            按姓名排序
          </button>
        </div>
        <span className="text-[10px] text-emerald-600 font-bold">
          <i className="fas fa-filter mr-1"></i> 全部足迹
        </span>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar relative">
        {photos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4">
            <i className="fas fa-mountain text-6xl opacity-20"></i>
            <p className="text-sm font-bold">暂时还没有队友留下足迹</p>
            <button onClick={onBack} className="text-emerald-500 text-xs font-bold border-b border-emerald-500 pb-0.5">去上传第一张</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sortedPhotos.map(photo => (
              <div key={photo.id} className="animate-fade-in">
                <PhotoCard 
                  photo={photo} 
                  onDelete={onDelete} 
                  onShare={onShare} 
                  onPreview={setPreviewPhoto}
                />
              </div>
            ))}
          </div>
        )}
        <div className="h-32"></div> {/* 为底部悬浮按钮预留空间 */}
      </div>

      {/* 全屏预览模态框 */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-fade-in">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setPreviewPhoto(null)}
          ></div>
          
          {/* 预览卡片 */}
          <div className="relative w-full max-w-sm px-6 flex flex-col gap-4 animate-scale-up">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={previewPhoto.url} 
                className="w-full h-auto max-h-[60vh] object-contain bg-black" 
                alt="Preview" 
              />
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <i className="fas fa-user-circle text-[#07C160]"></i>
                      {previewPhoto.contributor}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      于 {formatDate(previewPhoto.createdAt)} 上传
                    </p>
                  </div>
                  <button 
                    onClick={() => onShare(previewPhoto)}
                    className="w-10 h-10 bg-emerald-50 text-[#07C160] rounded-full flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <i className="fas fa-share-nodes"></i>
                  </button>
                </div>
                
                {previewPhoto.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <i className="fas fa-map-marker-alt text-orange-400"></i>
                    <span className="font-medium">{previewPhoto.location}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 关闭按钮 */}
            <button 
              onClick={() => setPreviewPhoto(null)}
              className="mx-auto w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center border border-white/20 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
      )}

      {/* 底部固定返回按钮 */}
      <div className="absolute bottom-6 left-0 right-0 px-6 pointer-events-none">
        <button 
          onClick={onBack} 
          className="pointer-events-auto w-full max-w-sm mx-auto py-4 bg-white/90 backdrop-blur-md text-[#07C160] border border-emerald-100 rounded-2xl font-bold shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <i className="fas fa-th-large"></i>
          返回创作拼图
        </button>
      </div>

      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};
