import { aspectRatios } from '@/lib/constants/aspect-ratios';
import { getBackgroundCSS } from '@/lib/constants/backgrounds';
import { useImageStore } from '@/lib/store';
import { ContentContainer } from './content-container';
import { TextOverlayRenderer } from './text-overlay-renderer';
import React from 'react';

interface BackgroundComponentProps {
  imageUrl?: string;
  children?: React.ReactNode;
}

export const BackgroundComponent = ({
  imageUrl,
  children,
}: BackgroundComponentProps) => {
  const { backgroundConfig, selectedAspectRatio, backgroundBorderRadius } = useImageStore();
  const backgroundStyle = getBackgroundCSS(backgroundConfig);
  const aspectRatio =
    aspectRatios.find((ar) => ar.id === selectedAspectRatio)?.ratio || 1;

  // Extract blur from backgroundStyle if it exists
  const { filter, ...restBackgroundStyle } = backgroundStyle;
  const hasBlur = backgroundConfig.type === 'image' && (backgroundConfig.blur || 0) > 0;

  // When blur is applied, we need to separate the background from the blur effect
  // The blurred version should be on a separate layer
  const containerStyle = hasBlur
    ? {
        // Remove background image from main container when blur is active
        backgroundImage: 'none',
        backgroundColor: restBackgroundStyle.backgroundColor || 'transparent',
        opacity: restBackgroundStyle.opacity,
        aspectRatio,
        maxHeight: '80vh',
      }
    : {
        ...restBackgroundStyle,
        aspectRatio,
        maxHeight: '80vh',
      };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-7xl flex items-center justify-center">
        <div
          id="image-render-card"
          className="overflow-hidden shadow-2xl flex items-center justify-center p-8 relative"
          style={{
            ...containerStyle,
            borderRadius: `${backgroundBorderRadius}px`,
          }}
        >
          {/* Blur overlay for background images */}
          {hasBlur && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: restBackgroundStyle.backgroundImage,
                backgroundSize: restBackgroundStyle.backgroundSize || 'cover',
                backgroundPosition: restBackgroundStyle.backgroundPosition || 'center',
                backgroundRepeat: restBackgroundStyle.backgroundRepeat || 'no-repeat',
                filter: filter || `blur(${backgroundConfig.blur}px)`,
                opacity: restBackgroundStyle.opacity !== undefined ? restBackgroundStyle.opacity : 1,
                borderRadius: `${backgroundBorderRadius}px`,
                zIndex: 0,
              }}
            />
          )}
          <div className="p-6 w-full h-full flex items-center justify-center relative z-10">
            <ContentContainer imageUrl={imageUrl}>{children}</ContentContainer>
            <TextOverlayRenderer />
          </div>
        </div>
      </div>
    </div>
  );
};

