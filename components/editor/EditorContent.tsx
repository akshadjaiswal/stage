"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EditorContentProps {
  children: React.ReactNode;
  className?: string;
}

export function EditorContent({ children, className }: EditorContentProps) {
  return (
    <main
      className={cn(
        "flex-1 flex items-center justify-center",
        "p-6 sm:p-8 md:p-12 lg:p-16",
        className
      )}
    >
      {children}
    </main>
  );
}

