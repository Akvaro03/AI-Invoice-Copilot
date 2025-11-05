import { useCallback, useId, useRef, useState } from "react";
import UploadFile from "../data/uploadFile";
import { useRouter } from "next/navigation";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

const BYTES = 1024;
const MAX_MB = 10;

type Options = {
  /** si llega un archivo nuevo y ya hay uno: true = reemplaza, false = bloquea */
  replaceOnAdd?: boolean;
};

function useUploadForm({ replaceOnAdd = true }: Options = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropId = useId();
  const router = useRouter();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const units = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(BYTES));
    return `${Math.round((bytes / Math.pow(BYTES, i)) * 100) / 100} ${
      units[i]
    }`;
  };

  // ✅ depende de uploadedFiles y replaceOnAdd
  const validate = useCallback(
    (files: File[]) => {
      const errors: string[] = [];
      const first = files[0];
      if (!first) {
        setError(null);
        return [];
      }
      const isPdf =
        first.type === "application/pdf" ||
        first.name.toLowerCase().endsWith(".pdf");
      const isOkSize = first.size <= MAX_MB * 1024 * 1024;

      if (!isPdf) errors.push(`"${first.name}" no es PDF`);
      if (!isOkSize) errors.push(`"${first.name}" supera ${MAX_MB}MB`);
      if (uploadedFiles.length === 1 && !replaceOnAdd) {
        errors.push(
          "Solo se permite 1 archivo (elimina el actual para agregar otro)."
        );
      }

      setError(errors.length ? errors.join(" • ") : null);
      return errors.length ? [] : [first];
    },
    [uploadedFiles.length, replaceOnAdd]
  );

  const syncToInput = useCallback((file: File | null) => {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    if (file) dt.items.add(file);
    inputRef.current.files = dt.files;
  }, []);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const valids = validate(files);
      if (!valids.length) return;
      const file = valids[0];

      setIsUploading(true);
      await new Promise((r) => setTimeout(r, 1200));

      const newEntry: UploadedFile = {
        id: Math.random().toString(36).slice(2, 11),
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
      };

      setUploadedFiles((prev) =>
        prev.length === 0 || replaceOnAdd ? [newEntry] : prev
      );
      syncToInput(file);
      setIsUploading(false);
    },
    [validate, replaceOnAdd, syncToInput]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) handleFiles(files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFiles(Array.from(files));
    },
    [handleFiles]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const files = Array.from(e.clipboardData.files);
      if (files.length) handleFiles(files);
    },
    [handleFiles]
  );

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const remaining = prev.filter((file) => file.id !== id);
      // si quedó vacío, limpia el input
      if (remaining.length === 0) syncToInput(null);
      return remaining;
    });
  };

  const saveFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      // toma SOLO el primero (o ninguno)
      const files = fd
        .getAll("invoices")
        .filter((v): v is File => v instanceof File)
        .slice(0, 1);
      if (!files.length) {
        setError("No hay archivo para enviar.");
        return;
      }
      const res = await UploadFile(files); // tu función actual
      router.push(`/invoices/${res.name}`);

    } catch (error) {
      console.log(error);
    }
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
