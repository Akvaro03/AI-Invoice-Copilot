// app/api/invoices/upload/route.ts
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import UseIA from "@/featureBack/invoice/hook/useIA";

// Fuerza runtime Node para poder usar fs (en Vercel: Serverless/Node)
// Si preferís Edge, no podés escribir en disco (usar S3).
export const runtime = "nodejs";

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-]/g, "_");
}

export async function POST(req: Request) {
  try {
    // 1) Leer form-data
    const formData = await req.formData();

    // 2) Obtener TODOS los 'files' (pueden venir varios con la misma key)
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No se recibieron archivos en 'files'." },
        { status: 400 }
      );
    }

    // 3) Carpeta destino (local dev). En producción -> usar storage (S3, GCS, etc.)
    const uploadDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });

    // 4) Guardar cada file
    const saved: Array<{
      name: string;
      size: number;
      savedAs: string;
      path: string;
    }> = [];

    for (const file of files) {
      // Tipos/validaciones opcionales
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          {
            ok: false,
            error: `Solo se aceptan PDF. ${file.name} es ${file.type}`,
          },
          { status: 415 }
        );
      }
      UseIA(file);
      // Crear buffer
      // const bytes = await file.arrayBuffer();
      // const buffer = Buffer.from(bytes);

      // // Nombre seguro + timestamp para evitar colisiones
      // const safeName = `${Date.now()}_${sanitizeFileName(file.name)}`;
      // const filePath = path.join(uploadDir, safeName);

      // // Escribir
      // await writeFile(filePath, buffer);

      // saved.push({
      //   name: file.name,
      //   size: file.size,
      //   savedAs: safeName,
      //   path: `/uploads/${safeName}`, // si servís estático la carpeta
      // });
    }

    return NextResponse.json({ ok: true, count: saved.length, files: saved });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Error procesando la subida." },
      { status: 500 }
    );
  }
}
