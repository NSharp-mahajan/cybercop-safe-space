import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Layout from "./components/Layout/Layout";
import Landing from "./pages/Landing";
import FirGenerator from "./pages/FirGenerator";
import SecurityToolsHub from "./pages/SecurityToolsHub";
import AIDetectionHub from "./pages/AIDetectionHub";
import ScamLibrary from "./pages/ScamLibrary";
import LawLearning from "./pages/LawLearning";
import Dashboard from "./pages/Dashboard";
import Help from "./pages/Help";
import CommunityReports from "./pages/CommunityReports";
import Chat from "./pages/Chat";
import ReportScam from "./pages/ReportScam";
import FraudNews from "./pages/FraudNews";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import Subscription from "./pages/Subscription";
import ProDashboard from "./pages/ProDashboard";
import NotFound from "./pages/NotFound";
import AuthTest from "./pages/AuthTest";
import SubscriptionTest from "./pages/SubscriptionTest";
import ChatWidget from "./components/ChatWidget";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="fir-generator" element={<FirGenerator />} />
              <Route path="security-tools" element={<SecurityToolsHub />} />
              <Route path="ai-detection" element={<AIDetectionHub />} />
              <Route path="scam-library" element={<ScamLibrary />} />
              <Route path="law-learning" element={<LawLearning />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="chat" element={<Chat />} />
              <Route path="report-scam" element={<ReportScam />} />
              <Route path="community-reports" element={<CommunityReports />} />
              <Route path="fraud-news" element={<FraudNews />} />
              <Route path="subscription" element={<Subscription />} />
              <Route path="pro-dashboard" element={<ProDashboard />} />
              <Route path="help" element={<Help />} />
              <Route path="auth-test" element={<AuthTest />} />
              <Route path="subscription-test" element={<SubscriptionTest />} />
            </Route>
            {/* Auth routes (outside Layout) */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatWidget />
          </BrowserRouter>
          </TooltipProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;