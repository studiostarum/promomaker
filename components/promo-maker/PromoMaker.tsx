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
    <main className="h-svh bg-primary">
      <div className="container mx-auto max-w-7xl p-4 md:p-6 h-full">
        <div className="grid grid-cols-[300px,1fr] gap-6 h-full">
          {/* Controls Card */}
          <Card className="bg-muted/5 border-none">
            <CardContent className="p-6 h-full">
              <div className="flex flex-col gap-8 justify-between h-full">
                <div className="flex flex-col gap-6">
                  {/* Upload controls */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      variant="secondary"
                      className="whitespace-nowrap"
                      onClick={() => navigator.clipboard.readText()}
                      title="Paste from clipboard (Ctrl+V)"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    Or press Ctrl+V (Cmd+V on Mac) to paste an image
                  </p>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      className="w-full"
                      onClick={handleDownload}
                      disabled={!image}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleSave()}
                      disabled={!image}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
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
          <Card className="bg-muted/5 border-none">
            <CardContent className="p-6">
              <div className="max-w-2xl mx-auto">
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