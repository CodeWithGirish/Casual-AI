import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CommandCenter from "./pages/CommandCenter";
import PolicySimulator from "./pages/PolicySimulator";
import ResilienceScorecard from "./pages/ResilienceScorecard";
import IntegrityHub from "./pages/IntegrityHub";
import RegionalConfig from "./pages/RegionalConfig";
import CounterfactualComparison from "./pages/CounterfactualComparison";
import PolicyReport from "./pages/PolicyReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CommandCenter />} />
          <Route path="/simulator" element={<PolicySimulator />} />
          <Route path="/resilience" element={<ResilienceScorecard />} />
          <Route path="/integrity" element={<IntegrityHub />} />
          <Route path="/configure" element={<RegionalConfig />} />
          <Route path="/counterfactual" element={<CounterfactualComparison />} />
          <Route path="/report" element={<PolicyReport />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
