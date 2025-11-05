import { DocumentInterface } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";

type props = {
  question: string;
  retrievedDocs: DocumentInterface<Record<string, unknown>>[];
};

function HandlePrompt({ question, retrievedDocs }: props) {
  const llm = new ChatOllama({
    model: "mistral:7b-instruct-q4_K_M",
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
  const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://localhost:11434",
  });
  const vars = {
    question,
    context: formatContext(retrievedDocs),
  };

  const DoQuestion = async () => {
    return await prompt.pipe(llm).invoke(vars);
  };
  return { llm, prompt, embeddings, DoQuestion };
}
function formatContext(docs: DocumentInterface[]): string {
  return docs
    .map((d) => {
      const meta = (d.metadata ?? {}) as MetaWithPage;
      const page = typeof meta.page === "number" ? meta.page : 1;
      return `- (p.${page}) ${d.pageContent}`;
    })
    .join("\n");
}
type MetaWithPage = { page?: number; [k: string]: unknown };
export default HandlePrompt;
