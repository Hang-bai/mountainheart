
import React from 'react';
import { HikingPhoto } from '../types';

interface PhotoCardProps {
  photo: HikingPhoto;
  onDelete: (id: string) => void;
  onShare: (photo: HikingPhoto) => void;
  onPreview: (photo: HikingPhoto) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onDelete, onShare, onPreview }) => {
  return (
    <div className="relative group rounded-lg overflow-hidden shadow-md bg-white flex flex-col transition-transform active:scale-95">
      <div 
        className="relative h-24 w-full cursor-zoom-in"
        onClick={() => onPreview(photo)}
      >
        <img 
          src={photo.url} 
          alt={photo.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
        
        {/* 操作按钮保留并优化显示 */}
        <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }}
            className="bg-red-500/80 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
            title="删除"
          >
            <i className="fas fa-times text-[10px]"></i>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onShare(photo); }}
            className="bg-emerald-500/80 hover:bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
            title="分享此图"
          >
            <i className="fas fa-share-nodes text-[10px]"></i>
          </button>
        </div>
      </div>
      <div className="px-2 py-1.5 bg-gray-50 border-t border-gray-100 space-y-0.5">
        <p className="text-[10px] text-black font-bold truncate">
          <i className="fas fa-user-circle mr-1 text-emerald-600"></i>
          {photo.contributor}
        </p>
        {photo.location && (
          <p className="text-[8px] text-gray-500 truncate">
            <i className="fas fa-map-marker-alt mr-1 text-orange-400"></i>
            {photo.location}
          </p>
        )}
      </div>
    </div>
  );
};
