// Convert Resume to Professional HTML with Compact Formatting
const items = $input.all();
const htmlResults = [];

for (const item of items) {
  const resumeContent = item.json.resumeContent;
  const company = item.json.company || 'Company';
  const jobTitle = item.json.jobTitle || 'Position';
  
  // Professional HTML template with compact CSS
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tyler Jarvis Resume - ${company}</title>
    <style>
        @page {
            size: letter;
            margin: 0.5in;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            font-size: 9.5pt;
            line-height: 1;
            color: #000;
            max-width: 10.5in;
            margin: auto;
            background: white;
        }
        
        h1 {
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            margin: 0 0 3pt 0;
            letter-spacing: 0.3pt;
        }
        
        .contact-info {
            text-align: center;
            font-size: 8.5pt;
            margin: 0 auto 5pt auto; 
            line-height: 1.0;
        }
        
        .social-links {
            text-align: center;
            font-size: 8.5pt;
            margin-bottom: 5pt;
        }
        
        .social-links a {
            color: #0066cc;
            text-decoration: none;
            font-weight: 500;
        }
        
        .social-links a:hover {
            text-decoration: underline;
        }
        
        h2 {
            font-size: 10pt;
            font-weight: bold;
            margin: 6pt 0 2pt 0;
            border-bottom: 0.8pt solid #000;
            padding-bottom: 0.5pt;
            text-transform: uppercase;
            letter-spacing: 0.2pt;
        }
        
        h3 {
            font-size: 9.5pt;
            font-weight: bold;
            margin: 4pt 0 1pt 0;
            font-style: italic;
        }
        
        ul {
            margin: 0;
            padding-left: 12pt;
        }
        
        li {
            margin-bottom: 0pt;
            text-align: justify;
        }
        
        p {
            margin: 1pt 0;
            text-align: justify;
        }
        
        strong, b {
            font-weight: bold;
        }
        
        em, i {
            font-style: italic;
        }
        
        .skills {
            margin-bottom: 3pt;
        }
        
        .project-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-top: 4pt;
        }
        
        .project-date {
            font-style: italic;
            font-size: 8.5pt;
        }
        
        .project-link {
            font-size: 8pt;
            margin: 2pt 0 3pt 0;
        }
        
        .project-link a {
            color: #0066cc;
            text-decoration: none;
            font-weight: 500;
        }
        
        .project-link a:hover {
            text-decoration: underline;
        }
        
        /* Print optimizations */
        @media print {
            body { font-size: 9pt; }
            h1 { font-size: 13pt; }
            h2 { font-size: 9.5pt; page-break-after: avoid; }
            h3 { page-break-after: avoid; }
            .project-header { page-break-after: avoid; }
            ul { page-break-inside: avoid; }
            .social-links a, .project-link a { 
                color: #0066cc; 
                text-decoration: none; 
            }
        }
    </style>
</head>
<body>
    ${convertMarkdownToHTML(resumeContent)}
</body>
</html>`;
  
  htmlResults.push({
    json: {
      ...item.json,
      htmlContent: htmlContent,
      htmlFilename: `Tyler_Jarvis_Resume_${sanitizeFilename(company)}_${sanitizeFilename(jobTitle)}.html`,
      pdfFilename: `Tyler_Jarvis_Resume_${sanitizeFilename(company)}_${sanitizeFilename(jobTitle)}.pdf`
    }
  });
}

function convertMarkdownToHTML(markdown) {
  if (!markdown) return '';
  
  let html = markdown
    // Convert headers
    .replace(/^# (.+$)/gim, '<h1>$1</h1>')
    .replace(/^## (.+$)/gim, '<h2>$1</h2>')
    .replace(/^### (.+$)/gim, '<h3>$1</h3>')
    
    // Convert contact info (phone and email only)
    .replace(/\(\d{3}\)\s\d{3}-\d{4}\s\|\s([^\n|]+)/g, '<div class="contact-info">$&</div>')
    
    // Convert LinkedIn and GitHub links to styled links on one line
    .replace(/(https:\/\/www\.linkedin\.com\/in\/[^\s]+)\s*\|\s*(https:\/\/github\.com\/[^\s]+)/g, 
      '<div class="social-links"><a href="$1">linkedin.com/in/TylerJarvis3256</a> | <a href="$2">github.com/TylerJarvis3256</a></div>')
    
    // Remove markdown link brackets around GitHub URLs
    .replace(/\[(https:\/\/github\.com\/TylerJarvis3256\/[^\]]+)\]\([^)]+\)/g, '$1')
    
    // Convert project GitHub links BEFORE converting line breaks
    .replace(/(https:\/\/github\.com\/TylerJarvis3256\/[^\s]+)/g, 
      '<div class="project-link"><a href="$1">$1</a></div>')
    
    // Convert bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    
    // Convert bullet points
    .replace(/^• (.+$)/gim, '<li>$1</li>')
    
    // Convert line breaks
    .replace(/\n\n/g, '<p><p>')
    .replace(/\n/g, '<br>');
  
  // Remove <br> tags immediately after h2 headers
  html = html.replace(/<\/h2><br>/g, '</h2>');

  // Remove <br> tags before and after project links
  html = html.replace(/<br><div class="project-link">/g, '<div class="project-link">')
  html = html.replace(/<\/a><\/div>\s*<br>/g, '</a></div>');
  
  // Group consecutive list items into single <ul> tags (this fixes the spacing issue)
  html = html.replace(/(<li>.*?<\/li>)(\s*<br>\s*<li>.*?<\/li>)*/gs, function(match) {
    // Remove <br> tags between list items and wrap all in one <ul>
    const cleanedMatch = match.replace(/<br>\s*/g, '');
    return '<ul>' + cleanedMatch + '</ul>';
  });
  
  // Wrap text in paragraphs
  html = '<p>' + html + '</p>';
  
  // Clean up empty paragraphs and formatting artifacts
  html = html.replace(/<p>\s*<\/p>/g, '');
  
  return html;
}

function sanitizeFilename(text) {
  if (!text) return 'Unknown';
  return text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15);
}

console.log(`Generated HTML for ${htmlResults.length} resumes`);
return htmlResults;