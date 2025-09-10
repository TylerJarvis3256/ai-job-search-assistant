// Lightweight Job Analysis for Resume Tailoring
const items = $input.all();
const analyzedJobs = [];

// Tyler's base resume data
const tylerProfile = {
  name: "Tyler Jarvis",
  contact: {
    phone: "(949) 677-3256",
    email: "tylerjarvis3256@gmail.com",
    linkedin: "https://www.linkedin.com/in/TylerJarvis3256/",
    github: "https://github.com/TylerJarvis3256"
  },
  education: {
    degree: "B.S. Computer Science",
    school: "Arizona State University",
    graduation: "Expected May 2026",
    gpa: "3.30 GPA"
  },
  skills: {
    programming: ["JavaScript", "Python", "Java", "C#", "C++"],
    frontend: ["React.js", "Sass", "JavaFX", "HTML", "CSS", "Material-UI"],
    backend: ["Node.js", "Express.js", "REST APIs", "MySQL", "NoSQL", "Git", "GitHub"],
    cloud: ["Netlify", "Bluehost", "Heroku"],
    systems: ["Windows", "Linux", "MacOS"]
  },
  projects: [
    {
      name: "Admin Dashboard",
      date: "December 2024",
      tech: ["React.js", "Material-UI", "Recharts"],
      description: "Developed a responsive admin dashboard leveraging React.js, Material-UI, and Recharts for dynamic data visualization.",
      bullets: [
        "Developed a responsive admin dashboard leveraging React.js, Material-UI, and Recharts for dynamic data visualization.",
        "Designed and implemented reusable, modular components for enhanced scalability and cross-device responsiveness.",
        "Integrated interactive charts and grids, enabling real-time visualization of placeholder datasets."
      ],
      github: "https://github.com/TylerJarvis3256/AdminDashboard"
    },
    {
      name: "AI Company Research Tool",
      date: "December 2024",
      tech: ["Python", "Streamlit", "OpenAI API"],
      description: "Engineered a Streamlit-based application using Python and OpenAI API to automate comprehensive company research.",
      bullets: [
        "Engineered a Streamlit-based application using Python and OpenAI API to automate comprehensive company research.",
        "Implemented seamless CSV input/output workflows to optimize client data analysis and reporting.",
        "Utilized OpenAI API to generate detailed industry insights, enabling growth opportunity identification for clients."
      ],
      github: "https://github.com/TylerJarvis3256/AICompanyResearcher"
    },
    {
      name: "Movie Search Application",
      date: "September 2024",
      tech: ["React.js", "OMDB API"],
      description: "Built a React.js-based movie search platform integrated with the OMDB API for user-friendly browsing.",
      bullets: [
        "Built a React.js-based movie search platform integrated with the OMDB API for user-friendly browsing.",
        "Designed dynamic API calls for real-time search results and responsive layouts for optimal usability on all devices.",
        "Showcased seamless UI/UX features, including instant updates, clean design, and cross-platform compatibility."
      ],
      github: "https://github.com/TylerJarvis3256/movie-search-app"
    }
  ]
};

console.log(`Analyzing ${items.length} high-match jobs for resume tailoring...`);

for (const item of items) {
  const job = item.json;
  const properties = job.properties;
  
  const title = properties.Title?.title?.[0]?.text?.content || '';
  const company = properties.Company?.rich_text?.[0]?.text?.content || '';
  const description = properties.Description?.rich_text?.[0]?.text?.content || '';
  const matchScore = properties['Match Score']?.number || 0;
  const jobUrl = properties['Job URL']?.url || '';
  const pageId = job.id;
  
  // Quick analysis of job requirements
  const jobAnalysis = analyzeJobRequirements(title, description, company);
  
  analyzedJobs.push({
    json: {
      pageId,
      title,
      company,
      description: description.substring(0, 1000), // Truncate for processing
      matchScore,
      jobUrl,
      jobAnalysis,
      tylerProfile,
      
      // Key tailoring data
      primaryRole: jobAnalysis.roleType,
      keySkills: jobAnalysis.requiredSkills,
      preferredTech: jobAnalysis.preferredTech,
      experienceLevel: jobAnalysis.experienceLevel
    }
  });
}

function analyzeJobRequirements(title, description, company) {
  const text = `${title} ${description} ${company}`.toLowerCase();
  
  // Determine primary role type
  let roleType = 'Full-Stack';
  if (text.includes('frontend') || text.includes('front-end') || text.includes('ui') || text.includes('ux')) {
    roleType = 'Frontend';
  } else if (text.includes('backend') || text.includes('back-end') || text.includes('api') || text.includes('server')) {
    roleType = 'Backend';
  } else if (text.includes('automation') || text.includes('devops') || text.includes('infrastructure')) {
    roleType = 'Automation';
  }
  
  // Extract required skills
  const skillPatterns = {
    'React': /react/gi,
    'JavaScript': /javascript|js(?!on)/gi,
    'TypeScript': /typescript|ts(?!$)/gi,
    'Node.js': /node\.?js|nodejs/gi,
    'Python': /python/gi,
    'Next.js': /next\.?js|nextjs/gi,
    'Material-UI': /material.?ui|mui/gi,
    'REST API': /rest|api/gi,
    'MySQL': /mysql/gi,
    'PostgreSQL': /postgresql|postgres/gi,
    'Git': /git(?!hub)/gi,
    'GitHub': /github/gi
  };
  
  const requiredSkills = [];
  const preferredTech = [];
  
  for (const [skill, pattern] of Object.entries(skillPatterns)) {
    if (pattern.test(text)) {
      if (['React', 'JavaScript', 'Node.js', 'Python'].includes(skill)) {
        requiredSkills.push(skill);
      } else {
        preferredTech.push(skill);
      }
    }
  }
  
  // Determine experience level expectation
  let experienceLevel = 'Entry';
  if (text.includes('senior') || text.includes('lead') || text.includes('principal')) {
    experienceLevel = 'Senior';
  } else if (text.includes('mid') || text.includes('intermediate') || text.includes('2+') || text.includes('3+')) {
    experienceLevel = 'Mid';
  }
  
  // Company size indicator
  let companyType = 'Unknown';
  if (text.includes('startup') || text.includes('early stage')) {
    companyType = 'Startup';
  } else if (text.includes('enterprise') || text.includes('fortune')) {
    companyType = 'Enterprise';
  }
  
  return {
    roleType,
    requiredSkills,
    preferredTech,
    experienceLevel,
    companyType,
    isRemote: /remote|work from home|distributed/gi.test(text),
    hasInternship: /intern|internship|co.?op/gi.test(text)
  };
}

console.log(`Analyzed ${analyzedJobs.length} jobs for resume tailoring`);
return analyzedJobs;