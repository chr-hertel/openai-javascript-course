// start here
"use client";
import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import PromptBox from "../components/PromptBox";
import Title from "../components/Title";
import TwoColumnLayout from "../components/TwoColumnLayout";
import ResultWithSources from "../components/ResultWithSources";
import "../globals.css";

const Memory = () => {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([
    {
      text: "Hi there! What's your name and favorite food?",
      type: "bot",
    },
  ]);
  const [firstMsg, setFirstMsg] = useState(true);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };
  const handleSubmitPrompt = async (e) => {
    try {
      const submittedPrompt = prompt;
      setMessages((messages) => [
        ...messages,
        { text: prompt, type: "user", sourceDocument: null },
      ]);
      setPrompt("");

      const response = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: submittedPrompt, firstMsg }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.statusText}`);
      }
      setFirstMsg(false);

      const res = await response.json();
      setMessages((messages) => [
        ...messages,
        { text: res.output, type: "bot", sourceDocument: null },
      ]);
      setError("");
    } catch (error) {
      console.error(error);
      setError(error);
    }
  };

  return (
    <>
      <Title headingText="Memory" emoji="🧠" />
      <TwoColumnLayout
        leftChildren={
          <>
            <PageHeader
              headingText="I remember everything"
              boldText="Let's see if it can remember your name and favorite food."
              description="This tool uses a Buffer Memory and Conversation Chain."
            />
          </>
        }
        rightChildren={
          <>
            <ResultWithSources messages={messages} pngFile="brain" />
            <PromptBox
              prompt={prompt}
              handleSubmit={handleSubmitPrompt}
              handlePromptChange={handlePromptChange}
              error={error}
              pngFile=""
            />
          </>
        }
      />
    </>
  );
};

export default Memory;
