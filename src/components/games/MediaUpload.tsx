import { useRef } from "react";
import { Image, X, Plus, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
}

interface MediaUploadProps {
  files: MediaFile[];
  onChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  accept?: string;
  className?: string;
  placeholder?: string;
}

export function MediaUpload({
  files,
  onChange,
  maxFiles = 1,
  accept = "image/*,video/*",
  className,
  placeholder = "Click to upload",
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    // In single mode, replace the existing file
    if (isSingleMode) {
      // Revoke old file URL if exists
      if (files[0]) {
        URL.revokeObjectURL(files[0].url);
      }
      const file = selectedFiles[0];
      if (file) {
        const newFile: MediaFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: URL.createObjectURL(file),
          type: file.type.startsWith("video/") ? "video" : "image",
          name: file.name,
        };
        onChange([newFile]);
      }
    } else {
      // Multi-file mode: add files up to max
      const remainingSlots = maxFiles - files.length;
      const filesToAdd = Array.from(selectedFiles).slice(0, remainingSlots);

      const newFiles: MediaFile[] = filesToAdd.map((file) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
        name: file.name,
      }));

      onChange([...files, ...newFiles]);
    }
    
    // Reset input so the same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemove = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file) {
      URL.revokeObjectURL(file.url);
    }
    onChange(files.filter((f) => f.id !== id));
  };

  const canAddMore = files.length < maxFiles;
  const isSingleMode = maxFiles === 1;

  // Single file mode
  if (isSingleMode) {
    const file = files[0];
    
    return (
      <div className={cn("relative", className)}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {file ? (
          <div className="relative bg-muted rounded-lg h-40 overflow-hidden group border-2 border-transparent hover:border-primary transition-colors flex items-center justify-center">
            <div className="aspect-[4/3] h-full overflow-hidden">
              {file.type === "video" ? (
                <video
                  src={file.url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
              >
                <Image className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(file.id);
                }}
                className="bg-destructive/80 hover:bg-destructive text-white p-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="bg-muted rounded-lg h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors border-2 border-transparent hover:border-primary"
          >
            <Image className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          </div>
        )}
      </div>
    );
  }

  // Multi-file mode
  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {files.map((file) => (
            <div key={file.id} className="relative aspect-square bg-muted rounded-lg overflow-hidden group border-2 border-transparent hover:border-primary transition-colors">
              {file.type === "video" ? (
                <div className="relative w-full h-full">
                  <video
                    src={file.url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Video className="h-6 w-6 text-white drop-shadow-lg" />
                  </div>
                </div>
              ) : (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => handleRemove(file.id)}
                className="absolute top-1 right-1 bg-destructive/80 hover:bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {canAddMore && (
        <div
          onClick={() => inputRef.current?.click()}
          className="bg-muted rounded-lg h-[120px] flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors border-2 border-dashed border-muted-foreground/20 hover:border-primary hover:border-solid"
        >
          <Plus className="h-6 w-6 text-muted-foreground mb-1" />
          <span className="text-sm text-muted-foreground">
            Add media ({files.length}/{maxFiles})
          </span>
        </div>
      )}
      
      {!canAddMore && (
        <p className="text-xs text-muted-foreground text-center">
          Maximum of {maxFiles} files reached
        </p>
      )}
    </div>
  );
}
