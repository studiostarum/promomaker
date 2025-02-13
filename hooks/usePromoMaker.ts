import { useState, useEffect, ChangeEvent } from 'react';
import { SavedImage, ImageTransform } from '@/components/promo-maker/types';

const STORAGE_KEY = 'saved_promos';
const MAX_IMAGE_SIZE = 800; // Maximum dimension for saved images

function compressImage(dataUrl: string, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = dataUrl;
  });
}

const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

export function usePromoMaker() {
  const [image, setImage] = useState<string | null>(null);
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [imageTransform, setImageTransform] = useState<ImageTransform>({ scale: 1, x: 0, y: 0 });
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(1);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const [imageToOverwrite, setImageToOverwrite] = useState<number | null>(null);
  const [previewOverwrite, setPreviewOverwrite] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize state after mount
  useEffect(() => {
    setIsMounted(true);
    
    // Load saved images
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSavedImages(JSON.parse(saved));
    }

    // Load selected image index
    const selectedIndex = localStorage.getItem('image_editor_selectedIndex');
    if (selectedIndex !== null) {
      setSelectedImageIndex(Number(selectedIndex));
    }

    // Load transform
    const transform = localStorage.getItem('image_editor_transform');
    if (transform) {
      setImageTransform(JSON.parse(transform));
    }

    // Load overlay settings
    const overlayVisible = localStorage.getItem('image_editor_overlayVisible');
    if (overlayVisible !== null) {
      setOverlayVisible(overlayVisible === 'true');
    }

    const overlayOpacity = localStorage.getItem('image_editor_overlayOpacity');
    if (overlayOpacity !== null) {
      setOverlayOpacity(Number(overlayOpacity));
    }
  }, []);

  // Only persist changes after mount
  useEffect(() => {
    if (isMounted && savedImages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedImages));
      } catch (error) {
        if (error instanceof Error) {
          console.error('Failed to save to localStorage:', error.message);
        }
      }
    }
  }, [savedImages, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('image_editor_overlayVisible', overlayVisible.toString());
    }
  }, [overlayVisible, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('image_editor_overlayOpacity', overlayOpacity.toString());
    }
  }, [overlayOpacity, isMounted]);

  useEffect(() => {
    if (isMounted) {
      if (selectedImageIndex !== null) {
        localStorage.setItem('image_editor_selectedIndex', selectedImageIndex.toString());
      } else {
        localStorage.removeItem('image_editor_selectedIndex');
      }
    }
  }, [selectedImageIndex, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('image_editor_transform', JSON.stringify(imageTransform));
    }
  }, [imageTransform, isMounted]);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        const compressed = await compressImage(result, MAX_IMAGE_SIZE);
        setImage(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
              const result = e.target?.result as string;
              const compressed = await compressImage(result, MAX_IMAGE_SIZE);
              setImage(compressed);
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleEdit = (index: number) => {
    const savedImage = savedImages[index];
    if (savedImage) {
      setImage(savedImage.original);
      setImageTransform(savedImage.transform);
      setSelectedImageIndex(index);
    }
  };

  const handleDelete = (index: number) => {
    setSavedImages(prev => prev.filter((_, i) => i !== index));
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
    }
  };

  const handleOverwrite = (index: number) => {
    setImageToOverwrite(index);
    setPreviewOverwrite(index);
    setShowOverwriteDialog(true);
  };

  const handleSave = async (overwriteIndex?: number) => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = async () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate dimensions to fit image within canvas while maintaining aspect ratio
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;

      // Apply the transform relative to the center of the canvas
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(imageTransform.scale, imageTransform.scale);
      ctx.translate(
        -canvas.width / 2 + imageTransform.x / imageTransform.scale,
        -canvas.height / 2 + imageTransform.y / imageTransform.scale
      );

      // Draw the image
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      ctx.restore();

      if (overlayVisible) {
        const overlay = new Image();
        overlay.onload = async () => {
          ctx.globalAlpha = overlayOpacity;
          ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1;

          const compressedOriginal = await compressImage(image, MAX_IMAGE_SIZE);
          const compressedComposite = await compressImage(canvas.toDataURL('image/png'), MAX_IMAGE_SIZE);

          const newSavedImage: SavedImage = {
            original: compressedOriginal,
            composite: compressedComposite,
            transform: imageTransform,
          };

          if (typeof overwriteIndex === 'number') {
            setSavedImages(prev => prev.map((img, i) => 
              i === overwriteIndex ? newSavedImage : img
            ));
            setImageToOverwrite(null);
            setPreviewOverwrite(null);
          } else {
            setSavedImages(prev => [...prev, newSavedImage]);
          }
          setShowOverwriteDialog(false);
        };
        overlay.src = '/overlay.svg';
      } else {
        const compressedOriginal = await compressImage(image, MAX_IMAGE_SIZE);
        const compressedComposite = await compressImage(canvas.toDataURL('image/png'), MAX_IMAGE_SIZE);

        const newSavedImage: SavedImage = {
          original: compressedOriginal,
          composite: compressedComposite,
          transform: imageTransform,
        };

        if (typeof overwriteIndex === 'number') {
          setSavedImages(prev => prev.map((img, i) => 
            i === overwriteIndex ? newSavedImage : img
          ));
          setImageToOverwrite(null);
          setPreviewOverwrite(null);
        } else {
          setSavedImages(prev => [...prev, newSavedImage]);
        }
        setShowOverwriteDialog(false);
      }
    };
    img.src = image;
  };

  const handleDownload = () => {
    if (!image) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate dimensions to fit image within canvas while maintaining aspect ratio
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;

      // Apply the transform relative to the center of the canvas
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(imageTransform.scale, imageTransform.scale);
      ctx.translate(
        -canvas.width / 2 + imageTransform.x / imageTransform.scale,
        -canvas.height / 2 + imageTransform.y / imageTransform.scale
      );

      // Draw the image
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      ctx.restore();
      
      // Draw the overlay if visible
      if (overlayVisible) {
        const overlay = new Image();
        overlay.onload = () => {
          ctx.globalAlpha = overlayOpacity;
          ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
          
          // Create download link
          const link = document.createElement('a');
          link.download = `promo-${new Date().toISOString()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        overlay.src = '/overlay.svg';
      } else {
        // If no overlay, download immediately
        const link = document.createElement('a');
        link.download = `promo-${new Date().toISOString()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    img.src = image;
  };

  // Add effect to load selected image on mount
  useEffect(() => {
    if (selectedImageIndex !== null) {
      const savedImage = savedImages[selectedImageIndex];
      if (savedImage) {
        setImage(savedImage.original);
        setImageTransform(savedImage.transform);
      }
    }
  }, [selectedImageIndex, savedImages]);

  return {
    image,
    savedImages,
    selectedImageIndex,
    imageTransform,
    overlayVisible,
    overlayOpacity,
    showOverwriteDialog,
    imageToOverwrite,
    previewOverwrite,
    handleImageUpload,
    handleDownload,
    handleSave,
    handleEdit,
    handleDelete,
    handleOverwrite,
    setShowOverwriteDialog,
    setOverlayVisible,
    setOverlayOpacity,
    setImageTransform,
  };
} 