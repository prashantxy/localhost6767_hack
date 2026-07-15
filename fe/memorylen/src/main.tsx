import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
console.log("MAIN TSX LOADED");
ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);