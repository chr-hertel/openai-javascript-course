import { OpenAI } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

let model, memory, chain;

export default async function handler(req, res) {
  if (!req.method === "POST") {
    throw new Error("Invalid method");
  }

  const { input, firstMsg } = req.body;

  if (!input) {
    throw new Error("Missing input");
  }

  if (firstMsg) {
    model = new OpenAI({ model: "gpt-3.5-turbo" });
    memory = new BufferMemory();
    chain = new ConversationChain({
      llm: model,
      memory,
    });
  }

  console.log({ input });
  const response = await chain.call({ input });

  return res.status(200).json({ output: response.response });
}
