import { useImageStore } from '@/lib/store';

interface ImageRenderComponentProps {
  imageUrl: string;
}

export const ImageRenderComponent = ({
  imageUrl,
}: ImageRenderComponentProps) => {
  const { borderRadius, imageOpacity, imageScale } = useImageStore();

  return (
    <img
      src={imageUrl}
      alt="Uploaded image"
      className="max-w-full max-h-full object-contain"
      style={{ 
        borderRadius: `${borderRadius}px`, 
        opacity: imageOpacity,
        transform: `scale(${imageScale / 100})`,
        transformOrigin: 'center',
      }}
    />
  );
};

