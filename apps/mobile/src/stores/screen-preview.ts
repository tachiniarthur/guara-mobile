import { create } from 'zustand';

/** State forced on every screen to preview the designs (development only). */
export type ScreenPreview = 'auto' | 'loading' | 'error' | 'empty';

interface ScreenPreviewState {
  preview: ScreenPreview;
  setPreview: (preview: ScreenPreview) => void;
}

/** "Estados das telas" in the UI catalog (`/ui`). Production always stays on `auto`. */
export const useScreenPreview = create<ScreenPreviewState>()((set) => ({
  preview: 'auto',
  setPreview: (preview) => set({ preview: __DEV__ ? preview : 'auto' }),
}));
