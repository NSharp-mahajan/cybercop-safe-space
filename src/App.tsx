import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/Layout/Layout";
import Landing from "./pages/Landing";
import FirGenerator from "./pages/FirGenerator";
import OcrFraudDetection from "./pages/OcrFraudDetection";
import SecurityToolsHub from "./pages/SecurityToolsHub";
import ScamLibrary from "./pages/ScamLibrary";
import LawLearning from "./pages/LawLearning";
import Dashboard from "./pages/Dashboard";
import Help from "./pages/Help";
import CommunityReports from "./pages/CommunityReports";
import Chat from "./pages/Chat";
import ReportScam from "./pages/ReportScam";
import FraudNews from "./pages/FraudNews";
import ScamMap from '@/pages/ScamMapAPI';
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import VoiceScamDetector from "./pages/VoiceScamDetector";
import NotFound from "./pages/NotFound";
import ChatWidget from "./components/ChatWidget";
import DebugPanel from "./components/DebugPanel";

const queryClient = new QueryClient();

const App = () => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="fir-generator" element={<FirGenerator />} />
              <Route path="security-tools" element={<SecurityToolsHub />} />
              <Route path="ocr-fraud" element={<OcrFraudDetection />} />
              <Route path="scam-library" element={<ScamLibrary />} />
              <Route path="law-learning" element={<LawLearning />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="chat" element={<Chat />} />
              <Route path="report-scam" element={<ReportScam />} />
              <Route path="scam-map" element={<ScamMap />} />
              <Route path="voice-scam-detector" element={<VoiceScamDetector />} />
              <Route path="community-reports" element={<CommunityReports />} />
              <Route path="fraud-news" element={<FraudNews />} />
              <Route path="help" element={<Help />} />
            </Route>
            {/* Auth routes (outside Layout) */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatWidget onToggleDebugPanel={() => setShowDebugPanel(!showDebugPanel)} />
          {showDebugPanel && <DebugPanel />}
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;