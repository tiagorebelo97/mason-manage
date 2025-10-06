import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Language = 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.username': 'Username',
    'auth.logout': 'Logout',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.signupSuccess': 'Account created successfully!',
    'auth.loginSuccess': 'Logged in successfully!',
    'auth.logoutSuccess': 'Logged out successfully',
    'auth.error': 'Authentication error',
    
    // Company Management
    'company.title': 'Company Management',
    'company.subtitle': 'Manage your construction company partners',
    'company.addCompany': 'Add Company',
    'company.addSpeciality': 'Add Speciality',
    'company.editCompany': 'Edit Company',
    'company.editSpeciality': 'Edit Speciality',
    'company.name': 'Name',
    'company.email': 'Email',
    'company.speciality': 'Speciality',
    'company.actions': 'Actions',
    'company.noCompanies': 'No companies found. Add your first company!',
    'company.noResults': 'No companies match your search.',
    'company.searchPlaceholder': 'Search by name, email or speciality...',
    'company.exportCSV': 'Export Excel',
    'company.deleteSuccess': 'Company deleted successfully',
    'company.deleteError': 'Failed to delete company',
    'company.exportSuccess': 'Companies exported successfully',
    'company.exportError': 'No data to export',
    'company.filterName': 'Filter by name...',
    'company.filterEmail': 'Filter by email...',
    'company.filterSpeciality': 'Filter by speciality...',
    'company.brands': 'Brands',
    'company.filterBrands': 'Filter by brand...',
    'company.viewCompany': 'View Company',
    'company.viewCompanyDesc': 'Company details',
    'company.selectSpeciality': 'Select specialities...',
    'company.noSpeciality': 'No specialities found.',
    
    // Speciality Management
    'speciality.name': 'Speciality',
    'speciality.noSpecialities': 'No specialities added yet.',
    'speciality.noResults': 'No specialities match your search.',
    'speciality.searchPlaceholder': 'Search specialities...',
    'speciality.mainSpecialty': 'Main Specialty',
    'speciality.selectMainSpecialty': 'Select main specialty...',
    'speciality.noMainSpecialty': 'No main specialty found.',
    'speciality.filterName': 'Filter by speciality...',
    'speciality.filterMainSpecialty': 'Filter by main specialty...',
    
    // Main Specialty Management
    'mainSpecialty.title': 'Main Specialties',
    'mainSpecialty.subtitle': 'Manage main specialty categories',
    'mainSpecialty.type': 'Type',
    'mainSpecialty.mainSpecialty': 'Main Specialty',
    'mainSpecialty.noMainSpecialties': 'No main specialties added yet.',
    'mainSpecialty.noResults': 'No main specialties match your search.',
    'mainSpecialty.searchPlaceholder': 'Search main specialties...',
    'mainSpecialty.addMainSpecialty': 'Add Main Specialty',
    'mainSpecialty.editMainSpecialty': 'Edit Main Specialty',
    'mainSpecialty.deleteSuccess': 'Main specialty deleted successfully',
    'mainSpecialty.deleteError': 'Failed to delete main specialty',
    
    // Brand Management
    'brand.title': 'Brand Management',
    'brand.subtitle': 'Manage construction brands and suppliers',
    'brand.addBrand': 'Add Brand',
    'brand.editBrand': 'Edit Brand',
    'brand.name': 'Name',
    'brand.website': 'Website',
    'brand.officialEmail': 'Official Email',
    'brand.specialities': 'Specialities',
    'brand.companies': 'Companies',
    'brand.actions': 'Actions',
    'brand.noBrands': 'No brands found. Add your first brand!',
    'brand.noResults': 'No brands match your search.',
    'brand.searchPlaceholder': 'Search by name, website or email...',
    'brand.deleteSuccess': 'Brand deleted successfully',
    'brand.deleteError': 'Failed to delete brand',
    'brand.selectSpecialities': 'Select specialities...',
    'brand.selectCompanies': 'Select companies...',
    'brand.noSpecialities': 'No specialities found.',
    'brand.noCompanies': 'No companies found.',
    'brand.viewBrand': 'View Brand',
    'brand.viewBrandDesc': 'Brand details',
    
    // Navigation
    'nav.companies': 'Companies',
    'nav.specialities': 'Specialities',
    'nav.mainSpecialties': 'Main Specialties',
    'nav.brands': 'Brands',
    
    // Dialogs
    'dialog.addCompany': 'Add Company',
    'dialog.updateCompany': 'Update company information',
    'dialog.addCompanyDesc': 'Add a new construction company',
    'dialog.addSpeciality': 'Add New Speciality',
    'dialog.addSpecialityDesc': 'Select the language and enter the speciality name. The other language will be translated automatically.',
    'dialog.cancel': 'Cancel',
    'dialog.save': 'Save',
    'dialog.create': 'Create',
    'dialog.close': 'Close',
    
    // Common
    'common.loading': 'Loading companies...',
  },
  pt: {
    // Auth
    'auth.login': 'Entrar',
    'auth.signup': 'Registar',
    'auth.email': 'E-mail',
    'auth.password': 'Palavra-passe',
    'auth.username': 'Nome de utilizador',
    'auth.logout': 'Sair',
    'auth.noAccount': 'Não tem uma conta?',
    'auth.hasAccount': 'Já tem uma conta?',
    'auth.signupSuccess': 'Conta criada com sucesso!',
    'auth.loginSuccess': 'Sessão iniciada com sucesso!',
    'auth.logoutSuccess': 'Sessão terminada com sucesso',
    'auth.error': 'Erro de autenticação',
    
    // Company Management
    'company.title': 'Gestão de Empresas',
    'company.subtitle': 'Faça a gestão das suas empresas parceiras de construção',
    'company.addCompany': 'Adicionar Empresa',
    'company.addSpeciality': 'Adicionar Especialidade',
    'company.editCompany': 'Editar Empresa',
    'company.editSpeciality': 'Editar Especialidade',
    'company.name': 'Nome',
    'company.email': 'E-mail',
    'company.speciality': 'Especialidade',
    'company.actions': 'Ações',
    'company.noCompanies': 'Nenhuma empresa encontrada. Adicione a sua primeira empresa!',
    'company.noResults': 'Nenhuma empresa corresponde à sua pesquisa.',
    'company.searchPlaceholder': 'Pesquisar por nome, e-mail ou especialidade...',
    'company.exportCSV': 'Exportar Excel',
    'company.deleteSuccess': 'Empresa eliminada com sucesso',
    'company.deleteError': 'Falha ao eliminar empresa',
    'company.exportSuccess': 'Empresas exportadas com sucesso',
    'company.exportError': 'Sem dados para exportar',
    'company.filterName': 'Filtrar por nome...',
    'company.filterEmail': 'Filtrar por e-mail...',
    'company.filterSpeciality': 'Filtrar por especialidade...',
    'company.brands': 'Marcas',
    'company.filterBrands': 'Filtrar por marca...',
    'company.viewCompany': 'Ver Empresa',
    'company.viewCompanyDesc': 'Detalhes da empresa',
    'company.selectSpeciality': 'Selecionar especialidades...',
    'company.noSpeciality': 'Nenhuma especialidade encontrada.',
    
    // Speciality Management
    'speciality.name': 'Especialidade',
    'speciality.noSpecialities': 'Nenhuma especialidade adicionada ainda.',
    'speciality.noResults': 'Nenhuma especialidade corresponde à sua pesquisa.',
    'speciality.searchPlaceholder': 'Pesquisar especialidades...',
    'speciality.mainSpecialty': 'Especialidade Principal',
    'speciality.selectMainSpecialty': 'Selecionar especialidade principal...',
    'speciality.noMainSpecialty': 'Nenhuma especialidade principal encontrada.',
    'speciality.filterName': 'Filtrar por especialidade...',
    'speciality.filterMainSpecialty': 'Filtrar por especialidade principal...',
    
    // Main Specialty Management
    'mainSpecialty.title': 'Especialidades Principais',
    'mainSpecialty.subtitle': 'Gerir categorias de especialidades principais',
    'mainSpecialty.type': 'Tipo',
    'mainSpecialty.mainSpecialty': 'Especialidade Principal',
    'mainSpecialty.noMainSpecialties': 'Nenhuma especialidade principal adicionada ainda.',
    'mainSpecialty.noResults': 'Nenhuma especialidade principal corresponde à sua pesquisa.',
    'mainSpecialty.searchPlaceholder': 'Pesquisar especialidades principais...',
    'mainSpecialty.addMainSpecialty': 'Adicionar Especialidade Principal',
    'mainSpecialty.editMainSpecialty': 'Editar Especialidade Principal',
    'mainSpecialty.deleteSuccess': 'Especialidade principal eliminada com sucesso',
    'mainSpecialty.deleteError': 'Falha ao eliminar especialidade principal',
    
    // Brand Management
    'brand.title': 'Gestão de Marcas',
    'brand.subtitle': 'Gerir marcas e fornecedores de construção',
    'brand.addBrand': 'Adicionar Marca',
    'brand.editBrand': 'Editar Marca',
    'brand.name': 'Nome',
    'brand.website': 'Website',
    'brand.officialEmail': 'E-mail Oficial',
    'brand.specialities': 'Especialidades',
    'brand.companies': 'Empresas',
    'brand.actions': 'Ações',
    'brand.noBrands': 'Nenhuma marca encontrada. Adicione a sua primeira marca!',
    'brand.noResults': 'Nenhuma marca corresponde à sua pesquisa.',
    'brand.searchPlaceholder': 'Pesquisar por nome, website ou e-mail...',
    'brand.deleteSuccess': 'Marca eliminada com sucesso',
    'brand.deleteError': 'Falha ao eliminar marca',
    'brand.selectSpecialities': 'Selecionar especialidades...',
    'brand.selectCompanies': 'Selecionar empresas...',
    'brand.noSpecialities': 'Nenhuma especialidade encontrada.',
    'brand.noCompanies': 'Nenhuma empresa encontrada.',
    'brand.viewBrand': 'Ver Marca',
    'brand.viewBrandDesc': 'Detalhes da marca',
    
    // Navigation
    'nav.companies': 'Empresas',
    'nav.specialities': 'Especialidades',
    'nav.mainSpecialties': 'Especialidades Principais',
    'nav.brands': 'Marcas',
    
    // Dialogs
    'dialog.addCompany': 'Adicionar Empresa',
    'dialog.updateCompany': 'Atualizar informações da empresa',
    'dialog.addCompanyDesc': 'Adicionar uma nova empresa de construção',
    'dialog.addSpeciality': 'Adicionar Nova Especialidade',
    'dialog.addSpecialityDesc': 'Selecione o idioma e insira o nome da especialidade. O outro idioma será traduzido automaticamente.',
    'dialog.cancel': 'Cancelar',
    'dialog.save': 'Guardar',
    'dialog.create': 'Criar',
    'dialog.close': 'Fechar',
    
    // Common
    'common.loading': 'A carregar empresas...',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const { toast } = useToast();

  useEffect(() => {
    const loadUserLanguage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.preferred_language) {
          setLanguageState(profile.preferred_language as Language);
        }
      }
    };

    loadUserLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_language: lang })
        .eq('id', session.user.id);
      
      if (error) {
        console.error('Error updating language preference:', error);
      }
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
