"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageEditor } from "./ImageEditor";
import { SavedPromos } from "./SavedPromos";
import { OverwriteDialog } from "./OverwriteDialog";
import { usePromoMaker } from "@/hooks/usePromoMaker";
import { Download, Upload, Image as ImageIcon, Save, History } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export function PromoMaker() {
  const {
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
  } = usePromoMaker();

  const [showSavedPromos, setShowSavedPromos] = useState(false);
  const recentPromos = savedImages.slice(-2).reverse();

  return (
    <main className="h-svh bg-primary text-white">
      <div className="container mx-auto max-w-7xl p-4 md:p-6 h-full flex items-center justify-center">
        <div className="w-full max-h-[48rem] h-full">
          <div className="grid grid-cols-[300px,1fr] gap-6 h-full">
            {/* Controls Card */}
            <Card className="bg-muted/5 border-none h-full">
              <CardContent className="p-6 h-full">
                <div className="flex flex-col gap-8 justify-between h-full">
                  <div className="flex flex-col gap-6">
                    {/* Upload controls */}
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </Button>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outlineSecondary"
                          onClick={handleDownload}
                          disabled={!image}
                          aria-label="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outlineSecondary"
                          onClick={() => handleSave()}
                          disabled={!image}
                          aria-label="Save"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="flex justify-center h-full items-center border rounded-md p-6 border-dashed border-muted-foreground/30 text-sm text-background/30 text-center hover:bg-muted-foreground/5 transition-colors cursor-pointer">
                      Or press CTRL/CMD + V to paste an image.
                    </p>
                  </div>

                  {/* Recent Promos */}
                  {recentPromos.length > 0 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {recentPromos.map((promo, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden border bg-muted/50 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleEdit(savedImages.length - index - 1)}
                          >
                            <img
                              src={promo.composite}
                              alt={`Recent promo ${index + 1}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowSavedPromos(true)}
                      >
                        <History className="mr-2 h-4 w-4" />
                        View all saved images
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="bg-muted/5 border-none h-full">
              <CardContent className="p-6 h-full">
                <div className="h-full">
                  <ImageEditor
                    image={image}
                    onSave={handleSave}
                    onDownload={handleDownload}
                    imageTransform={imageTransform}
                    onTransformChange={setImageTransform}
                    overlayVisible={overlayVisible}
                    overlayOpacity={overlayOpacity}
                    onOverlayVisibleChange={setOverlayVisible}
                    onOverlayOpacityChange={setOverlayOpacity}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Saved Promos Modal */}
        <Dialog open={showSavedPromos} onOpenChange={setShowSavedPromos}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Saved Promos</DialogTitle>
            </DialogHeader>
            <SavedPromos
              savedImages={savedImages}
              selectedImageIndex={selectedImageIndex}
              onEdit={(index) => {
                handleEdit(index);
                setShowSavedPromos(false);
              }}
              onDelete={handleDelete}
              onOverwrite={handleOverwrite}
              previewOverwrite={previewOverwrite}
              imageToOverwrite={imageToOverwrite}
            />
          </DialogContent>
        </Dialog>

        <OverwriteDialog
          open={showOverwriteDialog}
          onOpenChange={setShowOverwriteDialog}
          onConfirm={() => {
            if (imageToOverwrite !== null) {
              handleSave(imageToOverwrite);
            }
          }}
        />
      </div>
    </main>
  );
} 