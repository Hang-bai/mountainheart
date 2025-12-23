
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { HikingPhoto, PuzzleShape, PhotoFrame } from './types';
import { PhotoCard } from './components/PhotoCard';
import { PuzzleCanvas } from './components/HeartCanvas'; 
import { GalleryPage } from './components/GalleryPage';
import { FramePage } from './components/FramePage';
import { ShapeCreator } from './components/ShapeCreator';
import { generateHikingStory } from './services/geminiService';
import { SHAPES, FRAMES } from './constants';

const FONT_OPTIONS = [
  { id: 'font-sans-bold', label: '黑体 (默认)' },
  { id: 'font-serif-heavy', label: '宋体 (典雅)' },
  { id: 'font-cursive', label: '书法 (大气)' },
  { id: 'font-display', label: '艺术 (独特)' },
];

const COLOR_PRESETS = [
  '#000000', // 纯黑
  '#07C160', // 微信绿
  '#B8860B', // 暗金
  '#C0392B', // 朱红
  '#2E4053', // 藏蓝
];

const MUSIC_PRESETS = [
  { id: 'ambient', label: '林间清风', url: 'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3' },
  { id: 'epic', label: '壮丽巅峰', url: 'https://assets.mixkit.co/music/preview/mixkit-valley-of-the-sun-1110.mp3' },
  { id: 'minimal', label: '纯净呼吸', url: 'https://assets.mixkit.co/music/preview/mixkit-deep-meditation-109.mp3' },
];

const App: React.FC = () => {
  const [view, setView] = useState<'create' | 'gallery' | 'frame'>('create');
  const [photos, setPhotos] = useState<HikingPhoto[]>([]);
  const [title, setTitle] = useState("众志成城·共攀高峰");
  const [titleColor, setTitleColor] = useState("#000000");
  const [titleFont, setTitleFont] = useState("font-sans-bold");
  const [initiator, setInitiator] = useState("某某登山社");
  const [aiStory, setAiStory] = useState("");
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [currentContributor, setCurrentContributor] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [exportedImage, setExportedImage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [sortMethod, setSortMethod] = useState<'time' | 'name'>('time');
  const [showShapeCreator, setShowShapeCreator] = useState(false);
  const [selectedFrameId, setSelectedFrameId] = useState('none');
  
  const [selectedMusicIds, setSelectedMusicIds] = useState<string[]>(['ambient']);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>('ambient');
  const [playbackMode, setPlaybackMode] = useState<'sequence' | 'random'>('sequence');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [targetGridId, setTargetGridId] = useState<string | null>(null);
  const [customShapes, setCustomShapes] = useState<PuzzleShape[]>([]);
  const allShapes = useMemo(() => [...SHAPES, ...customShapes], [customShapes]);
  const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([SHAPES[0].id]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contributorInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedShapes = useMemo(() => allShapes.filter(s => selectedShapeIds.includes(s.id)), [allShapes, selectedShapeIds]);
  const currentMusic = MUSIC_PRESETS.find(m => m.id === currentPlayingId);
  const currentFrame = FRAMES.find(f => f.id === selectedFrameId) || FRAMES[0];

  const toggleMusicInPlaylist = (id: string) => {
    setSelectedMusicIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; 
        const nextIds = prev.filter(mid => mid !== id);
        if (currentPlayingId === id) {
          setCurrentPlayingId(nextIds[0]);
        }
        return nextIds;
      }
      return [...prev, id];
    });
  };

  const playNext = () => {
    if (selectedMusicIds.length === 0) return;
    let nextId = selectedMusicIds[0];
    if (playbackMode === 'random') {
      const otherIds = selectedMusicIds.filter(id => id !== currentPlayingId);
      if (otherIds.length > 0) {
        nextId = otherIds[Math.floor(Math.random() * otherIds.length)];
      }
    } else {
      const currentIndex = selectedMusicIds.indexOf(currentPlayingId || '');
      const nextIndex = (currentIndex + 1) % selectedMusicIds.length;
      nextId = selectedMusicIds[nextIndex];
    }
    setCurrentPlayingId(nextId);
  };

  useEffect(() => {
    if (audioRef.current && currentMusic?.url) {
      audioRef.current.load();
      if (isMusicPlaying) {
        audioRef.current.play().catch(() => setIsMusicPlaying(false));
      }
    }
  }, [currentPlayingId]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      if (!currentPlayingId && selectedMusicIds.length > 0) {
        setCurrentPlayingId(selectedMusicIds[0]);
      }
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(err => console.error("Playback failed", err));
    }
  };

  const toggleShape = (id: string) => {
    setSelectedShapeIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter(sid => sid !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
    setTargetGridId(null);
  };

  const handleAddCustomShape = (newShape: PuzzleShape) => {
    setCustomShapes(prev => [...prev, newShape]);
    setSelectedShapeIds([newShape.id]); 
    setShowShapeCreator(false);
  };

  const handleCellClick = (gridId: string) => {
    const contributorName = currentContributor.trim();
    if (!contributorName) {
      setTargetGridId(gridId);
      contributorInputRef.current?.focus();
      // 这里的提示在原代码中有，保留其交互意图
      return;
    }
    
    // 如果已经贡献过，可以允许重新上传并覆盖之前的位置
    setTargetGridId(gridId);
    fileInputRef.current?.click();
  };

  // 寻找第一个可用的网格位置
  const findFirstAvailableGridId = () => {
    for (const shape of selectedShapes) {
      for (let r = 0; r < shape.mask.length; r++) {
        for (let c = 0; c < shape.mask[r].length; c++) {
          if (shape.mask[r][c] === 1) {
            const gridId = `${shape.id}_${r}_${c}`;
            if (!photos.some(p => p.gridIndex === gridId)) {
              return gridId;
            }
          }
        }
      }
    }
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const contributorName = currentContributor.trim();
    if (!contributorName) {
      alert("请填写您的代号后再上传照片");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const files = e.target.files;
    if (files && files.length > 0) {
      const file: File = files[0]; 
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageData = event.target!.result as string;
          
          let finalGridId = targetGridId;
          if (!finalGridId) {
            finalGridId = findFirstAvailableGridId();
          }

          if (!finalGridId) {
            alert("拼图已经满啦！请尝试切换形状或开启更多拼图。");
            return;
          }

          setPhotos((prev) => {
            // 过滤掉当前用户之前的照片（如果只能贡献一次）或者该位置原有的照片
            const otherPhotos = prev.filter(p => p.gridIndex !== finalGridId && p.contributor !== contributorName);
            
            return [
              ...otherPhotos,
              {
                id: Math.random().toString(36).substr(2, 9),
                url: imageData,
                name: file.name,
                contributor: contributorName,
                location: currentLocation.trim(),
                gridIndex: finalGridId!,
                createdAt: Date.now(),
              },
            ];
          });
          
          setCurrentLocation("");
          setTargetGridId(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const deletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSharePhoto = async (photo: HikingPhoto) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `来自 ${photo.contributor} 的攀登足迹`,
          text: `我在 ${photo.location || '巅峰'} 留下的足迹，快来看看吧！`,
          url: window.location.href,
        });
      } catch (err) {
        setExportedImage(photo.url);
        setShowExport(true);
      }
    } else {
      setExportedImage(photo.url);
      setShowExport(true);
    }
  };

  const handleGenerateStory = async () => {
    if (photos.length === 0) {
      alert("请先上传一些攀登照片，AI 才能为您生成感人短评哦！");
      return;
    }
    if (isGeneratingStory) return;

    setIsGeneratingStory(true);
    try {
      const labels = selectedShapes.map(s => s.label).join('、');
      const themes = selectedShapes.map(s => s.promptTheme).join('与');
      const story = await generateHikingStory(photos.length, labels, themes);
      setAiStory(story || "");
    } catch (error) {
      console.error("Story generation failed:", error);
      setAiStory("在巅峰回响的，不仅是风声，更是我们众心成城的承诺。每一道光影，都是我们攀登时的呼吸。");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const exportPoster = async () => {
    if (!canvasRef.current || !(window as any).html2canvas) return;
    if (photos.length === 0) {
      alert("请先上传照片后再导出海报");
      return;
    }
    setIsExporting(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      const canvas = await (window as any).html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });
      setExportedImage(canvas.toDataURL("image/png"));
      setShowExport(true);
    } catch (err) {
      alert("海报生成失败，请重试。");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 bg-[#F7F7F7] safe-area-top">
      <audio ref={audioRef} src={currentMusic?.url} onEnded={playNext} className="hidden" />

      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-30 px-4 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2 overflow-hidden">
           <div className="w-8 h-8 flex-shrink-0 bg-[#07C160] rounded-full flex items-center justify-center text-white text-xs shadow-sm">
              <i className="fas fa-mountain"></i>
           </div>
           <div className="flex flex-col min-w-0">
             <span className="font-bold text-black text-sm truncate">众心成峰</span>
             {isMusicPlaying && currentMusic && (
               <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1 animate-pulse">
                 <i className="fas fa-music text-[7px]"></i> {currentMusic.label}
               </span>
             )}
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button onClick={toggleMusic} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all shadow-sm ${isMusicPlaying ? 'bg-emerald-100 text-[#07C160] animate-spin-slow' : 'bg-gray-100 text-gray-400'}`}>
             <i className={`fas ${isMusicPlaying ? 'fa-music' : 'fa-play-circle'}`}></i>
           </button>
           <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 gap-4">
              <i className="fas fa-ellipsis-h text-gray-400 text-sm"></i>
              <div className="w-px h-3 bg-gray-300"></div>
              <i className="far fa-circle text-gray-800 text-xs"></i>
           </div>
        </div>
      </div>

      <main className="px-4 mt-6 max-w-lg mx-auto space-y-6">
        {/* 项目基本信息 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <div className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-lg flex items-center justify-center text-xs">
                <i className="fas fa-pen-fancy"></i>
             </div>
             <h3 className="font-bold text-gray-800">项目基本信息</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4">
               <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-bold">Theme & Font Style</p>
               <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className={`w-full bg-transparent font-bold outline-none text-xl mb-4 text-black ${titleFont}`} 
                  style={{ color: titleColor }} 
               />
               <div className="flex flex-col gap-3">
                 <div className="relative flex items-center">
                    <select value={titleFont} onChange={(e) => setTitleFont(e.target.value)} className="w-full bg-white border border-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-black outline-none appearance-none shadow-sm focus:ring-2 focus:ring-[#07C160]">
                      {FONT_OPTIONS.map(font => <option key={font.id} value={font.id}>{font.label}</option>)}
                    </select>
                    <i className="fas fa-font absolute left-3 text-gray-400 text-xs pointer-events-none"></i>
                    <i className="fas fa-chevron-down absolute right-3 text-gray-300 text-[10px] pointer-events-none"></i>
                 </div>
                 <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
                    <span className="text-[10px] text-gray-400 font-bold">标题色彩:</span>
                    <div className="flex gap-2">
                      {COLOR_PRESETS.map(color => (
                        <button key={color} onClick={() => setTitleColor(color)} className={`w-4 h-4 rounded-full border-2 transition-transform ${titleColor === color ? 'scale-125 border-gray-300' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                      ))}
                    </div>
                 </div>
               </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4">
               <div className="flex items-center justify-between mb-2">
                 <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Playlist</p>
                 <button onClick={() => setPlaybackMode(m => m === 'sequence' ? 'random' : 'sequence')} className="px-2 py-1 bg-white border border-gray-100 rounded-lg text-[9px] font-bold text-emerald-600 shadow-xs">
                   {playbackMode === 'sequence' ? '顺序' : '随机'}
                 </button>
               </div>
               <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {MUSIC_PRESETS.map(music => (
                    <button key={music.id} onClick={() => toggleMusicInPlaylist(music.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${selectedMusicIds.includes(music.id) ? 'bg-[#07C160] text-white border-[#07C160]' : 'bg-white text-gray-400 border-gray-100'}`}>
                      {music.label}
                    </button>
                  ))}
               </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4">
               <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-widest font-bold">Initiator</p>
               <input type="text" value={initiator} onChange={(e) => setInitiator(e.target.value)} className="w-full bg-transparent font-medium text-black outline-none text-sm focus:bg-white px-1 rounded transition-colors" placeholder="发起人/单位" />
            </div>
          </div>
        </div>

        {/* 拼图形状选择 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
             <div className="bg-blue-100 text-blue-600 w-6 h-6 rounded-lg flex items-center justify-center text-xs">
                <i className="fas fa-shapes"></i>
             </div>
             <h3 className="font-bold text-gray-800">选择拼图形状</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {allShapes.map((shape) => (
              <button key={shape.id} onClick={() => toggleShape(shape.id)} className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2 ${selectedShapeIds.includes(shape.id) ? 'border-[#07C160] bg-emerald-50 text-[#07C160]' : 'border-transparent bg-gray-50 text-gray-400'}`}>
                <i className={`fas ${shape.icon} text-lg`}></i>
                <span className="text-[10px] font-bold">{shape.label}</span>
              </button>
            ))}
            <button 
              onClick={() => setShowShapeCreator(true)}
              className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
            >
              <i className="fas fa-plus text-lg"></i>
              <span className="text-[10px] font-bold">自定义</span>
            </button>
          </div>
        </div>

        {/* 画布预览 & 相框入口 */}
        <div className="animate-fade-in relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-black/70 backdrop-blur-md text-white text-[9px] px-3 py-1 rounded-full font-bold shadow-lg whitespace-nowrap">
             <i className="fas fa-hand-pointer mr-1 text-emerald-400"></i> 点击下方指定位置上传
          </div>
          <div className="group relative">
            <PuzzleCanvas 
              photos={photos} 
              collageTitle={title} 
              initiator={initiator} 
              canvasRef={canvasRef} 
              aiStory={aiStory} 
              selectedShapes={selectedShapes} 
              onCellClick={handleCellClick} 
              targetGridIndex={targetGridId} 
              titleColor={titleColor} 
              titleFont={titleFont} 
              frameClass={currentFrame.className}
              frameId={selectedFrameId}
            />
            {/* 相框编辑入口 */}
            <button 
              onClick={() => setView('frame')}
              className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-[#07C160] w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-emerald-100 active:scale-95 transition-all z-20"
              title="编辑相框风格"
            >
              <i className="fas fa-crop-alt"></i>
            </button>
          </div>
        </div>

        {/* 贡献我的足迹 */}
        <div id="contribution-section" className="bg-white rounded-3xl p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="bg-orange-100 text-orange-600 w-6 h-6 rounded-lg flex items-center justify-center text-xs">
                     <i className="fas fa-camera"></i>
                  </div>
                  <h3 className="font-bold text-gray-800">贡献我的足迹</h3>
               </div>
               <button onClick={() => setView('gallery')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-black hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                  <i className="fas fa-images"></i>
                  <span>照片墙</span>
                  <span className="w-4 h-4 bg-emerald-500 text-white text-[9px] rounded-full flex items-center justify-center">{photos.length}</span>
               </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-[1.4] relative">
                  <input 
                    ref={contributorInputRef}
                    type="text" 
                    value={currentContributor} 
                    onChange={(e) => setCurrentContributor(e.target.value)} 
                    className={`w-full bg-gray-50 border-2 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-black outline-none transition-all ${targetGridId && !currentContributor ? 'border-orange-300 ring-2 ring-orange-50 animate-pulse' : 'border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'}`} 
                    placeholder="您的代号" 
                  />
                  <i className="fas fa-user-tag absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none"></i>
                </div>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={currentLocation} 
                    onChange={(e) => setCurrentLocation(e.target.value)} 
                    className="w-full bg-gray-50 border border-transparent rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-black outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" 
                    placeholder="地点" 
                  />
                  <i className="fas fa-map-marker-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none"></i>
                </div>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => {
                     if (!currentContributor.trim()) {
                       contributorInputRef.current?.focus();
                       return;
                     }
                     fileInputRef.current?.click();
                  }} 
                  className={`wechat-btn w-full py-4 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${targetGridId ? 'bg-orange-500 border-orange-600' : ''}`}
                >
                  <i className={`fas ${targetGridId ? 'fa-upload' : 'fa-plus'}`}></i>
                  {targetGridId ? '确认上传到指定位置' : '智能上传 (自动分配)'}
                </button>
                {targetGridId && (
                  <button 
                    onClick={() => setTargetGridId(null)} 
                    className="absolute -top-2 -right-2 bg-white text-gray-400 w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-gray-100 text-[10px]"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              
              {targetGridId && (
                <p className="text-[10px] text-center text-orange-500 font-bold animate-fade-in">
                   <i className="fas fa-info-circle mr-1"></i> 已锁定拼图位置，请点击按钮上传
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 底部功能按钮 */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleGenerateStory} 
            className={`py-4 rounded-2xl font-bold shadow-sm flex items-center justify-center gap-2 transition-all ${isGeneratingStory ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-[#07C160] border border-[#07C160] hover:bg-emerald-50'}`}
          >
            {isGeneratingStory ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
            {isGeneratingStory ? '生成中...' : '生成AI文案'}
          </button>
          <button 
            onClick={exportPoster} 
            disabled={isExporting} 
            className={`wechat-btn py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isExporting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-download"></i>}
            {isExporting ? '导出中...' : '保存并分享'}
          </button>
        </div>
      </main>

      {/* 独立页面视图控制 */}
      {view === 'gallery' && (
        <GalleryPage 
          photos={photos} 
          sortMethod={sortMethod} 
          onSortChange={setSortMethod} 
          onDelete={deletePhoto} 
          onShare={handleSharePhoto} 
          onBack={() => setView('create')} 
        />
      )}

      {view === 'frame' && (
        <FramePage 
          photos={photos}
          collageTitle={title}
          initiator={initiator}
          aiStory={aiStory}
          selectedShapes={selectedShapes}
          titleColor={titleColor}
          titleFont={titleFont}
          selectedFrameId={selectedFrameId}
          onFrameChange={setSelectedFrameId}
          onSave={() => setView('create')}
          onBack={() => setView('create')}
        />
      )}

      {showShapeCreator && (
        <ShapeCreator 
          onSave={handleAddCustomShape}
          onClose={() => setShowShapeCreator(false)}
        />
      )}

      {showExport && exportedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowExport(false)}></div>
          <div className="relative flex flex-col items-center gap-4">
            <img src={exportedImage} className="max-h-[85vh] rounded-xl shadow-2xl" />
            <button onClick={() => setShowExport(false)} className="px-6 py-2 bg-white text-gray-800 rounded-full font-bold shadow-xl">关闭预览</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
