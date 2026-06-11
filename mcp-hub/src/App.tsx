import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DocsLayout from "./layouts/DocsLayout";
import Overview from "./pages/Overview";
import ToolDetail from "./pages/ToolDetail";
import GettingStarted from "./pages/GettingStarted";
import Architecture from "./pages/Architecture";
import BestPractices from "./pages/BestPractices";
import ApiReference from "./pages/ApiReference";
import Contributing from "./pages/Contributing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<DocsLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/docs/getting-started" element={<GettingStarted />} />
            <Route path="/docs/architecture" element={<Architecture />} />
            <Route path="/docs/best-practices" element={<BestPractices />} />
            <Route path="/docs/api" element={<ApiReference />} />
            <Route path="/contributing" element={<Contributing />} />
            <Route path="/tools/:toolId" element={<ToolDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
