import { useCallback, useId, useRef, useState } from "react";
import UploadFile from "../data/uploadFile";
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
}
const BYTES = 1024;
const MAX_MB = 10;
function useUploadForm() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropId = useId();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const units = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(BYTES));
    return `${Math.round((bytes / Math.pow(BYTES, i)) * 100) / 100} ${
      units[i]
    }`;
  };

  const validate = (files: File[]) => {
    const errors: string[] = [];
    const valids = files.filter((f) => {
      const isPdf =
        f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
      const isOkSize = f.size <= MAX_MB * 1024 * 1024;
      if (!isPdf) errors.push(`"${f.name}" no es PDF`);
      if (!isOkSize) errors.push(`"${f.name}" supera ${MAX_MB}MB`);
      return isPdf && isOkSize;
    });
    setError(errors.length ? errors.join(" • ") : null);
    return valids;
  };
  const syncToInput = (files: File[]) => {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    inputRef.current.files = dt.files; // ahora forman parte del <form>
  };

  const handleFiles = async (files: File[]) => {
    const valids = validate(files);
    if (!valids.length) return;
    setIsUploading(true);

    // Simulación de subida
    await new Promise((r) => setTimeout(r, 1200));

    const newFiles: UploadedFile[] = valids.map((file) => ({
      id: Math.random().toString(36).slice(2, 11),
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    }));

    setUploadedFiles((prev) => [...newFiles, ...prev]); // los últimos arriba
    setIsUploading(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) {
      handleFiles(files);
      syncToInput(files);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFiles(Array.from(files));
    },
    []
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length) {
      handleFiles(files);
      syncToInput(files);
    }
  }, []);

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };
  const saveFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    // Trae TODOS los archivos del input con name="invoices"
    const files = fd
      .getAll("invoices")
      .filter((v): v is File => v instanceof File);
    UploadFile(files);
  };
  return {
    uploadedFiles,
    isUploading,
    isDragging,
    inputRef,
    dropId,
    error,
    handleFileInput,
    handleDragLeave,
    formatFileSize,
    handleDragOver,
    removeFile,
    handleDrop,
    handlePaste,
    saveFile,
  };
}

export default useUploadForm;
