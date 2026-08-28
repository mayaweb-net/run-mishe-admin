import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DirectionProvider } from "@/components/ui/direction";
import "@/styles/fonts-iran-yekan.css";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DirectionProvider direction="rtl">
      <App />
    </DirectionProvider>
  </StrictMode>,
);
