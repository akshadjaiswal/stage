'use client';

import { useEffect } from 'react';
import { useImageStore } from '@/lib/store';
import { useCanvasContext } from '@/components/canvas/CanvasContext';
import { getAspectRatioPreset } from '@/lib/aspect-ratio-utils';

/**
 * Bridge component that syncs the image store with the canvas context
 * This ensures aspect ratio changes and other state updates are reflected in the canvas
 * 
 * This component acts as a bridge between:
 * - ImageStore (used by the editor UI)
 * - CanvasContext (used by the canvas editor)
 */
export function CanvasImageStoreBridge() {
  const { setAspectRatio: setCanvasAspectRatio, operations } = useCanvasContext();
  const { selectedAspectRatio, uploadedImageUrl } = useImageStore();

  // Sync aspect ratio changes with canvas
  useEffect(() => {
    const preset = getAspectRatioPreset(selectedAspectRatio);
    if (preset) {
      setCanvasAspectRatio(preset);
    }
  }, [selectedAspectRatio, setCanvasAspectRatio]);

  // Sync image uploads with canvas
  useEffect(() => {
    if (uploadedImageUrl && operations) {
      // Add image to canvas if not already added
      operations.addImage(uploadedImageUrl).catch((err) => {
        console.error('Failed to add image to canvas:', err);
      });
    }
  }, [uploadedImageUrl, operations]);

  return null;
}

