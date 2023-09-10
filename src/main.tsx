import React from "react";
import { ReactNode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import "./index.css";
import { getWebToken } from "./settings.ts";
import { ChakraProvider } from "@chakra-ui/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

interface GoogleProviderProps {
  children: ReactNode;
}

function GoogleProvider(props: GoogleProviderProps) {
  const clientId = getWebToken();
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {props.children}
    </GoogleOAuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleProvider>
        <ChakraProvider>
          <App />
        </ChakraProvider>
      </GoogleProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
