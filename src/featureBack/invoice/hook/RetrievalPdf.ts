import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocumentInterface } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

async function RetrievalPdf(path: string, name: string) {
  const loader = new PDFLoader(path, { splitPages: true });
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1400,
    chunkOverlap: 200,
  });
  const splits = await splitter.splitDocuments(docs);

  // 4) LIMPIAR metadata (solo primitivos)
  const docId = `doc:${Date.now()}:${name}`;
  const safeSplits: DocumentInterface[] = splits.map((d, i) => {
    const meta = d.metadata as PdfLoaderMeta;
    const page = getPageNumber(meta, i + 1);

    // metadata SOLO con primitivos
    const metadata: Record<string, string | number | boolean | null> = {
      docId,
      fileName: name,
      page,
      uploadedAt: Date.now(),
    };

    return {
      pageContent: d.pageContent,
      metadata, // <- ya sin objetos anidados
    };
  });

  return safeSplits;
}
type PdfLoaderMeta = {
  loc?: { pageNumber?: number };
  page?: number;
} & Record<string, unknown>;
// helper para obtener la página de forma segura
function getPageNumber(meta: PdfLoaderMeta, fallback = 1): number {
  if (typeof meta?.loc?.pageNumber === "number") return meta.loc.pageNumber;
  if (typeof meta?.page === "number") return meta.page;
  return fallback;
}
export default RetrievalPdf;
