import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Landing from "./pages/Landing";
import FirGenerator from "./pages/FirGenerator";
import PasswordChecker from "./pages/PasswordChecker";
import OcrFraudDetection from "./pages/OcrFraudDetection";
import ScamLibrary from "./pages/ScamLibrary";
import LawLearning from "./pages/LawLearning";
import Dashboard from "./pages/Dashboard";
import Help from "./pages/Help";
import CommunityReports from "./pages/CommunityReports";
import Chat from "./pages/Chat";
import ReportScam from "./pages/ReportScam";
import FraudNews from "./pages/FraudNews";
import NotFound from "./pages/NotFound";
import ChatWidget from "./components/ChatWidget";
import DebugPanel from "./components/DebugPanel";

const queryClient = new QueryClient();

const App = () => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="fir-generator" element={<FirGenerator />} />
              <Route path="password-checker" element={<PasswordChecker />} />
              <Route path="ocr-fraud" element={<OcrFraudDetection />} />
              <Route path="scam-library" element={<ScamLibrary />} />
              <Route path="law-learning" element={<LawLearning />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="chat" element={<Chat />} />
              <Route path="report-scam" element={<ReportScam />} />
              <Route path="community-reports" element={<CommunityReports />} />
              <Route path="fraud-news" element={<FraudNews />} />
              <Route path="help" element={<Help />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatWidget onToggleDebugPanel={() => setShowDebugPanel(!showDebugPanel)} />
          {showDebugPanel && <DebugPanel />}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;