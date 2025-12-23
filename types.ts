
export interface HikingPhoto {
  id: string;
  url: string;
  name: string;
  contributor: string;
  location?: string;
  gridIndex: string; // 修改为 string，格式如 "shapeId_row_col"
  createdAt: number;
}

export interface PuzzleShape {
  id: string;
  label: string;
  mask: number[][];
  icon: string;
  promptTheme: string;
}

export interface PhotoFrame {
  id: string;
  label: string;
  className: string;
  style?: React.CSSProperties;
}

export interface ProjectConfig {
  title: string;
  initiator: string;
}
