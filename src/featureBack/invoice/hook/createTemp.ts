// utils/create-temp-file.ts
import path from "node:path";
import os from "node:os";
import { promises as fs } from "node:fs";
import crypto from "node:crypto";

export type TempFile = {
  /** Ruta absoluta al archivo temporal creado */
  path: string;
  /** Directorio temporal (para borrado recursivo) */
  dir: string;
  /** Borra el archivo (y opcionalmente el directorio) ahora mismo */
  cleanup: (opts?: { removeDir?: boolean }) => Promise<void>;
  /** Programa el borrado en X ms (devuelve un cancelador) */
  scheduleCleanup: (ms: number, opts?: { removeDir?: boolean }) => () => void;
};

/** Sanitiza un nombre para evitar paths raros y colisiones */
function sanitizeFileName(name: string, fallback = "upload") {
  const base = path.basename(name || fallback);
  // quita caracteres problemáticos y colapsa espacios
  const cleaned = base.replace(/[^\w.\-]+/g, "_");
  return cleaned.length ? cleaned : `${fallback}.bin`;
}

export async function createTempFile(file: File): Promise<TempFile> {
  // 1) Leemos el File (Web/File API) a Buffer
  const buf = Buffer.from(await file.arrayBuffer());

  // 2) Creamos un directorio temporal único
  const prefix = `ingest-${Date.now()}-${crypto.randomUUID()}-`;
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));

  // 3) Definimos un nombre seguro y único para el archivo
  const original = sanitizeFileName(file.name || "upload.pdf", "upload");
  const ext = path.extname(original) || guessExtFromType(file.type) || ".bin";
  const base = path.basename(original, path.extname(original));
  const unique = `${base}-${crypto.randomUUID()}${ext}`;
  const tmpPath = path.join(dir, unique);

  // 4) Escribimos el archivo
  await fs.writeFile(tmpPath, buf);

  // 5) Helpers de limpieza
  const cleanup = async (opts?: { removeDir?: boolean }) => {
    try {
      await fs.rm(tmpPath, { force: true });
    } catch {
      /* noop */
    }
    if (opts?.removeDir) {
      try {
        // borra el dir si quedó vacío (o forzar recursivo si querés)
        await fs.rmdir(dir).catch(async () => {
          // si no está vacío, borra recursivo
          await fs.rm(dir, { recursive: true, force: true });
        });
      } catch {
        /* noop */
      }
    }
  };
  // define un tipo seguro para el timer (sirve tanto en Node como en Browser)
  type CleanupTimer = ReturnType<typeof setTimeout> & { unref?: () => void };

  const scheduleCleanup = (ms: number, opts?: { removeDir?: boolean }) => {
    const timer = setTimeout(() => {
      void cleanup(opts);
    }, ms) as CleanupTimer;

    // en Node.js existe timer.unref(); en browser no. Evitamos any:
    timer.unref?.();

    // devolvemos un cancelador con tipos correctos
    return () => clearTimeout(timer);
  };

  return { path: tmpPath, dir, cleanup, scheduleCleanup };
}

/** Intento básico de inferir extensión por MIME cuando no hay extensión */
function guessExtFromType(mime?: string): string | null {
  if (!mime) return null;
  if (mime === "application/pdf") return ".pdf";
  if (mime.startsWith("image/")) {
    const sub = mime.split("/")[1];
    if (sub) return `.${sub}`;
  }
  if (mime === "text/plain") return ".txt";
  return null;
}

export default createTempFile;
