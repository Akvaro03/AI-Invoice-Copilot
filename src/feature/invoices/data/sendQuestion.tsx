async function sendQuestion(question: string, path: string) {
  const form = new FormData();
  form.append("question", question);
  form.append("path", path);
  const res = await fetch("/api/invoices/makeQuestion", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? "Fallo subiendo archivos");
  }

  return res.json(); // { ok, count, files: [...] }
}

export default sendQuestion;
