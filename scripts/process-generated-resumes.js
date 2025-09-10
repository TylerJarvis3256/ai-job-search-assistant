// Fixed Process Generated Resumes and Prepare Storage
const items = $input.all();
const processedResumes = [];

console.log(`Processing ${items.length} generated resumes...`);

for (const item of items) {
  const itemData = item.json;
  
  // Debug: Log the structure to understand what we're getting
  console.log(`Item structure:`, Object.keys(itemData));
  
  // The Claude response comes in the 'text' field based on your output
  const generatedResume = itemData.text || itemData.output || itemData.response || '';
  
  // Get job data from the previous node (should be in the item)
  const jobTitle = itemData.title || $('Analyze Jobs for Tailoring').item.json.title || 'Unknown Position';
  const company = itemData.company || $('Analyze Jobs for Tailoring').item.json.company || 'Unknown Company';
  const pageId = itemData.pageId || $('Analyze Jobs for Tailoring').item.json.pageId || '';
  const primaryRole = itemData.primaryRole || $('Analyze Jobs for Tailoring').item.json.primaryRole || 'General';
  const keySkills = itemData.keySkills || $('Analyze Jobs for Tailoring').item.json.keySkills || [];
  const matchScore = itemData.matchScore || $('Analyze Jobs for Tailoring').item.json.matchScore || 0;
  
  console.log(`Processing resume for: ${jobTitle} at ${company}`);
  
  // Clean and format the resume
  const cleanResume = cleanResumeContent(generatedResume);
  
  // Generate resume metadata with safe fallbacks
  const resumeMetadata = {
    jobTitle: jobTitle,
    company: company,
    roleType: primaryRole,
    keySkills: Array.isArray(keySkills) ? keySkills : [],
    generatedDate: new Date().toISOString().split('T')[0],
    matchScore: matchScore,
    resumeVersion: generateResumeVersion(primaryRole, company),
    wordCount: cleanResume.split(' ').filter(word => word.length > 0).length,
    filename: `Tyler_Jarvis_Resume_${sanitizeFilename(company)}_${sanitizeFilename(jobTitle)}.md`
  };
  
  processedResumes.push({
    json: {
      pageId: pageId,
      jobTitle: jobTitle,
      company: company,
      resumeContent: cleanResume,
      resumeMetadata: resumeMetadata,
      
      // For Notion updates
      resumeVersion: resumeMetadata.resumeVersion,
      generatedDate: resumeMetadata.generatedDate,
      filename: resumeMetadata.filename,
      wordCount: resumeMetadata.wordCount,
      tailoringNotes: `Tailored for ${primaryRole} role emphasizing ${resumeMetadata.keySkills.slice(0, 2).join(' and ')}`
    }
  });
}

function cleanResumeContent(content) {
  if (!content) return '';
  
  // Remove markdown code blocks if present
  let cleaned = content.replace(/```markdown\s*|```\s*/g, '');
  
  // Normalize line endings
  cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Clean up multiple consecutive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

function generateResumeVersion(roleType, company) {
  // Safe fallbacks for undefined values
  const safeRoleType = roleType || 'GEN';
  const safeCompany = company || 'UNKNOWN';
  
  const roleAbbr = {
    'Frontend': 'FE',
    'Backend': 'BE', 
    'Full-Stack': 'FS',
    'Automation': 'AUTO'
  }[safeRoleType] || 'GEN';
  
  const companyAbbr = safeCompany.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') || 'UNKN';
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  return `${roleAbbr}_${companyAbbr}_${date}`;
}

function sanitizeFilename(text) {
  if (!text) return 'Unknown';
  
  return text
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 20); // Limit length
}

console.log(`Successfully processed ${processedResumes.length} tailored resumes`);
return processedResumes;