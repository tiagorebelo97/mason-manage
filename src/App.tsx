import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Specialities from "./pages/Specialities";
import MainSpecialties from "./pages/MainSpecialties";
import Brands from "./pages/Brands";
import NotFound from "./pages/NotFound";

// Configure QueryClient with cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce stale time to ensure fresh data
      staleTime: 0,
      // Disable automatic refetch on window focus to avoid unnecessary requests
      refetchOnWindowFocus: false,
      // Add retry logic
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <SidebarProvider>
                  <div className="min-h-screen flex w-full">
                    <AppSidebar />
                    <div className="flex-1 flex flex-col">
                      <header className="h-12 flex items-center border-b px-4 bg-background sticky top-0 z-10">
                        <SidebarTrigger />
                      </header>
                      <main className="flex-1">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/companies" element={<Index />} />
                          <Route path="/specialities" element={<Specialities />} />
                          <Route path="/main-specialties" element={<MainSpecialties />} />
                          <Route path="/brands" element={<Brands />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
