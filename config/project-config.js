// config/project-config.js
export const config = {
  // API Keys (add to your .env)
  claude: {
    apiKey: process.env.CLAUDE_API_KEY,
    model: "claude-3-5-sonnet-20241022", // Sonnet 4 equivalent
    maxTokens: 4000
  },
  
  // Job Sources
  jobSources: {
    indeed: {
      rss: "https://rss.indeed.com/rss?q=frontend+developer&l=Remote",
      enabled: true
    },
    remoteok: {
      rss: "https://remoteok.io/remote-jobs.rss",
      enabled: true
    },
    adzuna: {
      apiKey: process.env.ADZUNA_API_KEY,
      appId: process.env.ADZUNA_APP_ID,
      enabled: false // Start with RSS only
    }
  },
  
  // Your profile for AI personalization
  profile: {
    name: "Tyler Jarvis",
    education: "ASU Computer Science, Senior",
    location: "Tempe, AZ",
    skills: ["React.js", "Next.js", "JavaScript", "Python", "Node.js", "APIs"],
    projects: ["Admin Dashboard", "AI Company Research Tool", "Movie Search App"],
    targetRoles: ["Frontend Developer", "Full-Stack Developer", "Software Engineer Intern"],
    dreamCompanies: ["Vercel", "Linear", "Notion", "Stripe", "Supabase"]
  }
};