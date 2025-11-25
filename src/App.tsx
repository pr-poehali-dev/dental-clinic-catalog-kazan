import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import ClinicDetail from './pages/ClinicDetail';
import Admin from './pages/Admin';
import { clinicsAPI } from './lib/api';
import { authStorage } from './lib/auth';
import type { User } from './lib/api';

const queryClient = new QueryClient();

export type Clinic = {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  services: string[];
  schedule: { [key: string]: string };
  reviews?: Review[];
};

export type Review = {
  id: number;
  author: string;
  rating: number;
  date: string;
  text: string;
  avatar?: string;
};

const AppContent = () => {
  const [view, setView] = useState<'main' | 'clinic' | 'admin'>('main');
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = authStorage.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      const data = await clinicsAPI.getAll();
      setClinics(data);
    } catch (error) {
      console.error('Failed to load clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClinicDetail = async (clinicId: number) => {
    try {
      const data = await clinicsAPI.getById(clinicId);
      setSelectedClinic(data);
      setView('clinic');
    } catch (error) {
      console.error('Failed to load clinic:', error);
    }
  };

  const handleSelectClinic = (clinicId: number) => {
    setSelectedClinicId(clinicId);
    loadClinicDetail(clinicId);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authStorage.clear();
    setUser(null);
    setView('main');
  };

  const handleGoToAdmin = () => {
    if (user?.is_admin) {
      setView('admin');
    }
  };

  const handleBackToMain = () => {
    setView('main');
    setSelectedClinicId(null);
    setSelectedClinic(null);
    loadClinics();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (view === 'admin') {
    return <Admin onBack={handleBackToMain} />;
  }

  if (view === 'clinic' && selectedClinic) {
    return (
      <ClinicDetail 
        clinic={selectedClinic}
        onBack={handleBackToMain}
        user={user}
        onReviewAdded={() => loadClinicDetail(selectedClinic.id)}
      />
    );
  }

  return (
    <Index 
      clinics={clinics}
      onSelectClinic={handleSelectClinic}
      user={user}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onGoToAdmin={handleGoToAdmin}
    />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
