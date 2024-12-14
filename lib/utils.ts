interface TextElement {
    text(): string;
  }
  
  export function extractPrice(...elements: TextElement[]): string {
    for (const element of elements) {
      const priceText = element.text().trim() || "";
      
      if (priceText) {
        // Extract all numbers from the text
        const numbers = priceText.replace(/\D/g, "");
        
        // If the same number is repeating, take just the first instance
        // Look for patterns of the same number repeating
        const matches = numbers.match(/(\d+?)\1+/);
        if (matches) {
          return matches[1];
        }
        
        // If no repeating pattern, just take the first sequence of numbers
        // that looks like a reasonable price (2-5 digits)
        const priceMatch = numbers.match(/^\d{2,5}/);
        if (priceMatch) {
          return priceMatch[0];
        }
        
        // If all else fails, return the first 5 digits
        return "";
      }
    }
    
    return "";
  }