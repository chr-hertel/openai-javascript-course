import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

let chain;
let chatHistory = [];

const initializeChain = async () => {
  console.log("Initializing the chain");
  try {
    const model = new ChatOpenAI({
      temperature: 0.8,
      modelName: "gpt-3.5-turbo",
    });
    const directory =
      "/home/christopher/Playground/LangChain/openai-javascript-course/data/quentic-vector/";

    const vectorStore = await HNSWLib.load(directory, new OpenAIEmbeddings());

    chain = ConversationalRetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever(),
      { verbose: true }
    );
  } catch (error) {
    console.error(error);
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  console.log({ prompt });
  console.log({ chain });

  if (!chain) {
    try {
      await initializeChain();
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "An error occurred while fetching transcript" });
    }
  }

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
