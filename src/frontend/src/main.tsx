import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LoadingScreen } from "./components/LoadingScreen";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <Suspense fallback={<LoadingScreen />}>
        <App />
      </Suspense>
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
