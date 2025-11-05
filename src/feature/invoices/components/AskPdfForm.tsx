"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
// Si tenés shadcn Input:
// import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";
import useAskPdf from "../hooks/useAskPdf";
import ListMessage from "@/feature/chat/ui/listMessage";
export type idPDF = { idPDF: string };
export default function AskPdfForm({ idPDF }: idPDF) {
  const { makeQuestion, error, isLoading, listMessage } = useAskPdf(idPDF);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [listMessage]);

  // Para focusear el input si querés (opcional)
  const textRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="flex h-full flex-col">
      <form onSubmit={makeQuestion}>
        <div className="p-4 sm:p-6 bg-background">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            Preguntas a PDF
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Escribí tu pregunta y el sistema la responderá usando tus PDFs.
          </p>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 flex-1 min-h-0">
          {/* IZQ: Input de texto ocupando el mismo espacio del uploader */}
          <Card className="p-4 sm:p-6 flex flex-col">
            <div
              className={cn(
                "rounded-lg border-2 border-dashed transition-all",
                "flex flex-col justify-center text-center",
                "px-4 sm:px-8 py-10 sm:py-14",
                "min-h-[180px] sm:min-h-[260px] outline-none",
                "border-border hover:border-accent/60 hover:bg-accent/5"
              )}
              onClick={() => textRef.current?.focus()}
              role="group"
              tabIndex={0}
            >
              <div className="mx-auto mb-4 rounded-full p-4 sm:p-6 bg-muted">
                <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
              </div>

              <div className="space-y-2 max-w-xl mx-auto w-full">
                {/* Si usás shadcn Input, reemplazá el <input> nativo */}
                <input
                  ref={textRef}
                  type="text"
                  name="question"
                  placeholder="Escribí tu pregunta aquí…"
                  disabled={isLoading}
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-3 text-sm sm:text-base",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    "transition-colors"
                  )}
                  // Para que “ocupe el mismo espacio”, dejamos el wrapper con min-height
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Tip: podés hacer preguntas específicas (“¿Cuál es el total de
                  la factura 123?”).
                </p>
              </div>
            </div>
          </Card>

          {/* DER: Historial / resultados (placeholder) */}
          <ListMessage listMessage={listMessage} />

          <Button
            variant="default"
            type="submit"
            className="w-full md:col-span-2 bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Consultando…" : "Preguntar"}
          </Button>
        </div>
      </form>
    </div>
  );
}


