/**
 * Translation service using MyMemory Translation API
 * Free API with no authentication required
 */

interface TranslationResponse {
  responseData: {
    translatedText: string;
  };
  responseStatus: number;
}

// Common construction speciality translations as fallback
const specialityTranslations: Record<string, Record<string, string>> = {
  'en-pt': {
    'electrical': 'Elétrica',
    'plumbing': 'Canalização',
    'hvac': 'AVAC',
    'carpentry': 'Carpintaria',
    'masonry': 'Alvenaria',
    'painting': 'Pintura',
    'roofing': 'Cobertura',
    'flooring': 'Pavimento',
    'landscaping': 'Paisagismo',
    'demolition': 'Demolição',
    'excavation': 'Escavação',
    'welding': 'Soldadura',
    'concrete': 'Betão',
    'drywall': 'Pladur',
    'insulation': 'Isolamento',
    'glazing': 'Vidraçaria',
    'tiling': 'Azulejaria',
    'waterproofing': 'Impermeabilização',
    'scaffolding': 'Andaime',
    'steel': 'Aço'
  },
  'pt-en': {
    'elétrica': 'Electrical',
    'canalização': 'Plumbing',
    'avac': 'HVAC',
    'carpintaria': 'Carpentry',
    'alvenaria': 'Masonry',
    'pintura': 'Painting',
    'cobertura': 'Roofing',
    'pavimento': 'Flooring',
    'paisagismo': 'Landscaping',
    'demolição': 'Demolition',
    'escavação': 'Excavation',
    'soldadura': 'Welding',
    'betão': 'Concrete',
    'pladur': 'Drywall',
    'isolamento': 'Insulation',
    'vidraçaria': 'Glazing',
    'azulejaria': 'Tiling',
    'impermeabilização': 'Waterproofing',
    'andaime': 'Scaffolding',
    'aço': 'Steel'
  }
};

/**
 * Translate text from one language to another
 * @param text - The text to translate
 * @param sourceLang - Source language code ('en' or 'pt')
 * @param targetLang - Target language code ('en' or 'pt')
 * @returns The translated text
 */
export const translateText = async (
  text: string,
  sourceLang: 'en' | 'pt',
  targetLang: 'en' | 'pt'
): Promise<string> => {
  // If source and target are the same, return the original text
  if (sourceLang === targetLang) {
    return text;
  }

  // Don't translate empty strings
  if (!text || text.trim() === '') {
    return '';
  }

  // Try dictionary-based translation first for common terms
  const dictKey = `${sourceLang}-${targetLang}`;
  const lowerText = text.toLowerCase().trim();
  if (specialityTranslations[dictKey]?.[lowerText]) {
    return specialityTranslations[dictKey][lowerText];
  }

  // Try API translation as fallback
  try {
    const langPair = `${sourceLang}|${targetLang}`;
    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Translation API request failed');
    }

    const data: TranslationResponse = await response.json();
    
    if (data.responseStatus === 200 || data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    
    throw new Error('Translation failed');
  } catch (error) {
    console.error('Translation error:', error);
    // On error, return the original text as fallback
    return text;
  }
};
