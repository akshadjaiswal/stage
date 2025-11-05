'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Shuffle, ZoomIn, ZoomOut, Undo2, Redo2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

export function EditorBottomBar() {
  return (
    <div className="h-14 bg-white border-t border-gray-200 flex items-center justify-between px-6">
      {/* Left side - Open Source and Shuffle */}
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/KartikLabhshetwar/stage"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="outline"
            className="h-9 px-4 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md transition-all font-medium gap-2"
          >
            <FaGithub className="size-4" />
            <span>Proudly Open Source</span>
          </Button>
        </a>
        <Button
          variant="outline"
          className="h-9 px-4 rounded-xl border-gray-300 hover:bg-gray-50 text-gray-700 gap-2"
        >
          <Shuffle className="size-4" />
          <span>Shuffle</span>
        </Button>
      </div>

      {/* Right side - Zoom and Undo/Redo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 border border-gray-300 rounded-xl overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-none hover:bg-gray-100"
          >
            <ZoomOut className="size-4" />
          </Button>
          <div className="px-3 py-1 text-xs font-medium text-gray-700 border-x border-gray-300">
            100%
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-none hover:bg-gray-100"
          >
            <ZoomIn className="size-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-1 border border-gray-300 rounded-xl overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-none hover:bg-gray-100"
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-none hover:bg-gray-100"
          >
            <Redo2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

