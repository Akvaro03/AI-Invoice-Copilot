import { OllamaEmbeddings } from "@langchain/ollama";
import RetrievalPdf from "./RetrievalPdf";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { CloudClient } from "chromadb";
import HandlePrompt from "./HandlePrompt";

async function MakeQuestion(path: string, question: string): Promise<string> {
  const chroma = new CloudClient({
    apiKey: process.env.CHROMA_API_KEY,
  });
  const safeSplits = await RetrievalPdf(path, "aa");
  const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://localhost:11434",
  });
  const vectorStore = await Chroma.fromDocuments(
    safeSplits, // tus chunks
    embeddings,
    {
      collectionName: "invoices222",
      index: chroma, // <- Pasa el CloudClient aquí (NO uses url localhost)
    }
  );
  const retriever = vectorStore.asRetriever({ k: 8 }); // top-4
  const retrievedDocs = await retriever.invoke(question);

  const { DoQuestion } = HandlePrompt({
    question,
    retrievedDocs,
  });

  const answerMsg = DoQuestion();
  return "Respuesta";
}
export default MakeQuestion;
