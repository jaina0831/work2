import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./router.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "./lib/fixLeafletIcon.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import App from "./App.jsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App /> {/* ⭐ App 負責呈現 Router + ChatWidget */}
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
