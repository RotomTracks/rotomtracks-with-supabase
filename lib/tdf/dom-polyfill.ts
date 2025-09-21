/**
 * DOM Polyfill for Node.js environment
 * 
 * This module provides DOMParser functionality for server-side XML parsing
 * when the native DOMParser is not available.
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined';

let DOMParserImpl: typeof DOMParser;

if (isBrowser) {
  // Use native DOMParser in browser
  DOMParserImpl = window.DOMParser;
} else {
  // Simple fallback for Node.js environment
  // In a real production environment, you might want to use a proper XML parser
  
  interface ElementLike {
    textContent: string;
    getAttribute: (attr: string) => string | null;
  }
  
  class SimpleDOMParser {
    parseFromString(xmlString: string): {
      querySelector: (selector: string) => ElementLike | null;
      querySelectorAll: (selector: string) => ElementLike[];
    } {
      // Very basic XML parsing - this is a simplified implementation
      // In production, consider using a proper XML parser library
      
      const doc = {
        querySelector: (selector: string): ElementLike | null => {
          // Basic selector support for our TDF parsing needs
          const match: RegExpMatchArray | null = xmlString.match(new RegExp(`<${selector}[^>]*>([^<]*)</${selector}>`, 'i'));
          if (match) {
            return {
              textContent: match[1],
              getAttribute: (attr: string) => {
                const attrMatch = xmlString.match(new RegExp(`<${selector}[^>]*${attr}="([^"]*)"`, 'i'));
                return attrMatch ? attrMatch[1] : null;
              }
            };
          }
          
          // Handle self-closing tags with attributes
          const selfClosingMatch: RegExpMatchArray | null = xmlString.match(new RegExp(`<${selector}([^>]*)/?>`, 'i'));
          if (selfClosingMatch) {
            return {
              textContent: '',
              getAttribute: (attr: string) => {
                const attrMatch = selfClosingMatch[1].match(new RegExp(`${attr}="([^"]*)"`, 'i'));
                return attrMatch ? attrMatch[1] : null;
              }
            };
          }
          
          return null;
        },
        querySelectorAll: (selector: string): ElementLike[] => {
          const matches: ElementLike[] = [];
          const regex = new RegExp(`<${selector}[^>]*>.*?</${selector}>`, 'gi');
          let match: RegExpExecArray | null;
          while ((match = regex.exec(xmlString)) !== null) {
            const matchText = match[0];
            matches.push({
              textContent: matchText.replace(/<[^>]*>/g, ''),
              getAttribute: (attr: string) => {
                const attrMatch = matchText.match(new RegExp(`${attr}="([^"]*)"`, 'i'));
                return attrMatch ? attrMatch[1] : null;
              }
            });
          }
          return matches;
        }
      };
      
      // Check for parser errors
      if (xmlString.includes('parsererror')) {
        const errorDoc = { ...doc };
        errorDoc.querySelector = (selector: string): ElementLike | null => {
          if (selector === 'parsererror') {
            return { 
              textContent: 'Parser error',
              getAttribute: () => null
            };
          }
          return doc.querySelector(selector);
        };
        return errorDoc;
      }
      
      return doc;
    }
  }
  
  DOMParserImpl = SimpleDOMParser as any;
}

// Make DOMParser available globally
if (!isBrowser && typeof global !== 'undefined') {
  (global as typeof globalThis).DOMParser = DOMParserImpl;
}

export { DOMParserImpl as DOMParser };