import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { Toaster } from "sonner";
import "./styles/globals.css";
import { App } from "./app/App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { queryClient } from "./app/queryClient";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MotionConfig reducedMotion="user">
          <App />
          <Toaster
            position="top-center"
            theme="dark"
            toastOptions={{
              style: {
                background: "rgba(13, 26, 38, .92)",
                border: "1px solid rgba(255,255,255,.14)",
                backdropFilter: "blur(18px)",
                color: "#f6f7f2",
                fontFamily: "Manrope, sans-serif",
              },
            }}
          />
        </MotionConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
