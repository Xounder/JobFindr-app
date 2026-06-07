import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { SkillsModalProvider } from "@/contexts/SkillsModalContext";
import "./index.css";

const HomePage = lazy(() => import("@/pages/HomePage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SkillsModalProvider>
            <Layout>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<div className="flex items-center justify-center p-12 text-gray-400">Loading…</div>}>
                      <HomePage />
                    </Suspense>
                  }
                />
              </Routes>
            </Layout>
          </SkillsModalProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
