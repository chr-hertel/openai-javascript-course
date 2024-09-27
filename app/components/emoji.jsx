import React from "react";

const Emoji = ({ color }) => {
  console.log(color);
  return (
    <div className={`bg-${color}-500 text-center`}>
      <p>The color is {color}</p>
      {color === "red" ? <p>👹</p> : <p>👻</p>}
      <p>🤖</p>
    </div>
  );
};

export default Emoji;
