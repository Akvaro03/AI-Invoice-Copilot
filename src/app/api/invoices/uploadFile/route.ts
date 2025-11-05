// app/api/invoices/upload/route.ts
import { NextResponse } from "next/server";
import path from "path";
import CreateTempFile from "@/featureBack/invoice/hook/createTemp";

// Fuerza runtime Node para poder usar fs (en Vercel: Serverless/Node)
// Si preferís Edge, no podés escribir en disco (usar S3).
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("files") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No se recibieron archivos en 'files'." },
        { status: 400 }
      );
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { ok: false, error: `Solo PDF. Recibido: ${file.type}` },
        { status: 415 }
      );
    }
    // UseIA(file);
    const tmpFile = await CreateTempFile(file);
    tmpFile.scheduleCleanup(2 * 80_000, { removeDir: true });
    const filename = path.basename(tmpFile.path);

    return NextResponse.json({ ok: true, name: filename });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Error procesando la subida." },
      { status: 500 }
    );
  }
}
