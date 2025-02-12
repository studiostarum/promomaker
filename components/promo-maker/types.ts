export type SavedImage = {
  original: string;
  composite: string;
  transform: {
    scale: number;
    x: number;
    y: number;
  };
};

export type ImageTransform = {
  scale: number;
  x: number;
  y: number;
}; 