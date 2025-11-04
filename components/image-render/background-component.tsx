import { getBackgroundCSS } from '@/lib/constants/backgrounds';
import { useImageStore } from '@/lib/store';
import { ContentContainer } from './content-container';
import { TextOverlayRenderer } from './text-overlay-renderer';
import { useResponsiveCanvasDimensions } from '@/hooks/useAspectRatioDimensions';
import React from 'react';

interface BackgroundComponentProps {
  imageUrl?: string;
  children?: React.ReactNode;
}

/**
 * BackgroundComponent - Displays the canvas with proper aspect ratio and dimensions
 * 
 * This component:
 * - Uses actual pixel dimensions from aspect ratio presets
 * - Automatically scales to fit viewport while maintaining aspect ratio
 * - Supports background gradients, solid colors, and images
 */
export const BackgroundComponent = ({
  imageUrl,
  children,
}: BackgroundComponentProps) => {
  const { backgroundConfig, backgroundBorderRadius } = useImageStore();
  const backgroundStyle = getBackgroundCSS(backgroundConfig);
  const { width, height, aspectRatio } = useResponsiveCanvasDimensions();

  // Container style with actual dimensions
  const containerStyle = {
    ...backgroundStyle,
    width: '100%',
    maxWidth: `${width}px`,
    aspectRatio,
    maxHeight: '90vh',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full flex items-center justify-center">
        <div
          id="image-render-card"
          className="overflow-hidden shadow-2xl flex items-center justify-center relative"
          style={{
            ...containerStyle,
            borderRadius: `${backgroundBorderRadius}px`,
          }}
        >
          <div className="w-full h-full flex items-center justify-center relative z-10 p-6">
            <ContentContainer imageUrl={imageUrl}>{children}</ContentContainer>
            <TextOverlayRenderer />
          </div>
        </div>
      </div>
    </div>
  );
};

