"use client";
import { MoreHorizontal, Upload, Download, Trash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SavedImage } from './types';
import { cn } from '@/lib/utils';

interface SavedPromosProps {
  savedImages: SavedImage[];
  selectedImageIndex: number | null;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onOverwrite: (index: number) => void;
  previewOverwrite: number | null;
  imageToOverwrite: number | null;
}

export function SavedPromos({
  savedImages,
  selectedImageIndex,
  onEdit,
  onDelete,
  onOverwrite,
  previewOverwrite,
  imageToOverwrite,
}: SavedPromosProps) {
  if (savedImages.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No saved promos yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {savedImages.map((img, index) => (
          <div
            key={index}
            className={cn(
              "group relative border rounded-lg overflow-hidden aspect-square bg-muted/50",
              selectedImageIndex === index && "ring-2 ring-primary ring-offset-2"
            )}
          >
            <img
              src={img.composite}
              alt={`Saved promo ${index + 1}`}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(index)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = img.composite;
                      link.download = `promo-${index + 1}.jpg`;
                      link.click();
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDelete(index)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 