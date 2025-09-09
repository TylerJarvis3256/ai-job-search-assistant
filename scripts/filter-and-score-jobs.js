// Job Scoring and Filtering Node
const items = $input.all();
const filteredJobs = [];

// Tyler's profile for matching
const profile = {
  skills: {
    required: ['javascript', 'react', 'frontend', 'node', 'web development', 'html', 'css'],
    preferred: ['typescript', 'next.js', 'python', 'api', 'full-stack', 'backend', 'rest'],
    databases: ['mysql', 'postgresql', 'mongodb', 'sql'],
    tools: ['git', 'github', 'rest api', 'express']
  },
  experience: ['entry', 'junior', 'new grad', '0-2 years', 'intern', 'internship', 'entry level', 'entry-level'],
  exclude: ['senior', '5+ years', '4+ years', '3+ years', 'lead', 'principal', 'staff', '7+ years', 'architect', 'mid-level', 'experienced'],
  dreamCompanies: ['vercel', 'linear', 'notion', 'stripe', 'supabase', 'google', 'microsoft', 'github'],
  workPreference: ['remote', 'work from home', 'distributed', 'hybrid', '100% remote', 'fully remote']
};

console.log(`Processing ${items.length} jobs from transformer...`);

for (const item of items) {
  const job = item.json;
  
  // Debug: Check the structure of incoming data
  console.log(`Processing job: ${job.title} at ${job.company}`);
  
  // Safely get text fields and convert to lowercase
  const title = (job.title || '').toLowerCase();
  const description = (job.description || '').toLowerCase();
  const company = (job.company || '').toLowerCase();
  const location = (job.location || '').toLowerCase();
  
  // Combine all text for searching
  const fullText = `${title} ${description} ${company} ${location}`;
  
  // Skip jobs that explicitly exclude entry-level candidates
  const hasExcludeTerms = profile.exclude.some(term => {
    const termFound = fullText.includes(term.toLowerCase());
    if (termFound) {
      console.log(`Excluding job "${job.title}" due to term: ${term}`);
    }
    return termFound;
  });
  
  if (hasExcludeTerms) {
    continue; // Skip this job
  }
  
  // Calculate match score (1-10 scale)
  let score = 5.0; // baseline
  
  // Required skills matching (40% weight)
  const requiredMatches = profile.skills.required.filter(skill => 
    fullText.includes(skill.toLowerCase())
  );
  const requiredScore = (requiredMatches.length / profile.skills.required.length) * 3.0;
  score += requiredScore;
  
  // Preferred skills bonus (20% weight)  
  const preferredMatches = profile.skills.preferred.filter(skill => 
    fullText.includes(skill.toLowerCase())
  );
  const preferredScore = (preferredMatches.length / profile.skills.preferred.length) * 1.5;
  score += preferredScore;
  
  // Database skills bonus
  const databaseMatches = profile.skills.databases.filter(db => 
    fullText.includes(db.toLowerCase())
  );
  if (databaseMatches.length > 0) score += 0.5;
  
  // Tools bonus
  const toolMatches = profile.skills.tools.filter(tool => 
    fullText.includes(tool.toLowerCase())
  );
  if (toolMatches.length > 0) score += 0.5;
  
  // Experience level alignment (20% weight)
  const experienceMatch = profile.experience.some(level => 
    fullText.includes(level.toLowerCase())
  );
  if (experienceMatch) {
    score += 1.5;
    console.log(`Experience bonus for: ${job.title}`);
  }
  
  // Company preference bonus (10% weight)
  const isDreamCompany = profile.dreamCompanies.some(dreamCo => 
    company.includes(dreamCo.toLowerCase())
  );
  if (isDreamCompany) {
    score += 2.0;
    console.log(`Dream company bonus for: ${job.company}`);
  }
  
  // Work arrangement bonus (10% weight)
  const isRemoteFriendly = profile.workPreference.some(pref => 
    fullText.includes(pref.toLowerCase())
  );
  if (isRemoteFriendly) score += 1.0;
  
  // Startup bonus (smaller companies often more open to juniors)
  if (fullText.includes('startup') || fullText.includes('small team')) {
    score += 0.5;
  }
  
  // Tech stack bonus - check for modern tech
  const modernTech = ['typescript', 'next.js', 'react', 'node.js', 'api', 'docker', 'aws'];
  const techMatches = modernTech.filter(tech => fullText.includes(tech.toLowerCase()));
  score += techMatches.length * 0.3;
  
  // Penalize if too complex/advanced
  if (fullText.includes('enterprise') && fullText.includes('complex')) {
    score -= 0.5;
  }
  
  // Only keep jobs with decent match scores
  if (score >= 6.0) {
    const finalScore = Math.round(score * 10) / 10; // Round to 1 decimal
    
    const scoredJob = {
      ...job, // Keep all original fields from transformer
      matchScore: finalScore,
      isHighPriority: finalScore >= 8.0,
      isPriorityCompany: isDreamCompany,
      hasRequiredSkills: requiredMatches.length >= 2,
      isRemote: isRemoteFriendly,
      isEntryLevel: experienceMatch,
      
      // Useful for debugging
      matchedSkills: {
        required: requiredMatches,
        preferred: preferredMatches,
        databases: databaseMatches,
        tools: toolMatches
      },
      
      // Score breakdown for debugging
      scoreBreakdown: {
        base: 5.0,
        required: requiredScore,
        preferred: preferredScore,
        experience: experienceMatch ? 1.5 : 0,
        company: isDreamCompany ? 2.0 : 0,
        remote: isRemoteFriendly ? 1.0 : 0,
        tech: techMatches.length * 0.3,
        total: finalScore
      }
    };
    
    filteredJobs.push(scoredJob);
    console.log(`Added job: ${job.title} (Score: ${finalScore})`);
  } else {
    console.log(`Filtered out: ${job.title} (Score: ${Math.round(score * 10) / 10})`);
  }
}

// Sort by match score (highest first)
filteredJobs.sort((a, b) => b.matchScore - a.matchScore);

// Limit to top 25 jobs per day to avoid overwhelming Notion
const topJobs = filteredJobs.slice(0, 25);

console.log(`Final result: ${topJobs.length} jobs passed filtering`);
if (topJobs.length > 0) {
  console.log(`Top job: ${topJobs[0]?.title} (${topJobs[0]?.matchScore})`);
}

return topJobs.map(job => ({ json: job }));