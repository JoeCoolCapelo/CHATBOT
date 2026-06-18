import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  error?: string;
}

export function FileUpload({ onFileSelect, selectedFile, error }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div 
        {...getRootProps()} 
        className={cn(
          "border-dashed border-2 border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-fast ease-[var(--transition-timing-function-standard)]",
          isDragActive ? "border-cyan bg-cyan/5 scale-[1.01]" : "hover:border-accent hover:bg-accent/5",
          error && "border-danger bg-danger/5"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className={cn("h-10 w-10 mb-4 transition-colors", isDragActive ? "text-cyan" : "text-orange")} />
        
        {selectedFile ? (
          <div className="flex flex-col items-center">
            <p className="text-sm font-semibold text-primary">{selectedFile.name}</p>
            <p className="text-caption text-muted mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} Mo</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-sm font-semibold text-primary">Glissez votre PDF ici</p>
            <p className="text-caption text-muted mt-1">PDF uniquement · 10 Mo max</p>
          </div>
        )}
      </div>
      {error && <span className="text-caption text-danger">{error}</span>}
    </div>
  );
}
