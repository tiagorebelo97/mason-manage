-- Add DELETE policy for specialities
CREATE POLICY "Anyone can delete specialities" 
ON public.specialities 
FOR DELETE 
USING (true);

-- Add UPDATE policy for specialities
CREATE POLICY "Anyone can update specialities" 
ON public.specialities 
FOR UPDATE 
USING (true);

-- Add language columns to specialities
ALTER TABLE public.specialities 
ADD COLUMN name_en TEXT,
ADD COLUMN name_pt TEXT;

-- Migrate existing data to name_en
UPDATE public.specialities 
SET name_en = name, name_pt = name 
WHERE name_en IS NULL;

-- Make language columns required
ALTER TABLE public.specialities 
ALTER COLUMN name_en SET NOT NULL,
ALTER COLUMN name_pt SET NOT NULL;