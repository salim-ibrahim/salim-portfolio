
import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./AppRouter";
import SiteMetadata from "./components/SiteMetadata";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <SiteMetadata />
        <AppRouter />
    </React.StrictMode>
);
