
export const SHAPES = [
  {
    id: 'heart',
    label: '爱心',
    icon: 'fa-heart',
    promptTheme: '爱与温暖',
    mask: [
      [0, 1, 1, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
    ]
  },
  {
    id: 'mountain',
    label: '大山',
    icon: 'fa-mountain',
    promptTheme: '坚毅与巅峰',
    mask: [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ]
  },
  {
    id: 'star',
    label: '繁星',
    icon: 'fa-star',
    promptTheme: '希望与光芒',
    mask: [
      [0, 0, 0, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 0, 1, 1, 0],
      [1, 1, 0, 0, 0, 1, 1],
    ]
  },
  {
    id: 'diamond',
    label: '钻石',
    icon: 'fa-gem',
    promptTheme: '永恒与纯粹',
    mask: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ]
  }
];

export const FRAMES = [
  { id: 'none', label: '极简白', className: 'bg-white border-gray-100 shadow-sm' },
  { id: 'polaroid', label: '拍立得', className: 'bg-white border-gray-200 shadow-xl pb-16' },
  { id: 'retro', label: '复古笺', className: 'bg-[#FDF5E6] border-[#D2B48C] border-2 shadow-inner sepia-[0.1]' },
  { id: 'wooden', label: '典雅木', className: 'bg-white border-[12px] border-[#5D4037] shadow-2xl rounded-sm' },
  { id: 'ticket', label: '纪念票', className: 'bg-white border-2 border-dashed border-gray-300 relative before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:w-6 before:h-6 before:bg-[#F7F7F7] before:rounded-full after:absolute after:-right-3 after:top-1/2 after:-translate-y-1/2 after:w-6 after:h-6 after:bg-[#F7F7F7] after:rounded-full' },
];
