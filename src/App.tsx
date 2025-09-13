import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Uploads from "./pages/Uploads";
import Greetings from "./pages/Greetings";
import Webhooks from "./pages/Webhooks";
import Users from "./pages/Users";
import Companies from "./pages/Companies";
import Permissions from "./pages/Permissions";
import ForgotPasswordConfig from "./pages/ForgotPasswordConfig";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/uploads" element={
              <ProtectedRoute>
                <AppLayout>
                  <Uploads />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/greetings" element={
              <ProtectedRoute>
                <AppLayout>
                  <Greetings />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/webhooks" element={
              <ProtectedRoute>
                <AppLayout>
                  <Webhooks />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <AppLayout>
                  <Users />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/companies" element={
              <ProtectedRoute>
                <AppLayout>
                  <Companies />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/permissions" element={
              <ProtectedRoute>
                <AppLayout>
                  <Permissions />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/forgot-password-config" element={
              <ProtectedRoute>
                <AppLayout>
                  <ForgotPasswordConfig />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
