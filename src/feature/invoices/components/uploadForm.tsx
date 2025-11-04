"use client";

import { Upload, FileText, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import useUploadForm from "../hooks/useUploadForm";

const MAX_MB = 10;

export default function UploadFormInvoice() {
  const {
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
  } = useUploadForm();
  return (
    // OJO: no fijamos altura absoluta aquí; dejamos que el contenedor padre (Dialog) mande.
    <div className="flex h-full flex-col">
      {/* Header compacto, fijo arriba */}
      <div className="p-4 sm:p-6 bg-background">
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
          Gestor de Facturas
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Subí tus facturas en PDF de forma rápida y segura.
        </p>
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Main: grid 1col -> 2col, con overflow sólo aquí */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 flex-1 min-h-0">
        {/* IZQ: Uploader */}
        <Card className="p-4 sm:p-6 flex flex-col">
          <div
            id={dropId}
            aria-label="Área para soltar o seleccionar archivos PDF"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && inputRef.current?.click()
            }
            onPaste={handlePaste}
            role="button"
            tabIndex={0}
            className={cn(
              "rounded-lg border-2 border-dashed transition-all",
              "flex flex-col items-center justify-center text-center",
              "px-4 sm:px-8 py-10 sm:py-14",
              "min-h-[180px] sm:min-h-[260px] outline-none",
              isDragging
                ? "border-accent bg-accent/10 scale-[1.01]"
                : "border-border hover:border-accent/60 hover:bg-accent/5"
            )}
          >
            <div
              className={cn(
                "rounded-full p-4 sm:p-6 mb-4 transition-colors",
                isDragging ? "bg-accent/20" : "bg-muted"
              )}
            >
              <Upload
                className={cn(
                  "w-8 h-8 sm:w-12 sm:h-12",
                  isDragging ? "text-accent" : "text-muted-foreground"
                )}
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-semibold">
                {isDragging
                  ? "¡Soltá tus archivos aquí!"
                  : "Arrastrá tus facturas"}
              </h3>
              <p className="text-muted-foreground">
                o hacé clic para seleccionar
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Solo PDF • Máx. {MAX_MB}MB por archivo
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                También podés <kbd className="px-1.5 py-0.5 rounded ">Ctrl</kbd>
                +<kbd className="px-1.5 py-0.5 rounded">V</kbd> para pegar.
              </p>
            </div>

            <div className="mt-6">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isUploading}
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                {isUploading ? "Subiendo..." : "Seleccionar archivos"}
              </Button>
              <input
                ref={inputRef}
                id="file-upload"
                type="file"
                name="invoices" // <— IMPORTANTE
                accept=".pdf,application/pdf"
                multiple
                onChange={handleFileInput}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>
        </Card>

        {/* DER: Lista */}
        <Card className="flex min-h-0 flex-col">
          <div className="flex items-center gap-2 p-4">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <h3 className="text-base sm:text-lg font-semibold">
              Facturas subidas{" "}
              {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
            </h3>
          </div>

          {uploadedFiles.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div className="text-muted-foreground">
                <p className="font-medium">Aún no subiste archivos</p>
                <p className="text-sm">
                  Cargá tus PDFs desde el panel izquierdo
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="rounded-md bg-accent/20 p-2 flex-shrink-0">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {formatFileSize(file.size)} •{" "}
                        {file.uploadedAt.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0"
                    aria-label={`Eliminar ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Button
          variant="default"
          type="submit"
          form="upload-form"
          className="bg-accent hover:bg-accent/90 text-accent-foreground w-full"
          size="lg"
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
