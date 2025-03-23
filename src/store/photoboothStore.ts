import { create } from 'zustand';
import { PhotoboothState, PhotoCount, Layout, PhotoFrame, Sticker } from '../types';

const usePhotoboothStore = create<PhotoboothState>((set) => ({
  step: 1,
  photoCount: 4,
  photos: [],
  selectedLayout: 'vertical',
  selectedFrame: null,
  frameColor: '#ffffff',
  textColor: '#ffffff',
  stickers: [],
  title: '',
  date: new Date().toLocaleDateString(),
  
  setStep: (step: number) => set({ step }),
  setPhotoCount: (count: PhotoCount) => set({ photoCount: count }),
  addPhoto: (photo: string) => set((state) => ({ 
    photos: [...state.photos, photo] 
  })),
  setLayout: (layout: Layout) => set({ selectedLayout: layout }),
  setFrame: (frame: PhotoFrame | null) => set({ selectedFrame: frame }),
  setFrameColor: (color: string) => set({ frameColor: color }),
  setTextColor: (color: string) => set({ textColor: color }),
  addSticker: (sticker: Sticker) => set((state) => ({
    stickers: [...state.stickers, { ...sticker, id: crypto.randomUUID() }]
  })),
  updateSticker: (id: string, updates: Partial<Sticker>) => set((state) => ({
    stickers: state.stickers.map((sticker) =>
      sticker.id === id ? { ...sticker, ...updates } : sticker
    )
  })),
  removeSticker: (id: string) => set((state) => ({
    stickers: state.stickers.filter((sticker) => sticker.id !== id)
  })),
  setTitle: (title: string) => set({ title }),
  setDate: (date: string) => set({ date }),
}));

export default usePhotoboothStore;