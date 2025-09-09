// RSS Data Transformer - Comprehensive HTML/XML cleaning with content cleaning
const items = $input.all();
const transformedJobs = [];

for (const item of items) {
  const rawData = item.json;

  
  // Comprehensive text cleaning function - removes HTML and fixes encoding
  const cleanText = (text) => {
    if (!text) return '';
    
    return text
      // First, decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      
      // Remove HTML/XML tags completely
      .replace(/<[^>]*>/g, ' ')
      
      // Fix common encoding issues
      .replace(/â€™/g, "'")  // Smart apostrophe
      .replace(/â€œ/g, '"')  // Smart quote open
      .replace(/â€/g, '"')   // Smart quote close
      .replace(/â€"/g, '-')   // Em dash
      .replace(/â€"/g, '-')   // En dash
      .replace(/â€¢/g, '•')   // Bullet
      .replace(/â€¦/g, '...')  // Ellipsis
      .replace(/Â/g, '')      // Non-breaking space artifacts
      
      // Alternative encoding patterns
      .replace(/â/g, "'")
      .replace(/â/g, "-")
      .replace(/â/g, '"')
      .replace(/â/g, '"')
      .replace(/â¢/g, '•')
      .replace(/â¦/g, '...')
      
      // Clean up whitespace and formatting
      .replace(/\n+/g, ' ')        // newlines to spaces
      .replace(/\r+/g, ' ')        // carriage returns to spaces
      .replace(/\t+/g, ' ')        // tabs to spaces
      .replace(/\s+/g, ' ')        // multiple spaces to single
      
      // Remove any remaining non-printable characters
      .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '')
      
      .trim();
  };
  
  // Clean and format content - additional formatting for descriptions
  const cleanContent = (content) => {
    if (!content) return '';
    
    // First apply basic cleaning
    const cleaned = cleanText(content);
    
    // Then add extra formatting cleanup
    return cleaned
      .replace(/\s+/g, ' ')           // Normalize all whitespace to single spaces
      .replace(/\t+/g, ' ')           // Replace any remaining tabs
      .replace(/\n+/g, ' ')           // Replace any remaining newlines
      .replace(/\r+/g, ' ')           // Replace any remaining carriage returns
      .replace(/\s*[-–—]\s*/g, ' - ') // Normalize dashes with proper spacing
      .replace(/\s*:\s*/g, ': ')      // Normalize colons with proper spacing
      .replace(/\s*;\s*/g, '; ')      // Normalize semicolons with proper spacing
      .replace(/\s*,\s*/g, ', ')      // Normalize commas with proper spacing
      .replace(/\s*\.\s*/g, '. ')     // Normalize periods with proper spacing
      .replace(/\s+/g, ' ')           // Final normalization of multiple spaces
      .trim();
  };
  
  // Enhanced company extraction
  const extractCompany = (title, content) => {
    const cleanTitle = cleanText(title);
    const cleanContentText = cleanContent(content);
    
    // Try multiple patterns to extract company name
    const patterns = [
      /At\s+([A-Z][a-zA-Z\s&.,-]+),/i,
      /We're\s+([A-Z][a-zA-Z\s&.,-]+)/i,
      /join\s+([A-Z][a-zA-Z\s&.,-]+)['s]*\s+/i,
      /([A-Z][a-zA-Z\s&.,-]+),\s+we\s+(build|are|develop)/i,
      /Company:\s*([A-Z][a-zA-Z\s&.,-]+)/i,
      /working\s+at\s+([A-Z][a-zA-Z\s&.,-]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = cleanContentText.match(pattern);
      if (match && match[1] && match[1].length > 1 && match[1].length < 50) {
        return match[1].trim().replace(/[,.]$/, ''); // Remove trailing punctuation
      }
    }
    
    // Extract from URL if possible (for RemoteOK)
    if (rawData.link && rawData.link.includes('remoteok.com')) {
      const urlMatch = rawData.link.match(/-([a-zA-Z]+)-\d+$/);
      if (urlMatch && urlMatch[1].length > 2) {
        return urlMatch[1].charAt(0).toUpperCase() + urlMatch[1].slice(1);
      }
    }
    
    return 'Unknown Company';
  };
  
  // Clean and extract job title
  const cleanTitle = (title) => {
    const cleaned = cleanText(title);
    
    return cleaned
      .replace(/\s*[-–—]\s*[^-]*$/, '') // Remove company suffix after dash
      .replace(/\s*\|\s*[^|]*$/, '')   // Remove company suffix after pipe
      .replace(/\s*at\s+[^-]*$/i, '')  // Remove "at Company" suffix
      .trim();
  };
  
  // Extract location with better patterns
  const extractLocation = (content) => {
    const cleanContentText = cleanContent(content);
    
    const locationPatterns = [
      /Location:\s*([^\n\r,.]+)/i,
      /Based in:\s*([^\n\r,.]+)/i,
      /Work from:\s*([^\n\r,.]+)/i,
      /(100%\s*remote)/i,
      /(fully\s*remote)/i,
      /(remote[\s-]friendly)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = cleanContentText.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Check if remote is mentioned anywhere
    if (cleanContentText.toLowerCase().includes('remote')) {
      return 'Remote';
    }
    
    return 'Not specified';
  };
  
  // Extract salary information
  const extractSalary = (content) => {
    const cleanContentText = cleanContent(content);
    
    const salaryPatterns = [
      /\$\s*[\d,]+(?:\s*[-–—]\s*\$?\s*[\d,]+)?/g,
      /€\s*[\d,]+(?:\s*[-–—]\s*€?\s*[\d,]+)?/g,
      /£\s*[\d,]+(?:\s*[-–—]\s*£?\s*[\d,]+)?/g,
      /Salary:\s*([^\n\r]+)/i,
      /Compensation:\s*([^\n\r]+)/i
    ];
    
    for (const pattern of salaryPatterns) {
      const match = cleanContentText.match(pattern);
      if (match && match[0]) {
        return match[0].trim();
      }
    }
    
    return null;
  };
  
  // Create clean, structured description (truncated)
  const createDescription = (content) => {
    const cleaned = cleanContent(content); // Use the dedicated content cleaner
    
    return cleaned;
  };
  
  // Create standardized job object
  const transformedJob = {
    title: cleanTitle(rawData.title || ''),
    company: extractCompany(rawData.title || '', rawData.contentSnippet || rawData.content || ''),
    description: createDescription(rawData.contentSnippet || rawData.content || ''),
    link: rawData.link || '',
    datePosted: rawData.isoDate || rawData.pubDate || new Date().toISOString(),
    location: extractLocation(rawData.contentSnippet || rawData.content || ''),
    salary: extractSalary(rawData.contentSnippet || rawData.content || ''),
    source: 'RemoteOK', // Change this for different feeds: 'Indeed', 'RemoteOK', etc.
    rawId: rawData.guid || rawData.id || '',
    
    // Minimal debug info (cleaned and truncated)
    originalTitle: cleanText(rawData.title || ''),
    originalContent: cleanContent((rawData.contentSnippet || '').substring(0, 200)) + '...'
  };
  
  transformedJobs.push({ json: transformedJob });
}

return transformedJobs;