"use client";
import React, { useState } from "react";
import Emoji from "../components/emoji.jsx";

const NextJSTutorial = () => {
  const firstName = "John";
  const [lastName, setLastName] = useState("Doe");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("api/next", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lastName }),
    });

    console.log(await response.json());
  };

  return (
    <div>
      <p>This is where the page appears</p>
      <p>TailWind CSS is awesome</p>
      <p className="text-xs text-red-500">{firstName}</p>
      <div className="flex flex-col space-y-4">
        <div>
          <p>My last name is: {lastName}</p>
          <input
            type="text"
            className="outline w-32 rounded-md"
            onChange={(e) => setLastName(e.currentTarget.value)}
          />
          <button onClick={handleSubmit}>Submit</button>
        </div>
      </div>
      <Emoji />
      <Emoji color="red" />
      <Emoji color="blue" />
    </div>
  );
};

export default NextJSTutorial;
