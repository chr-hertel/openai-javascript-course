// /pages/api/transcript.js
import { YoutubeTranscript } from "youtube-transcript";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { OpenAI } from "langchain";

// Global variables
let chain;
let chatHistory = [];

// DO THIS SECOND
const initializeChain = async (initialPrompt, transcript) => {
  try {
    const model = new ChatOpenAI({
      temperature: 0.8,
      modelName: "gpt-3.5-turbo",
    });

    const vectorStore = await HNSWLib.fromDocuments(
      [{ pageContent: transcript }],
      new OpenAIEmbeddings()
    );

    // const directory =
    //   "/home/christopher/Playground/LangChain/openai-javascript-course/data/vector/";
    // await vectorStore.save(directory);

    // const loadedVectorStore = await HNSWLib.load(
    //   directory,
    //   new OpenAIEmbeddings()
    // );

    chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(),
      { verbose: true }
    );

    const response = await chain.call({
      question: initialPrompt,
      chat_history: chatHistory,
    });

    chatHistory.push({
      role: "assistant",
      content: response.text,
    });
    return response;
  } catch (error) {
    console.error(error);
  }
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Get the message from the request body
    const { prompt, firstMsg } = req.body;
    console.log({ prompt, firstMsg });

    // Then if it's the first message, we want to initialize the chain, since it doesn't exist yet
    if (firstMsg) {
      try {
        const initialPrompt = `Give me a summary of the transcript: ${prompt}`;
        chatHistory.push({
          role: "user",
          content: initialPrompt,
        });

        // YouTube Transcript API
        const transcript = await YoutubeTranscript.fetchTranscript(prompt);

        if (!transcript) {
          return res.status(400).json({ error: "Failed to get transcript" });
        }

        let transcriptFlat = "";
        transcript.forEach((line) => {
          transcriptFlat += line.text + " ";
        });

        const response = await initializeChain(initialPrompt, transcriptFlat);

        return res.status(200).json({ output: response, chatHistory });
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "An error occurred while fetching transcript" });
      }
    } else {
      // If it's not the first message, we want to continue the conversation
      console.log("Continuing conversation");

      try {
        chatHistory.push({
          role: "user",
          content: prompt,
        });

        const response = await chain.call({
          question: prompt,
          chat_history: chatHistory,
        });

        chatHistory.push({
          role: "assistant",
          content: response.text,
        });

        return res.status(200).json({ output: response, chatHistory });
      } catch (error) {
        // Generic error handling
        console.error(error);
        res
          .status(500)
          .json({ error: "An error occurred during the conversation." });
      }
    }
  }
}
