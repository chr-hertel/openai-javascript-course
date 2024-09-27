/**
 * This endpoint is used to load the resumes into the chain, then upload them to the Pinecone database.
 * Tutorial: https://js.langchain.com/docs/modules/indexes/document_loaders/examples/file_loaders/directory
 * Summarization: https://js.langchain.com/docs/modules/chains/other_chains/summarization
 * Dependencies: npm install pdf-parse
 */

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAI } from "langchain/llms/openai";
import { VectorDBQAChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";

export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    const client = new PineconeClient();
    await client.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    const index = client.Index(process.env.PINECONE_INDEX);
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex: index }
    );

    // Create Vector DBQA Chain
    const model = new OpenAI({ temperature: 0 });
    const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
      k: 2,
      returnSourceDocuments: true,
    });

    // Prompt Template
    const template = new PromptTemplate({
      template:
        "Assume you are an Human Resources Director. According to the resumes, anwser this question: {question}",
      inputVariables: ["question"],
    });

    const formattedPrompt = await template.format({ question: prompt });

    console.log({ formattedPrompt });

    const response = await chain.call({
      query: formattedPrompt,
    });

    console.log({ response });

    return res.status(200).json({
      output: response.text,
      sourceDocuments: response.sourceDocuments,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error" });
  }
}
