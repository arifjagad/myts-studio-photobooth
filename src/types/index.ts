export type PhotoCount = 3 | 4;

export type Layout = 'vertical' | 'horizontal' | 'square';

export interface PhotoFrame {
  id: string;
  name: string;
  previewUrl: string;
}

export interface Sticker {
  id: string;
  url: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

export interface TextElement {
  id: string;
  text: string;
  font: string;
  position: { x: number; y: number };
  fontSize: number;
  rotation: number;
}

export interface PhotoboothState {
  step: number;
  photoCount: PhotoCount;
  photos: string[];
  selectedLayout: Layout;
  selectedFrame: PhotoFrame | null;
  frameColor: string;
  stickers: Sticker[];
  textElements: TextElement[];
  title: string;
  date: string;
  
  setStep: (step: number) => void;
  setPhotoCount: (count: PhotoCount) => void;
  addPhoto: (photo: string) => void;
  setLayout: (layout: Layout) => void;
  setFrame: (frame: PhotoFrame | null) => void;
  setFrameColor: (color: string) => void;
  addSticker: (sticker: Sticker) => void;
  updateSticker: (id: string, updates: Partial<Sticker>) => void;
  removeSticker: (id: string) => void;
  addTextElement: (element: TextElement) => void;
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  removeTextElement: (id: string) => void;
  setTitle: (title: string) => void;
  setDate: (date: string) => void;
}