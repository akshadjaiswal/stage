"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarLeft } from "./sidebar-left";
import { EditorHeader } from "./EditorHeader";
import { EditorContent } from "./EditorContent";
import { UploadArea } from "./UploadArea";
import { Footer } from "@/components/landing/Footer";
import { useImageStore } from "@/lib/store";
import { ImageRenderCard } from "@/components/image-render/image-render-card";

function EditorMain() {
  const { uploadedImageUrl, setImage } = useImageStore();
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const handleUpload = React.useCallback(async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "uploaded-image.png", { type: blob.type });
      setImage(file);
      setUploadError(null);
    } catch (error) {
      console.error("Failed to process uploaded image:", error);
      setUploadError("Failed to load image. Please try again.");
    }
  }, [setImage]);

  const handleFileUpload = React.useCallback(
    async (file: File) => {
      setUploadError(null);
      const blobUrl = URL.createObjectURL(file);
      await handleUpload(blobUrl);
    },
    [handleUpload]
  );

  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <div className="min-h-screen flex flex-col bg-background">
          <EditorHeader />
          <EditorContent>
            {!uploadedImageUrl ? (
              <UploadArea onUpload={handleFileUpload} error={uploadError} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageRenderCard imageUrl={uploadedImageUrl} />
              </div>
            )}
          </EditorContent>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function EditorLayout() {
  return <EditorMain />;
}
