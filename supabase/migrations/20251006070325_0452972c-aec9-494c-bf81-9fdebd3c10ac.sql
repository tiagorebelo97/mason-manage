-- Create company_specialities junction table
CREATE TABLE IF NOT EXISTS public.company_specialities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  speciality_id UUID NOT NULL REFERENCES public.specialities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, speciality_id)
);

-- Enable RLS
ALTER TABLE public.company_specialities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view company_specialities" 
ON public.company_specialities 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert company_specialities" 
ON public.company_specialities 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update company_specialities" 
ON public.company_specialities 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete company_specialities" 
ON public.company_specialities 
FOR DELETE 
USING (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_company_specialities_company_id ON public.company_specialities(company_id);
CREATE INDEX IF NOT EXISTS idx_company_specialities_speciality_id ON public.company_specialities(speciality_id);