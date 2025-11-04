import path from "path";
import os from "node:os";
import { promises as fs } from "node:fs";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { CloudClient } from "chromadb";
import { ChatPromptTemplate } from "@langchain/core/prompts";
// Chat local
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { type DocumentInterface } from "@langchain/core/documents";
import RetrievalPdf from "./RetrievalPdf";
import CreateTempFile from "./createTemp";

async function UseIA(file: File) {
  // 1) Cliente de Chroma Cloud (usa API key + opcional tenant/db)
  const chroma = new CloudClient({
    apiKey: process.env.CHROMA_API_KEY,
  });

  // 2) Guardar a /tmp (Node runtime)
  const tmpPath = await CreateTempFile(file);
  // 3) Parseo + split
  const splits = await RetrievalPdf(tmpPath, file.name);
  // 5) Embeddings (Ollama local)
  const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://localhost:11434",
  });
  // 6) Indexar en TryChroma (colección NUEVA o existente)
  const vectorStore = await Chroma.fromDocuments(
    splits, // tus chunks
    embeddings,
    {
      collectionName: "invoices222",
      index: chroma, // <- Pasa el CloudClient aquí (NO uses url localhost)
    }
  );
  // 7) RAG
  const retriever = vectorStore.asRetriever({ k: 4 }); // top-4

  const llm = new ChatOllama({
    model: "qwen2.5:3b-instruct",
    baseUrl: "http://localhost:11434",
    temperature: 0,
  });
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Sos un asistente que responde SOLO con el contexto provisto. Si no alcanza, decí 'No hay suficiente info'. Incluí citas (página).",
    ],
    ["human", "Pregunta: {question}\n\nContexto:\n{context}"],
  ]);
  // 2) Función para formatear los docs a texto (sin `any`)
  type MetaWithPage = { page?: number; [k: string]: unknown };
  function formatContext(docs: DocumentInterface[]): string {
    return docs
      .map((d) => {
        const meta = (d.metadata ?? {}) as MetaWithPage;
        const page = typeof meta.page === "number" ? meta.page : 1;
        return `- (p.${page}) ${d.pageContent}`;
      })
      .join("\n");
  }
  // 3) Hacemos la pregunta correctamente
  const question = "¿Cuál es el nombre del cliente?";
  // Recuperamos pasajes relevantes para **esa** pregunta
  const retrievedDocs = await retriever.invoke(question);
  // Armamos variables del prompt
  const vars = {
    question,
    context: formatContext(retrievedDocs),
  };
  // 4) Ejecutamos prompt → LLM
  const answerMsg = await prompt.pipe(llm).invoke(vars);
  console.log(answerMsg);
}

export default UseIA;
