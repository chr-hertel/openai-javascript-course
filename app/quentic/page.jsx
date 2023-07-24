"use client";

import React, { useState } from "react";
import ResultWithSources from "../components/ResultWithSources";
import PromptBox from "../components/PromptBox";
import Button from "../components/Button";
import PageHeader from "../components/PageHeader";
import Title from "../components/Title";
import TwoColumnLayout from "../components/TwoColumnLayout";
import ButtonContainer from "../components/ButtonContainer";
import "../globals.css";

// This functional component is responsible for loading PDFs
const QuenticAssistant = () => {
  // Managing prompt, messages, and error states with useState
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      text: "Hi, I'm the Quentic Assistant. What would you like to know?",
      type: "bot",
    },
  ]);
  const [error, setError] = useState("");

  // This function updates the prompt value when the user types in the prompt box
  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleInit = async (endpoint) => {
    try {
      console.log(`sending ${prompt}`);
      console.log(`using ${endpoint}`);
      await fetch(`/api${endpoint}`, { method: "POST" });
      setError("");
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };

  const handleSubmitPrompt = async (endpoint) => {
    try {
      setPrompt("");

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: prompt, type: "user", sourceDocuments: null },
      ]);

      const response = await fetch(`/api${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const searchRes = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: searchRes.result.text,
          type: "bot",
          sourceDocuments: searchRes.result.sourceDocuments,
        },
      ]);

      setError("");
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };

  return (
    <>
      <Title emoji="💬" headingText="Quentic Assistant" />
      <TwoColumnLayout
        leftChildren={
          <>
            <PageHeader
              heading="Quentic Assistant"
              boldText="How to use Quentic Platform?"
              description="This tool will help you to use the
              Quentic Platform and guide you the way to relevant
              Online Help articles."
            />
            <ButtonContainer>
              <Button
                handleSubmit={handleInit}
                endpoint="quentic-init"
                buttonText="Load Online Help 📚"
                className="Button"
              />
            </ButtonContainer>
          </>
        }
        rightChildren={
          <>
            <ResultWithSources messages={messages} pngFile="pdf" />
            <PromptBox
              prompt={prompt}
              handlePromptChange={handlePromptChange}
              handleSubmit={() => handleSubmitPrompt("/quentic-query")}
              placeHolderText={"Your questions..."}
              error={error}
            />
          </>
        }
      />
    </>
  );
};

export default QuenticAssistant;
