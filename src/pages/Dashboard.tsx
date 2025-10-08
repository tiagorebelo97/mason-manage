import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Package, List, Layers, Users, Phone, MapPin } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

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

  // Prepare data for contacts by type chart
  const contactsByTypeData = useMemo(() => {
    if (!contacts) return [];
    
    return [
      { 
        name: t('contact.person') || 'Person', 
        value: stats.personContacts,
        color: '#0088FE'
      },
      { 
        name: t('contact.company') || 'Company', 
        value: stats.companyContacts,
        color: '#00C49F'
      },
    ].filter(item => item.value > 0);
  }, [contacts, stats.personContacts, stats.companyContacts, t]);

  // Prepare data for people by company chart
  const peopleByCompanyData = useMemo(() => {
    if (!people) return [];
    
    const companyCount = new Map<string, number>();
    
    people.forEach(person => {
      const companyName = person.companies?.name || (t('company.noCompany') || 'No Company');
      companyCount.set(companyName, (companyCount.get(companyName) || 0) + 1);
    });

    return Array.from(companyCount.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 companies
  }, [people, t]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/companies')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalCompanies')}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('company.title')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/brands')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalBrands')}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBrands}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('brand.title')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/contacts')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalContacts') || 'Total Contacts'}
            </CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.personContacts} {t('contact.person') || 'Person'} • {stats.companyContacts} {t('contact.company') || 'Company'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/people')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalPeople') || 'Total People'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPeople}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('person.title') || 'People'}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/specialities')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalSpecialities')}
            </CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpecialities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('speciality.name')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/main-specialties')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalMainSpecialties')}
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMainSpecialties}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('mainSpecialty.title')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/locations')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalLocations') || 'Total Locations'}
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLocations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('location.title') || 'Locations'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Companies by Specialty - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.companiesBySpecialty')}</CardTitle>
            <CardDescription>{t('dashboard.topSpecialties')}</CardDescription>
          </CardHeader>
          <CardContent>
            {companiesBySpecialtyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                {t('dashboard.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Companies by Main Specialty - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.companiesByMainSpecialty')}</CardTitle>
            <CardDescription>{t('mainSpecialty.title')}</CardDescription>
          </CardHeader>
          <CardContent>
            {companiesByMainSpecialtyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companiesByMainSpecialtyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                {t('dashboard.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacts by Type - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.contactsByType') || 'Contacts by Type'}</CardTitle>
            <CardDescription>{t('dashboard.contactsDistribution') || 'Distribution of person and company contacts'}</CardDescription>
          </CardHeader>
          <CardContent>
            {contactsByTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={contactsByTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {contactsByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                {t('dashboard.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* People by Company - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.peopleByCompany') || 'People by Company'}</CardTitle>
            <CardDescription>{t('dashboard.topCompaniesWithPeople') || 'Top companies with most people'}</CardDescription>
          </CardHeader>
          <CardContent>
            {peopleByCompanyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peopleByCompanyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                {t('dashboard.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Brands */}
        <Card>
          <CardHeader>
            <CardTitle>{t('brand.title')}</CardTitle>
            <CardDescription>{t('dashboard.brandsDistribution')}</CardDescription>
          </CardHeader>
          <CardContent>
            {brands && brands.length > 0 ? (
              <div className="space-y-2">
                {brands.slice(0, 5).map((brand) => (
                  <div key={brand.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{brand.name}</span>
                    </div>
                    {brand.website && (
                      <a 
                        href={brand.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        {brand.website.replace(/^https?:\/\//, '').slice(0, 20)}...
                      </a>
                    )}
                  </div>
                ))}
                {brands.length > 5 && (
                  <div 
                    className="text-sm text-blue-500 hover:underline cursor-pointer text-center pt-2"
                    onClick={() => navigate('/brands')}
                  >
                    {t('dashboard.viewAll')} ({brands.length})
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                {t('dashboard.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Companies */}
        <Card>
          <CardHeader>
            <CardTitle>{t('company.title')}</CardTitle>
            <CardDescription>{t('dashboard.recentActivity')}</CardDescription>
          </CardHeader>
          <CardContent>
            {companies && companies.length > 0 ? (
              <div className="space-y-2">
                {companies
                  .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
                  .slice(0, 5)
                  .map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-xs text-muted-foreground">{company.email}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                {companies.length > 5 && (
                  <div 
                    className="text-sm text-blue-500 hover:underline cursor-pointer text-center pt-2"
                    onClick={() => navigate('/companies')}
                  >
                    {t('dashboard.viewAll')} ({companies.length})
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                {t('dashboard.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
