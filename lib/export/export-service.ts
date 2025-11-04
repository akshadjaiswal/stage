/**
 * Export service for handling image exports
 */

import html2canvas from 'html2canvas';
import {
  convertStylesToRGB,
  injectRGBOverrides,
  preserveImageStyles,
  convertSVGStyles,
  setupExportElement,
  waitForImages,  
} from './export-utils';
import { addWatermarkToCanvas, addWatermarkToElement, createWatermarkElement } from './watermark';

export interface ExportOptions {
  format: 'png' | 'jpg';
  quality: number;
  scale: number;
  exportWidth: number;
  exportHeight: number;
}

export interface ExportResult {
  dataURL: string;
  blob: Blob;
}

export async function exportElement(
  elementId: string,
  options: ExportOptions
): Promise<ExportResult> {
  // Wait a bit to ensure DOM is ready
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Image render card not found. Please ensure an image is uploaded.');
  }

  // Wait for all images to load
  await waitForImages(element);

  // Add watermark DOM element before capture so html2canvas includes it
  const removeWatermark = addWatermarkToElement(element, {
    text: 'stage',
    position: 'bottom-right',
    backgroundColor: 'transparent',
    textColor: 'rgba(255, 255, 255, 0.7)',
  });

  // Wait a moment for watermark to render
  await new Promise(resolve => setTimeout(resolve, 100));

  // Use html2canvas directly with format options
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: options.scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    width: options.exportWidth,
    height: options.exportHeight,
    windowWidth: options.exportWidth,
    windowHeight: options.exportHeight,
    removeContainer: true,
    imageTimeout: 15000,
    onclone: (clonedDoc, clonedElement) => {
      // Inject CSS overrides first - this replaces all oklch CSS variables
      injectRGBOverrides(clonedDoc);
      
      // Get the target element
      const targetElement = clonedDoc.getElementById('image-render-card') || clonedElement;
      
      if (targetElement) {
        // Setup element dimensions
        setupExportElement(
          targetElement as HTMLElement,
          options.exportWidth,
          options.exportHeight,
          clonedDoc
        );
        
        // Ensure all images are loaded in the cloned document
        const images = targetElement.getElementsByTagName('img');
        Array.from(images).forEach((img) => {
          preserveImageStyles(img, clonedDoc);
        });
        
        // Convert SVG elements fill/stroke attributes
        convertSVGStyles(targetElement as HTMLElement, clonedDoc);
        
        // Convert all CSS variables and oklch colors to RGB - convert ALL elements recursively
        const allElements = targetElement.querySelectorAll('*');
        allElements.forEach((el) => {
          if (el instanceof HTMLElement || el instanceof SVGElement) {
            // Skip img elements - their border colors are already preserved above
            if (el.tagName.toLowerCase() !== 'img') {
              convertStylesToRGB(el as HTMLElement, clonedDoc);
            } else {
              // For img elements, only convert non-border properties
              const imgEl = el as HTMLElement;
              const win = clonedDoc.defaultView || (clonedDoc as any).parentWindow;
              if (win) {
                try {
                  const computedStyle = win.getComputedStyle(imgEl);
                  // Convert only non-border properties
                  const nonBorderProps = [
                    'color', 'backgroundColor', 'outlineColor', 
                    'background', 'backgroundImage', 'fill', 'stroke'
                  ];
                  nonBorderProps.forEach(prop => {
                    try {
                      const value = computedStyle.getPropertyValue(prop);
                      if (value && (value.includes('oklch') || value.includes('var('))) {
                        const computed = (computedStyle as any)[prop];
                        if (computed && computed !== 'rgba(0, 0, 0, 0)' && computed !== 'transparent' && computed !== 'none' && !computed.includes('oklch')) {
                          imgEl.style.setProperty(prop, computed, 'important');
                        }
                      }
                    } catch (e) {
                      // Ignore errors for individual properties
                    }
                  });
                } catch (e) {
                  // Ignore errors
                }
              }
            }
          }
        });
        
        // Also convert the root element itself
        convertStylesToRGB(targetElement as HTMLElement, clonedDoc);
        
        // Ensure watermark is present in cloned document
        let watermarkInClone = clonedDoc.getElementById('export-watermark');
        if (!watermarkInClone && targetElement instanceof HTMLElement) {
          // Ensure target element has position relative/absolute for watermark positioning
          const computedStyle = clonedDoc.defaultView?.getComputedStyle(targetElement);
          if (computedStyle && computedStyle.position === 'static') {
            targetElement.style.position = 'relative';
          }
          
          // Create watermark in cloned document
          watermarkInClone = createWatermarkElement(targetElement, {
            text: 'stage',
            position: 'bottom-right',
            fontSize: Math.max(24, Math.min(Math.min(options.exportWidth, options.exportHeight) * 0.04, 48)),
            backgroundColor: 'transparent',
            textColor: 'rgba(255, 255, 255, 0.7)',
          }, clonedDoc);
          targetElement.appendChild(watermarkInClone);
        }
        
        // Force a reflow to ensure styles are applied
        void clonedDoc.defaultView?.getComputedStyle(targetElement).width;
      }
    },
  });

  // Remove watermark DOM element after capture
  removeWatermark();

  if (!canvas) {
    throw new Error('Failed to create canvas');
  }

  // Verify canvas was created successfully
  console.log('Canvas created:', {
    width: canvas.width,
    height: canvas.height,
    scale: options.scale
  });

  // Also add watermark directly to canvas as a fallback (in case DOM watermark wasn't captured)
  // This ensures the watermark is always present
  try {
    addWatermarkToCanvas(canvas, {
      text: 'stage',
      position: 'bottom-right',
      backgroundColor: 'transparent',
      textColor: 'rgba(255, 255, 255, 0.7)',
    });
    console.log('Watermark added to canvas successfully');
  } catch (error) {
    console.error('Error adding watermark to canvas:', error);
    // Don't fail the export if watermark fails, but log the error
  }

  // Convert canvas to blob and data URL with specified format
  const mimeType = options.format === 'jpg' ? 'image/jpeg' : 'image/png';
  
  // Create blob first for better quality storage
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'));
        return;
      }
      resolve(blob);
    }, mimeType, options.quality);
  });
  
  // Also create data URL for immediate download
  const dataURL = canvas.toDataURL(mimeType, options.quality);
  
  if (!dataURL || dataURL === 'data:,') {
    throw new Error('Failed to generate image data URL');
  }

  return { dataURL, blob };
}

