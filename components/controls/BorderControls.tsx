'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassInputWrapper } from '@/components/ui/glass-input-wrapper';
import { ImageBorder } from '@/lib/store';
import { BorderStyleSelector } from './BorderStyleSelector';

interface BorderControlsProps {
  border: ImageBorder;
  onBorderChange: (border: ImageBorder | Partial<ImageBorder>) => void;
}

export function BorderControls({ border, onBorderChange }: BorderControlsProps) {
  const isBasicStyle = ['solid', 'dashed', 'dotted', 'double'].includes(border.style);
  const isDefaultStyle = border.style === 'default';

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Border
          </Label>
          <Button
            variant={border.enabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => onBorderChange({ enabled: !border.enabled })}
            className={`text-xs transition-all rounded-lg ${
              border.enabled
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                : 'border-border hover:border-border/80 hover:bg-accent text-foreground'
            }`}
          >
            {border.enabled ? 'Enabled' : 'Disabled'}
          </Button>
        </div>

        {border.enabled && (
          <>
            <BorderStyleSelector border={border} onBorderChange={onBorderChange} />

            {/* Show message for default style */}
            {isDefaultStyle && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                  Default style means no border will be applied to the image.
                </p>
              </div>
            )}

            {isBasicStyle && (
              <>
                {/* Individual Border Controls */}
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-gray-700">Border Sides</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onBorderChange({ top: !border.top })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        border.top
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Top {border.top ? '✓' : ''}
                    </button>
                    <button
                      onClick={() => onBorderChange({ right: !border.right })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        border.right
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Right {border.right ? '✓' : ''}
                    </button>
                    <button
                      onClick={() => onBorderChange({ bottom: !border.bottom })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        border.bottom
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Bottom {border.bottom ? '✓' : ''}
                    </button>
                    <button
                      onClick={() => onBorderChange({ left: !border.left })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        border.left
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Left {border.left ? '✓' : ''}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium text-gray-700">Border Width</Label>
                    <span className="text-xs text-gray-500 font-medium">{border.width}px</span>
                  </div>
                  <Slider
                    value={[border.width]}
                    onValueChange={(value) => onBorderChange({ width: value[0] })}
                    min={0.5}
                    max={20}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-medium text-gray-700">Border Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={border.color}
                      onChange={(e) => onBorderChange({ color: e.target.value })}
                      className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer hover:border-gray-400 transition-colors shadow-sm"
                      title="Pick border color"
                    />
                    <GlassInputWrapper className="flex-1">
                      <Input
                        type="text"
                        value={border.color}
                        onChange={(e) => onBorderChange({ color: e.target.value })}
                        placeholder="#000000"
                        className="border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </GlassInputWrapper>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-medium text-gray-700">Border Radius</Label>
                    <span className="text-xs text-gray-500 font-medium">{border.borderRadius}px</span>
                  </div>
                  <Slider
                    value={[border.borderRadius]}
                    onValueChange={(value) => onBorderChange({ borderRadius: value[0] })}
                    min={0}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-gray-700">Inset (Ring Inset)</Label>
                    <Button
                      variant={border.inset ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onBorderChange({ inset: !border.inset })}
                      className={`text-xs transition-all rounded-lg ${
                        border.inset
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                          : 'border-border hover:border-border/80 hover:bg-accent text-foreground'
                      }`}
                    >
                      {border.inset ? 'On' : 'Off'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    When enabled, border appears inside the element using box-shadow inset
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
