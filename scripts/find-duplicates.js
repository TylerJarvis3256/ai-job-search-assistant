// Find and group duplicate jobs
const items = $input.all();
const duplicatesToDelete = [];
const jobGroups = new Map();

console.log(`Analyzing ${items.length} jobs for duplicates...`);

// Group jobs by different signatures
for (const item of items) {
  const job = item.json;
  const properties = job.properties;
  
  const url = properties["Job URL"]?.url || '';
  const title = properties.Title?.title?.[0]?.text?.content || '';
  const company = properties.Company?.rich_text?.[0]?.text?.content || '';
  const dateFound = properties["Date Found"]?.date?.start || '';
  const pageId = job.id;
  
  const jobData = {
    pageId,
    title,
    company,
    url,
    dateFound: new Date(dateFound || '1970-01-01'),
    originalItem: item
  };
  
  // Create multiple signatures for different types of duplicates
  const signatures = [];
  
  // 1. Exact URL match
  if (url && url.length > 10) {
    signatures.push(`url:${url}`);
  }
  
  // 2. Title + Company match (exact)
  if (title && company) {
    const titleCompany = `${title.toLowerCase().trim()}|${company.toLowerCase().trim()}`;
    signatures.push(`tc:${titleCompany}`);
  }
  
  // 3. Fuzzy company + similar title
  if (title && company && title.length > 5) {
    const fuzzyTitle = title.toLowerCase().replace(/[^\w\s]/g, '').substring(0, 20);
    const fuzzyCompany = company.toLowerCase().trim();
    signatures.push(`fuzzy:${fuzzyCompany}|${fuzzyTitle}`);
  }
  
  // Add job to all relevant groups
  for (const signature of signatures) {
    if (!jobGroups.has(signature)) {
      jobGroups.set(signature, []);
    }
    jobGroups.get(signature).push(jobData);
  }
}

console.log(`Created ${jobGroups.size} signature groups`);

// Find duplicates in each group
let duplicateGroups = 0;
let totalDuplicates = 0;

for (const [signature, jobs] of jobGroups) {
  if (jobs.length > 1) {
    duplicateGroups++;
    
    // Remove duplicates within this group (same job added multiple times)
    const uniqueJobs = [];
    const seenPageIds = new Set();
    
    for (const job of jobs) {
      if (!seenPageIds.has(job.pageId)) {
        uniqueJobs.push(job);
        seenPageIds.add(job.pageId);
      }
    }
    
    if (uniqueJobs.length > 1) {
      console.log(`\nDuplicate group ${duplicateGroups}: ${signature}`);
      console.log(`${uniqueJobs.length} unique jobs found`);
      
      // Sort by date found (oldest first) to keep the oldest
      uniqueJobs.sort((a, b) => a.dateFound - b.dateFound);
      
      // Keep the first (oldest), delete the rest (newer ones)
      const keepJob = uniqueJobs[0];
      const deleteJobs = uniqueJobs.slice(1);
      
      console.log(`Keeping OLDEST: "${keepJob.title}" at ${keepJob.company} (${keepJob.dateFound.toISOString().split('T')[0]}) - ID: ${keepJob.pageId}`);
      
      for (const deleteJob of deleteJobs) {
        console.log(`Marking NEWER for deletion: "${deleteJob.title}" at ${deleteJob.company} (${deleteJob.dateFound.toISOString().split('T')[0]}) - ID: ${deleteJob.pageId}`);
        
        duplicatesToDelete.push({
          json: {
            pageId: deleteJob.pageId,
            title: deleteJob.title,
            company: deleteJob.company,
            url: deleteJob.url,
            signature: signature,
            dateFound: deleteJob.dateFound.toISOString().split('T')[0],
            reason: `Newer duplicate - keeping older version from ${keepJob.dateFound.toISOString().split('T')[0]}`
          }
        });
        totalDuplicates++;
      }
    }
  }
}

console.log(`\n=== DUPLICATE CLEANUP SUMMARY ===`);
console.log(`Total jobs analyzed: ${items.length}`);
console.log(`Duplicate groups found: ${duplicateGroups}`);
console.log(`NEWER jobs marked for deletion: ${totalDuplicates}`);
console.log(`OLDER jobs remaining after cleanup: ${items.length - totalDuplicates}`);

if (totalDuplicates === 0) {
  console.log("\nNo duplicates found! Database is clean.");
  return [];
}

console.log(`\nReturning ${duplicatesToDelete.length} newer duplicate items for deletion...`);
console.log(`Sample page ID: ${duplicatesToDelete[0]?.json?.pageId}`);

return duplicatesToDelete;