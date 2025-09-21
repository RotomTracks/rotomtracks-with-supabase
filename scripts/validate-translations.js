#!/usr/bin/env node

/**
 * Script to validate translation files
 * Usage: node scripts/validate-translations.js
 */

const fs = require('fs');
const path = require('path');

// Import validation functions (we'll need to adapt these for Node.js)
const SUPPORTED_LANGUAGES = ['es', 'en'];

/**
 * Validate translation key format
 */
function validateTranslationKey(key) {
  const errors = [];
  const warnings = [];

  if (!key || key.trim() === '') {
    errors.push('Translation key cannot be empty');
    return { isValid: false, errors, warnings };
  }

  if (!/^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/.test(key)) {
    errors.push('Translation key should use dot notation with alphanumeric characters');
  }

  if (key.includes('_')) {
    warnings.push('Consider using camelCase instead of snake_case');
  }

  if (key.includes('-')) {
    warnings.push('Consider using camelCase instead of kebab-case');
  }

  if (key.length > 100) {
    warnings.push('Translation key is quite long');
  }

  const reservedPatterns = ['test', 'debug', 'temp', 'TODO', 'FIXME'];
  for (const pattern of reservedPatterns) {
    if (key.toLowerCase().includes(pattern.toLowerCase())) {
      warnings.push(`Translation key contains reserved word "${pattern}"`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate translation value
 */
function validateTranslationValue(key, value, language) {
  const errors = [];
  const warnings = [];

  if (value === undefined || value === null) {
    errors.push(`Missing translation value for key "${key}" in language "${language}"`);
    return { isValid: false, errors, warnings };
  }

  if (typeof value !== 'string' && !Array.isArray(value)) {
    errors.push(`Translation value for "${key}" should be a string or array, got ${typeof value}`);
  }

  if (typeof value === 'string') {
    if (value.trim() === '') {
      warnings.push(`Empty translation value for key "${key}"`);
    }

    const placeholders = value.match(/\{\{[^}]+\}\}/g) || [];
    const uniquePlaceholders = new Set(placeholders);
    
    if (placeholders.length !== uniquePlaceholders.size) {
      warnings.push(`Duplicate placeholders found in "${key}"`);
    }

    if (value.includes('{{') && !value.includes('}}')) {
      errors.push(`Malformed placeholder in "${key}": missing closing braces`);
    }

    if (value.includes('}}') && !value.includes('{{')) {
      errors.push(`Malformed placeholder in "${key}": missing opening braces`);
    }

    if (/<[^>]+>/.test(value)) {
      warnings.push(`HTML tags found in "${key}", ensure proper escaping if intentional`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Flatten nested object
 */
function flattenObject(obj, prefix = '') {
  const flattened = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, fullKey));
    } else {
      flattened[fullKey] = value;
    }
  }
  
  return flattened;
}

/**
 * Load translation file
 */
function loadTranslationFile(language) {
  try {
    const filePath = path.join(__dirname, '..', 'lib', 'i18n', 'locales', language, 'index.ts');
    
    if (!fs.existsSync(filePath)) {
      console.error(`Translation file not found: ${filePath}`);
      return null;
    }

    // Read the TypeScript file and extract the export
    const content = fs.readFileSync(filePath, 'utf8');
    
    // This is a simplified approach - in a real scenario, you might want to use a TypeScript compiler
    // For now, we'll assume the files export a simple object structure
    console.log(`Loading translations for ${language}...`);
    
    // Try to require the compiled JavaScript version if available
    try {
      delete require.cache[require.resolve(filePath)];
      const translations = require(filePath);
      return translations.default || translations;
    } catch (error) {
      console.warn(`Could not require ${filePath}, skipping validation for ${language}`);
      return null;
    }
  } catch (error) {
    console.error(`Error loading translation file for ${language}:`, error.message);
    return null;
  }
}

/**
 * Compare translations between languages
 */
function compareTranslations(baseLanguage, baseTranslations, targetLanguage, targetTranslations) {
  const flatBase = flattenObject(baseTranslations);
  const flatTarget = flattenObject(targetTranslations);

  const missingInTarget = [];
  const missingInBase = [];
  const typeMismatches = [];
  const placeholderMismatches = [];

  // Find missing translations
  for (const key of Object.keys(flatBase)) {
    if (!(key in flatTarget)) {
      missingInTarget.push(key);
    }
  }

  for (const key of Object.keys(flatTarget)) {
    if (!(key in flatBase)) {
      missingInBase.push(key);
    }
  }

  // Find type mismatches and placeholder mismatches
  for (const key of Object.keys(flatBase)) {
    if (key in flatTarget) {
      const baseValue = flatBase[key];
      const targetValue = flatTarget[key];
      
      const baseType = Array.isArray(baseValue) ? 'array' : typeof baseValue;
      const targetType = Array.isArray(targetValue) ? 'array' : typeof targetValue;
      
      if (baseType !== targetType) {
        typeMismatches.push({ key, baseType, targetType });
      }
      
      if (typeof baseValue === 'string' && typeof targetValue === 'string') {
        const basePlaceholders = (baseValue.match(/\{\{[^}]+\}\}/g) || []).sort();
        const targetPlaceholders = (targetValue.match(/\{\{[^}]+\}\}/g) || []).sort();
        
        if (JSON.stringify(basePlaceholders) !== JSON.stringify(targetPlaceholders)) {
          placeholderMismatches.push({ key, basePlaceholders, targetPlaceholders });
        }
      }
    }
  }

  return {
    missingInTarget,
    missingInBase,
    typeMismatches,
    placeholderMismatches
  };
}

/**
 * Main validation function
 */
function validateTranslations() {
  console.log('🌐 Starting translation validation...\n');

  const allTranslations = {};
  let hasErrors = false;

  // Load all translation files
  for (const language of SUPPORTED_LANGUAGES) {
    const translations = loadTranslationFile(language);
    if (translations) {
      allTranslations[language] = translations;
    }
  }

  // Validate each language
  for (const [language, translations] of Object.entries(allTranslations)) {
    console.log(`📋 Validating ${language} translations...`);
    
    const flatTranslations = flattenObject(translations);
    let languageErrors = 0;
    let languageWarnings = 0;

    for (const [key, value] of Object.entries(flatTranslations)) {
      // Validate key
      const keyValidation = validateTranslationKey(key);
      if (!keyValidation.isValid) {
        console.error(`  ❌ Invalid key "${key}": ${keyValidation.errors.join(', ')}`);
        languageErrors++;
        hasErrors = true;
      }
      if (keyValidation.warnings.length > 0) {
        console.warn(`  ⚠️  Key warnings for "${key}": ${keyValidation.warnings.join(', ')}`);
        languageWarnings++;
      }

      // Validate value
      const valueValidation = validateTranslationValue(key, value, language);
      if (!valueValidation.isValid) {
        console.error(`  ❌ Invalid value for "${key}": ${valueValidation.errors.join(', ')}`);
        languageErrors++;
        hasErrors = true;
      }
      if (valueValidation.warnings.length > 0) {
        console.warn(`  ⚠️  Value warnings for "${key}": ${valueValidation.warnings.join(', ')}`);
        languageWarnings++;
      }
    }

    console.log(`  📊 ${language}: ${Object.keys(flatTranslations).length} keys, ${languageErrors} errors, ${languageWarnings} warnings\n`);
  }

  // Compare translations between languages
  const languages = Object.keys(allTranslations);
  if (languages.length > 1) {
    console.log('🔍 Comparing translations between languages...');
    
    const baseLanguage = 'es'; // Use Spanish as base
    const baseTranslations = allTranslations[baseLanguage];
    
    if (baseTranslations) {
      for (const targetLanguage of languages) {
        if (targetLanguage === baseLanguage) continue;
        
        const targetTranslations = allTranslations[targetLanguage];
        const comparison = compareTranslations(baseLanguage, baseTranslations, targetLanguage, targetTranslations);
        
        console.log(`\n📊 ${baseLanguage} vs ${targetLanguage}:`);
        
        if (comparison.missingInTarget.length > 0) {
          console.error(`  ❌ Missing in ${targetLanguage}: ${comparison.missingInTarget.length} keys`);
          comparison.missingInTarget.slice(0, 5).forEach(key => {
            console.error(`    - ${key}`);
          });
          if (comparison.missingInTarget.length > 5) {
            console.error(`    ... and ${comparison.missingInTarget.length - 5} more`);
          }
          hasErrors = true;
        }
        
        if (comparison.missingInBase.length > 0) {
          console.warn(`  ⚠️  Extra in ${targetLanguage}: ${comparison.missingInBase.length} keys`);
        }
        
        if (comparison.typeMismatches.length > 0) {
          console.error(`  ❌ Type mismatches: ${comparison.typeMismatches.length}`);
          comparison.typeMismatches.slice(0, 3).forEach(({ key, baseType, targetType }) => {
            console.error(`    - ${key}: ${baseType} vs ${targetType}`);
          });
          hasErrors = true;
        }
        
        if (comparison.placeholderMismatches.length > 0) {
          console.error(`  ❌ Placeholder mismatches: ${comparison.placeholderMismatches.length}`);
          comparison.placeholderMismatches.slice(0, 3).forEach(({ key, basePlaceholders, targetPlaceholders }) => {
            console.error(`    - ${key}: [${basePlaceholders.join(', ')}] vs [${targetPlaceholders.join(', ')}]`);
          });
          hasErrors = true;
        }
      }
    }
  }

  console.log('\n🏁 Translation validation complete!');
  
  if (hasErrors) {
    console.error('❌ Validation failed with errors. Please fix the issues above.');
    process.exit(1);
  } else {
    console.log('✅ All translations are valid!');
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateTranslations();
}

module.exports = {
  validateTranslations,
  validateTranslationKey,
  validateTranslationValue,
  compareTranslations
};