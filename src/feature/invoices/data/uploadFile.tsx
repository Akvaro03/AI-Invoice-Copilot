async function UploadFile(files: File[]) {
    const form = new FormData();
  files.forEach((f) => form.append("files", f)); // clave 'files' repetida

  const res = await fetch("/api/invoices/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Fallo subiendo archivos");
  }

  return res.json(); // { ok, count, files: [...] }

}

export default UploadFile;
