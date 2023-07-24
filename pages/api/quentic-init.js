import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import fs from "fs";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { CharacterTextSplitter } from "langchain/text_splitter";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    throw new Error("HTTP method not supported");
  }

  const vectorDir =
    "/home/christopher/Playground/LangChain/openai-javascript-course/data/quentic-vector/";
  const sourceDir =
    "/home/christopher/Playground/LLaMA/quentic-help-transformer/var/paragraphs/help_en/first-steps/";

  if (fs.existsSync(vectorDir)) {
    return res.status(200).json("already exists");
  }

  const loader = new DirectoryLoader(sourceDir, {
    ".json": (path) => new JSONLoader(path, "/pageContent"),
  });
  const documents = await loader.load();

  console.log(`Found ${documents.length} documents.`);

  // const splitter = new CharacterTextSplitter({
  //   separator: " ",
  //   chunkSize: 200,
  //   chunkOverlap: 10,
  // });
  // const splitDocs = await splitter.splitDocuments(documents);
  // console.log(`Created ${splitDocs.length} documents`);
  // console.log(splitDocs);

  try {
    const vectorStore = await HNSWLib.fromDocuments(
      documents,
      new OpenAIEmbeddings({
        verbose: true,
        batchSize: 50,
      })
    );

    await vectorStore.save(vectorDir);
  } catch (err) {
    console.log(err);

    return res.status(500).json(err);
  }

  return res.status(201).json("created");
}
