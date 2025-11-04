import path from "path";
import os from "node:os";
import { promises as fs } from "node:fs";

async function CreateTempFile(file: File) {
  const buf = Buffer.from(await file.arrayBuffer());
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ingest-"));
  const tmpPath = path.join(tmpDir, file.name || "upload.pdf");
  await fs.writeFile(tmpPath, buf);
  return tmpPath;
}

export default CreateTempFile;
