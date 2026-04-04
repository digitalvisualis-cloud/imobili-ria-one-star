import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { PublicLayout } from "@/components/public/PublicLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";

import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import CookiePolicy from "./pages/CookiePolicy";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import RecoverPassword from "./pages/RecoverPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import SupabaseConfig from "./pages/SupabaseConfig";

import SiteConfig from "./pages/admin/SiteConfig";
import Properties from "./pages/admin/Properties";
import PropertyForm from "./pages/admin/PropertyForm";
import ApiKeys from "./pages/admin/ApiKeys";
import AiConfig from "./pages/admin/AiConfig";
import AiLogs from "./pages/admin/AiLogs";
import ApiDocs from "./pages/admin/ApiDocs";
import ApiLogs from "./pages/admin/ApiLogs";
import Users from "./pages/admin/Users";
import Leads from "./pages/admin/Leads";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/imovel/:codigo" element={<PropertyDetail />} />
              <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
              <Route path="/termos-de-uso" element={<TermsOfUse />} />
              <Route path="/politica-de-cookies" element={<CookiePolicy />} />
            </Route>

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-senha" element={<RecoverPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/conectar-supabase" element={<SupabaseConfig />} />
            <Route path="/trocar-senha" element={<ChangePassword />} />

            {/* Admin routes - protected */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'editor', 'viewer']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<SiteConfig />} />
                <Route path="imoveis" element={<Properties />} />
                <Route path="imoveis/:id" element={<PropertyForm />} />
                
                <Route path="ia-logs" element={<AiLogs />} />
                <Route path="api-docs" element={<ApiDocs />} />
                <Route path="api-keys" element={<ApiKeys />} />
                <Route path="ia-config" element={<AiConfig />} />
                <Route path="api-logs" element={<ApiLogs />} />
                <Route path="usuarios" element={<Users />} />
                <Route path="leads" element={<Leads />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
