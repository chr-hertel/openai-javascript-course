import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { CharacterTextSplitter } from "langchain/text_splitter";

// Example: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/pdf
export default async function handler(req, res) {
  if (req.method === "GET") {
    console.log("Inside the PDF handler");

    // Load PDF as docs
    const bookPath =
      "/home/christopher/Playground/LangChain/openai-javascript-course/data/document_loaders/naval-ravikant-book.pdf";
    const loader = new PDFLoader(bookPath);
    const docs = await loader.load();

    if (docs.length === 0) {
      console.log("No documents found");
      return;
    }

    console.log(`Loaded ${docs.length} documents.`);

    // Split the documents into smaller chunks
    const splitter = new CharacterTextSplitter({
      separator: " ",
      chunkSize: 250,
      chunkOverlap: 10,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    console.log(`Split into ${splitDocs.length} documents.`);

    // Reduce the size of the metadata
    const reducedDocs = splitDocs.map((doc) => {
      const reducedMetadata = { ...doc.metadata };
      delete reducedMetadata.pdf;
      return new Document({
        pageContent: doc.pageContent,
        metadata: reducedMetadata,
      });
    });

    console.log("Reduced documents.");

    /** STEP TWO: UPLOAD TO DATABASE */
    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
    await PineconeStore.fromDocuments(reducedDocs, new OpenAIEmbeddings(), {
      pineconeIndex,
    });

    console.log("Successfully uploaded to database.");

    // upload documents to Pinecone
    return res.status(200).json({ result: "OK" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
