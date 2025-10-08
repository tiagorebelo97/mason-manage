import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Building2, Package, List, Layers, Users, Phone, MapPin } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { RecentList } from "@/components/dashboard/RecentList";

type CompanySpeciality = {
  specialities: {
    name_pt: string;
    name_en: string;
    main_specialties?: {
      main_specialty_pt: string;
      main_specialty_en: string;
    };
  };
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch companies with relations
  const { data: companies } = useQuery({
    queryKey: ["companies", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(`
          *, 
          company_specialities(specialities(name, name_en, name_pt, main_specialties(id, main_specialty_en, main_specialty_pt, type))),
          brand_companies(brands(name))
        `);
      if (error) throw error;
      return data;
    },
  });

  // Fetch brands
  const { data: brands } = useQuery({
    queryKey: ["brands", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch specialities
  const { data: specialities } = useQuery({
    queryKey: ["specialities", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialities")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch main specialties
  const { data: mainSpecialties } = useQuery({
    queryKey: ["main-specialties", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("main_specialties")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch contacts
  const { data: contacts } = useQuery({
    queryKey: ["contacts", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*, people(first_name, last_name), companies(name)");
      if (error) throw error;
      return data;
    },
  });

  // Fetch people
  const { data: people } = useQuery({
    queryKey: ["people", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("people")
        .select("*, companies(name)");
      if (error) throw error;
      return data;
    },
  });

  // Fetch locations
  const { data: locations } = useQuery({
    queryKey: ["locations", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalCompanies: companies?.length || 0,
      totalBrands: brands?.length || 0,
      totalSpecialities: specialities?.length || 0,
      totalMainSpecialties: mainSpecialties?.length || 0,
      totalContacts: contacts?.length || 0,
      totalPeople: people?.length || 0,
      totalLocations: locations?.length || 0,
      personContacts: contacts?.filter(c => c.person_id)?.length || 0,
      companyContacts: contacts?.filter(c => c.company_id)?.length || 0,
    };
  }, [companies, brands, specialities, mainSpecialties, contacts, people, locations]);

  // Prepare data for companies by specialty chart
  const companiesBySpecialtyData = useMemo(() => {
    if (!companies) return [];
    
    const specialtyCount = new Map<string, number>();
    
    companies.forEach(company => {
      if (company.company_specialities && Array.isArray(company.company_specialities)) {
        company.company_specialities.forEach((cs: CompanySpeciality) => {
          if (cs.specialities) {
            const specialtyName = language === 'pt' ? cs.specialities.name_pt : cs.specialities.name_en;
            specialtyCount.set(specialtyName, (specialtyCount.get(specialtyName) || 0) + 1);
          }
        });
      }
    });

    return Array.from(specialtyCount.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 specialties
  }, [companies, language]);

  // Prepare data for companies by main specialty chart
  const companiesByMainSpecialtyData = useMemo(() => {
    if (!companies) return [];
    
    const mainSpecialtyCount = new Map<string, number>();
    
    companies.forEach(company => {
      if (company.company_specialities && Array.isArray(company.company_specialities)) {
        company.company_specialities.forEach((cs: CompanySpeciality) => {
          if (cs.specialities?.main_specialties) {
            const mainSpecialtyName = language === 'pt' 
              ? cs.specialities.main_specialties.main_specialty_pt 
              : cs.specialities.main_specialties.main_specialty_en;
            mainSpecialtyCount.set(mainSpecialtyName, (mainSpecialtyCount.get(mainSpecialtyName) || 0) + 1);
          }
        });
      }
    });

    return Array.from(mainSpecialtyCount.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [companies, language]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>
      </div>

      {/* Primary Stats - Most Important */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title={t('dashboard.totalCompanies')}
          value={stats.totalCompanies}
          subtitle={t('company.title')}
          icon={Building2}
          onClick={() => navigate('/companies')}
        />
        <DashboardCard
          title={t('dashboard.totalContacts') || 'Total Contacts'}
          value={stats.totalContacts}
          subtitle={`${stats.personContacts} ${t('contact.person') || 'Person'} • ${stats.companyContacts} ${t('contact.company') || 'Company'}`}
          icon={Phone}
          onClick={() => navigate('/contacts')}
        />
        <DashboardCard
          title={t('dashboard.totalPeople') || 'Total People'}
          value={stats.totalPeople}
          subtitle={t('person.title') || 'People'}
          icon={Users}
          onClick={() => navigate('/people')}
        />
        <DashboardCard
          title={t('dashboard.totalBrands')}
          value={stats.totalBrands}
          subtitle={t('brand.title')}
          icon={Package}
          onClick={() => navigate('/brands')}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard
          title={t('dashboard.totalSpecialities')}
          value={stats.totalSpecialities}
          subtitle={t('speciality.name')}
          icon={List}
          onClick={() => navigate('/specialities')}
        />
        <DashboardCard
          title={t('dashboard.totalMainSpecialties')}
          value={stats.totalMainSpecialties}
          subtitle={t('mainSpecialty.title')}
          icon={Layers}
          onClick={() => navigate('/main-specialties')}
        />
        <DashboardCard
          title={t('dashboard.totalLocations') || 'Total Locations'}
          value={stats.totalLocations}
          subtitle={t('location.title') || 'Locations'}
          icon={MapPin}
          onClick={() => navigate('/locations')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard 
          title={t('dashboard.companiesBySpecialty')} 
          description={t('dashboard.topSpecialties')}
        >
          {companiesBySpecialtyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={companiesBySpecialtyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {companiesBySpecialtyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
              {t('dashboard.noData')}
            </div>
          )}
        </ChartCard>

        <ChartCard 
          title={t('dashboard.companiesByMainSpecialty')} 
          description={t('mainSpecialty.title')}
        >
          {companiesByMainSpecialtyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={companiesByMainSpecialtyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#0088FE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
              {t('dashboard.noData')}
            </div>
          )}
        </ChartCard>

      </div>

      {/* Recent Lists Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecentList
          title={t('brand.title')}
          description={t('dashboard.brandsDistribution')}
          items={brands?.slice(0, 5) || []}
          totalCount={brands?.length}
          onViewAll={() => navigate('/brands')}
          viewAllLabel={t('dashboard.viewAll')}
          emptyMessage={t('dashboard.noData')}
          emptyIcon={Package}
          renderItem={(brand) => (
            <div 
              className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
              onClick={() => navigate('/brands')}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium truncate">{brand.name}</span>
              </div>
              {brand.website && (
                <a 
                  href={brand.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline ml-2 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit
                </a>
              )}
            </div>
          )}
        />

        <RecentList
          title={t('company.title')}
          description={t('dashboard.recentActivity')}
          items={companies?.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 5) || []}
          totalCount={companies?.length}
          onViewAll={() => navigate('/companies')}
          viewAllLabel={t('dashboard.viewAll')}
          emptyMessage={t('dashboard.noData')}
          emptyIcon={Building2}
          renderItem={(company) => (
            <div 
              className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
              onClick={() => navigate('/companies')}
            >
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{company.name}</div>
                {company.email && <div className="text-xs text-muted-foreground truncate">{company.email}</div>}
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default Dashboard;
