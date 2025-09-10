// Generate resume title for display
const companyName = $json.company || $('Convert Markdown to HTML').first().json.company || null;
const jobTitle = $json.title || $('Convert Markdown to HTML').first().json.title || null;
const candidateName = 'Tyler Jarvis';
let resumeTitle;
if (companyName && companyName.trim()) {
  resumeTitle = `${candidateName} - ${companyName.trim()} Resume`;
} else if (jobTitle && jobTitle.trim()) {
  resumeTitle = `${candidateName} - ${jobTitle.trim()} Resume`;
} else {
  resumeTitle = `${candidateName} - Resume`;
}

// Return properly formatted data for Google Drive upload
return {
  json: {
    // Keep existing data
    ...($json || {}),
    // Add metadata
    resume_title: resumeTitle,
   
  }
};