import { ChatOpenAI } from "langchain/chat_models/openai";
import { LLMChain } from "langchain/chains";
import { ZeroShotAgent } from "langchain/agents";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { AgentExecutor } from "langchain/agents";
import SerpAPITool from "../tools/SerpAPI";
import WebBrowserTool from "../tools/WebBrowser";

const ResearchAgent = async (topic) => {
  console.log({ topic });

  try {
    // Tools
    const SerpAPI = SerpAPITool();
    const WebBrowser = WebBrowserTool();
    const tools = [SerpAPI, WebBrowser];

    // Prompt Template
    const promptTemplate = ZeroShotAgent.createPrompt(tools, {
      prefix:
        "Answer the following questions as best as you can. You have access tot the following tools:",
      suffix: "Begin! Answer concisely. It's OK to say you don't know.",
    });

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      new SystemMessagePromptTemplate(promptTemplate),
      HumanMessagePromptTemplate.fromTemplate(`{input}`),
    ]);

    // Chat OpenAI (model/llm)
    const chat = new ChatOpenAI({});
    // Chain = Template + LLM
    const llmChain = new LLMChain({
      prompt: chatPrompt,
      llm: chat,
    });

    // Agent = Tools, LLM, Prompt Template
    const agent = new ZeroShotAgent({
      llmChain,
      allowedTools: tools.map((tool) => tool.name),
    });
    const executor = AgentExecutor.fromAgentAndTools({
      agent,
      tools,
      returnIntermediateSteps: false,
      maxIterations: 3,
      verbose: true,
    });

    const result = await executor.run(`Who is ${topic}?`);

    return result;
  } catch (err) {
    console.error(err);
  }
};

export default ResearchAgent;
