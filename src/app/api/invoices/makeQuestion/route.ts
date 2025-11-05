import MakeQuestion from "@/featureBack/invoice/hook/makeQuestion";
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "path";

// Fuerza runtime Node para poder usar fs (en Vercel: Serverless/Node)
// Si preferís Edge, no podés escribir en disco (usar S3).
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const question = formData.get("question") as string | null;
    const filename = formData.get("path") as string | null;

    if (!question || !filename) {
      return NextResponse.json(
        { ok: false, error: "No se recibieron archivos en 'files'." },
        { status: 400 }
      );
    }
    const path = await findTempFilePath(filename);
    if (!path) {
      return NextResponse.json(
        { ok: false, error: "Ya no existe" },
        { status: 400 }
      );
    }

    const response = await MakeQuestion(path, question);

    return NextResponse.json({ ok: true, responsive: response });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { ok: false, error: "Error procesando la subida." },
      { status: 500 }
    );
  }
}

export async function findTempFilePath(
  filenameRaw: string
): Promise<string | null> {
  // Sanitizar: quedarnos con el basename para evitar path traversal
  const filename = path.basename(filenameRaw);

  const tmpRoot = os.tmpdir();
  const entries = await fs.readdir(tmpRoot, { withFileTypes: true });

  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (!ent.name.startsWith("ingest-")) continue;

    const candidate = path.join(tmpRoot, ent.name, filename);
    try {
      const st = await fs.stat(candidate);
      if (st.isFile()) return candidate;
    } catch {
      // no existe en esta carpeta, seguimos
    }
  }

  return null; // no se encontró
}
