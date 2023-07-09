// /pages/api/resume_upload.js
// Import dependencies

/**
 * This endpoint is used to load the resumes into the chain, then upload them to the Pinecone database.
 * Tutorial: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/directory
 * Summarization: https://js.langchain.com/docs/modules/chains/other_chains/summarization
 * Dependencies: npm install pdf-parse
 */

import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PineconeClient } from "@pinecone-database/pinecone";
import { loadSummarizationChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { load } from "cheerio";

export default async function handler(req, res) {
  // Grab the prompt from the url (?prompt=[value])
  //   console.log(process.env.PINECONE_API_KEY);
  //   console.log(process.env.PINECONE_ENVIRONMENT);
  //   console.log(process.env.PINECONE_INDEX);
  // Always use a try catch block to do asynchronous requests and catch any errors
  try {
    // do stuff
    const directory =
      "/home/christopher/Playground/LangChain/openai-javascript-course/data/resumes";
    const loader = new DirectoryLoader(directory, {
      ".pdf": (path) => new PDFLoader(path),
    });
    const docs = await loader.load();
    // Splitt the documents with their metadata
    const splitter = new CharacterTextSplitter({
      separator: " ",
      chunkSize: 200,
      chunkOverlap: 20,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // reduce the metadata
    const reducedDocs = splitDocs.map((doc) => {
      const fileName = doc.metadata.source.split("/").pop();
      const [_, firstName, lastName] = fileName.split("_");

      return {
        ...doc,
        metadata: {
          first_name: firstName,
          last_name: lastName.slice(0, -4),
          docType: "resume",
        },
      };
    });

    let summaries = [];
    const model = new OpenAI({ temperature: 0 });
    const summarizeAllChain = loadSummarizationChain(model, {
      type: "map_reduce",
    });

    const summarizeRes = await summarizeAllChain.call({
      input_documents: docs,
    });
    summaries.push({ summary: summarizeRes.text });

    // Summarize each candidate
    for (let doc of docs) {
      const summarizeOneChain = loadSummarizationChain(model, {
        type: "map_reduce",
      });

      const summarizeOneRes = await summarizeOneChain.call({
        input_documents: [doc],
      });

      summaries.push({ summary: summarizeOneRes.text });
    }

    // Upload the reducedDocs
    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    const index = client.Index(process.env.PINECONE_INDEX);
    await PineconeStore.fromDocuments(reducedDocs, new OpenAIEmbeddings(), {
      pineconeIndex: index,
    });

    console.log("Uploaded to pinecone");

    const summaryStr = JSON.stringify(summaries, null, 2);
    return res.status(200).json({ output: summaryStr });
  } catch (err) {
    // If we have an error

    console.error(err);
    return res.status(500).json({ error: err });
  }
}
