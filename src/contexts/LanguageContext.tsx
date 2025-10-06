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
    'company.exportCSV': 'Export CSV',
    'company.deleteSuccess': 'Company deleted successfully',
    'company.deleteError': 'Failed to delete company',
    'company.exportSuccess': 'Companies exported successfully',
    'company.exportError': 'No data to export',
    
    // Speciality Management
    'speciality.name': 'Name',
    'speciality.noSpecialities': 'No specialities added yet.',
    'speciality.noResults': 'No specialities match your search.',
    'speciality.searchPlaceholder': 'Search specialities...',
    
    // Navigation
    'nav.companies': 'Companies',
    'nav.specialities': 'Specialities',
    
    // Dialogs
    'dialog.addCompany': 'Add Company',
    'dialog.updateCompany': 'Update company information',
    'dialog.addCompanyDesc': 'Add a new construction company',
    'dialog.addSpeciality': 'Add New Speciality',
    'dialog.addSpecialityDesc': 'Select the language and enter the speciality name. The other language will be translated automatically.',
    'dialog.cancel': 'Cancel',
    'dialog.save': 'Save',
    'dialog.create': 'Create',
    
    // Common
    'common.loading': 'Loading companies...',
  },
  pt: {
    // Auth
    'auth.login': 'Entrar',
    'auth.signup': 'Cadastrar',
    'auth.email': 'E-mail',
    'auth.password': 'Senha',
    'auth.username': 'Nome de usuário',
    'auth.logout': 'Sair',
    'auth.noAccount': 'Não tem uma conta?',
    'auth.hasAccount': 'Já tem uma conta?',
    'auth.signupSuccess': 'Conta criada com sucesso!',
    'auth.loginSuccess': 'Login realizado com sucesso!',
    'auth.logoutSuccess': 'Logout realizado com sucesso',
    'auth.error': 'Erro de autenticação',
    
    // Company Management
    'company.title': 'Gestão de Empresas',
    'company.subtitle': 'Gerencie suas empresas parceiras de construção',
    'company.addCompany': 'Adicionar Empresa',
    'company.addSpeciality': 'Adicionar Especialidade',
    'company.editCompany': 'Editar Empresa',
    'company.editSpeciality': 'Editar Especialidade',
    'company.name': 'Nome',
    'company.email': 'E-mail',
    'company.speciality': 'Especialidade',
    'company.actions': 'Ações',
    'company.noCompanies': 'Nenhuma empresa encontrada. Adicione sua primeira empresa!',
    'company.noResults': 'Nenhuma empresa corresponde à sua pesquisa.',
    'company.searchPlaceholder': 'Pesquisar por nome, e-mail ou especialidade...',
    'company.exportCSV': 'Exportar CSV',
    'company.deleteSuccess': 'Empresa excluída com sucesso',
    'company.deleteError': 'Falha ao excluir empresa',
    'company.exportSuccess': 'Empresas exportadas com sucesso',
    'company.exportError': 'Sem dados para exportar',
    
    // Speciality Management
    'speciality.name': 'Nome',
    'speciality.noSpecialities': 'Nenhuma especialidade adicionada ainda.',
    'speciality.noResults': 'Nenhuma especialidade corresponde à sua pesquisa.',
    'speciality.searchPlaceholder': 'Pesquisar especialidades...',
    
    // Navigation
    'nav.companies': 'Empresas',
    'nav.specialities': 'Especialidades',
    
    // Dialogs
    'dialog.addCompany': 'Adicionar Empresa',
    'dialog.updateCompany': 'Atualizar informações da empresa',
    'dialog.addCompanyDesc': 'Adicionar uma nova empresa de construção',
    'dialog.addSpeciality': 'Adicionar Nova Especialidade',
    'dialog.addSpecialityDesc': 'Selecione o idioma e insira o nome da especialidade. O outro idioma será traduzido automaticamente.',
    'dialog.cancel': 'Cancelar',
    'dialog.save': 'Salvar',
    'dialog.create': 'Criar',
    
    // Common
    'common.loading': 'Carregando empresas...',
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
