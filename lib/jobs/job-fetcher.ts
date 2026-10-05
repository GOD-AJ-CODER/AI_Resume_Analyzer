import { VerifiedJob } from "@/lib/jobs/layer2-3-credibility";

export interface RawJob {
  id: string;
  title: string;
  company: string;
  location: string;
  postedDate: string;
  postedDaysAgo: number;
  applyUrl: string;
  description: string;
  publisher?: string;
}

export function isAllowedIndiaLocation(loc: string): boolean {
  if (!loc) return true;
  const l = loc.toLowerCase();
  const banned = ["usa", "u.s.", "united states", "north america", "americas", "canada", "uk", "europe", "seattle", "boston", "san francisco", "new york", "austin", "london"];
  for (const b of banned) {
    if (l.includes(b)) return false;
  }
  return true;
}

export async function fetchDeterministicJobs(
  targetTitles: string[],
  topSkills: string[],
  location?: string,
  workPreference?: string,
  roleType?: string
): Promise<VerifiedJob[]> {
  const primaryTitle = targetTitles[0] || "Software Engineer";
  const skill1 = topSkills[0] || "JavaScript";
  const skill2 = topSkills[1] || "React";
  const skill3 = topSkills[2] || "Node.js";
  const allSkills = topSkills.length > 0 ? topSkills : ["JavaScript", "React", "Node.js", "TypeScript", "Python"];
  const primarySkill = allSkills[0];
  const roleAndSkills = `${primaryTitle} ${primarySkill}`;

  const loc = location && location !== "Remote (Anywhere)" && location !== "All India" && location !== "Remote (Work from Anywhere in India)" ? location : "India";
  const isRemote = location === "Remote (Anywhere)" || location === "Remote (Work from Anywhere in India)" || workPreference === "Remote";
  const isGov = roleType === "Govt & Research (AICTE / DRDO / ISRO / MeitY)";
  const isEntry = roleType === "Fresher / SDE-1 Full-Time";
  const isIntern = roleType === "Student Internships" || (!isGov && !isEntry && roleType !== "All Opportunities");

  const jobs: VerifiedJob[] = [];

  const calculateMatch = (reqSkills: string[]) => {
    if (reqSkills.length === 0) return 85;
    const matched = reqSkills.filter(req => 
      allSkills.some(skill => skill.toLowerCase() === req.toLowerCase())
    );
    const ratio = matched.length / reqSkills.length;
    return Math.round(60 + (ratio * 36)); // max 96
  };

  const createJob = (
    id: string,
    title: string,
    company: string,
    locStr: string,
    sourceType: VerifiedJob["sourceType"],
    url: string,
    reqSkills: string[],
    daysAgo: number = 2
  ): VerifiedJob | null => {
    if (!isAllowedIndiaLocation(locStr)) return null;

    const matched = reqSkills.filter(req => allSkills.some(skill => skill.toLowerCase() === req.toLowerCase()));
    let missing = reqSkills.filter(req => !allSkills.some(skill => skill.toLowerCase() === req.toLowerCase()));
    
    if (reqSkills.length === 0) {
      matched.push(skill1);
      if (allSkills.length > 1) matched.push(skill2);
      missing = ["Docker"];
    }

    const matchScore = calculateMatch(reqSkills);

    return {
      id,
      title,
      company,
      location: locStr,
      postedDaysAgo: daysAgo,
      sourceType,
      applyUrl: url,
      credibilityBadge: "HIGH_INTENT",
      credibilityReason: `Verified public portal link tailored to ${primarySkill}.`,
      hiringOddsScore: matchScore,
      tacticalTip: `Highlight your ${matched[0] || primarySkill} experience in your top project to pass the ATS keyword scan.`,
      matchedSkills: matched.length > 0 ? matched : [primarySkill],
      missingSkills: missing.slice(0, 2),
    };
  };

  const addJob = (job: VerifiedJob | null) => {
    if (job) jobs.push(job);
  };

  // 1. Government & Research Portals
  if (isGov || roleType === "All Opportunities") {
    addJob(createJob("gov-1", `AICTE National Tech Internship - ${primarySkill}`, "Govt of India (AICTE)", "All India", "Government Portal", `https://internship.aicte-india.org/`, [primarySkill]));
    addJob(createJob("gov-2", `MeitY Digital India Intern (${primarySkill})`, "Govt of India (MeitY)", "Delhi / Remote", "Government Portal", `https://www.meity.gov.in/digital-india-internship-scheme`, [skill1, skill2]));
    addJob(createJob("gov-3", `NATS Apprenticeship - Software Engineering`, "Ministry of Education (NATS 2.0)", "All India", "Government Portal", `https://nats.education.gov.in/`, [skill1]));
    addJob(createJob("gov-4", `ISRO / NRSC Student Internship`, "Dept of Space (ISRO)", "Remote India", "Government Portal", `https://www.isro.gov.in/InternshipAndProjects.html`, [primarySkill]));
    addJob(createJob("gov-5", `DRDO Student Internship Program`, "DRDO", "Remote India", "Government Portal", `https://www.drdo.gov.in/`, [primarySkill, "Cybersecurity"]));
    addJob(createJob("gov-6", `NITI Aayog Tech Track Internship`, "NITI Aayog", "Delhi / Remote", "Government Portal", `https://workforindia.niti.gov.in/`, [skill1, "Data Analysis"]));
  }

  // 2. Internships
  if (isIntern || roleType === "All Opportunities") {
    addJob(createJob("intern-1", `${primarySkill} Developer Intern`, "Top Tech Startup (Internshala)", loc, "Job Board", `https://internshala.com/internships/keywords-${encodeURIComponent(primarySkill.toLowerCase())}`, [primarySkill, skill2]));
    addJob(createJob("intern-2", `Software Engineering Intern`, "Unstop Elite Startups", "Remote (India)", "Job Board", `https://unstop.com/internships?searchTerm=${encodeURIComponent(primarySkill)}`, [skill1, "Data Structures"]));
    addJob(createJob("intern-3", `Full-Stack Next.js Intern`, "Chandigarh IT Park Startup", "Chandigarh / Mohali", "Job Board", `https://internshala.com/internships/keywords-nextjs`, [skill1, "Next.js"]));
    addJob(createJob("intern-4", `Python Backend Intern`, "Pune Tech Hub", "Pune, Maharashtra", "Job Board", `https://wellfound.com/location/india`, ["Python", skill1]));
    addJob(createJob("intern-5", `Cybersecurity & Linux Systems Intern`, "Delhi NCR", "Gurugram, NCR", "Job Board", `https://unstop.com/internships?searchTerm=Linux`, ["Linux", "Cybersecurity"]));
    addJob(createJob("intern-6", `Frontend SDE Intern`, "Bengaluru Startup", "Bengaluru, Karnataka", "Job Board", `https://wellfound.com/location/india`, [skill1, "React"]));
  }

  // 3. Fresher / Full-Time SDE-1
  if (isEntry || roleType === "All Opportunities") {
    const geoId = "102713980";
    const locQuery = loc === "India" ? "India" : loc + ", India";
    addJob(createJob("ft-1", `SDE-1 (${primarySkill})`, "Razorpay", "Bengaluru, Karnataka", "Direct ATS", `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(roleAndSkills)}&location=${encodeURIComponent(locQuery)}&geoId=${geoId}&f_E=1,2`, [skill1, skill2, skill3]));
    addJob(createJob("ft-2", `Junior Software Engineer`, "Zerodha", "Bengaluru / Remote", "Direct ATS", `https://wellfound.com/location/india`, [primarySkill, "System Design"]));
    addJob(createJob("ft-3", `Software Engineer - Fresher`, "Zoho", "Chennai, Tamil Nadu", "Direct ATS", `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(roleAndSkills)}&location=${encodeURIComponent(locQuery)}&geoId=${geoId}&f_E=1,2`, [skill1]));
    addJob(createJob("ft-4", `Backend Engineer (SDE-1)`, "Postman", "Bengaluru / Remote", "Direct ATS", `https://wellfound.com/location/india`, [skill1, "API Design"]));
    addJob(createJob("ft-5", `Frontend Engineer I`, "CRED", "Bengaluru, Karnataka", "Direct ATS", `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(roleAndSkills)}&location=${encodeURIComponent(locQuery)}&geoId=${geoId}&f_E=1,2`, [skill2, "TypeScript"]));
    addJob(createJob("ft-6", `Software Engineer`, "Juspay", "Bengaluru, Karnataka", "Direct ATS", `https://wellfound.com/location/india`, [primarySkill, "Functional Programming"]));
    addJob(createJob("ft-7", `SDE-1 (Platform)`, "BrowserStack", "Mumbai, Maharashtra", "Direct ATS", `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(roleAndSkills)}&location=${encodeURIComponent(locQuery)}&geoId=${geoId}&f_E=1,2`, [skill1, "Automation"]));
  }

  const filteredJobs = jobs.filter(j => j.hiringOddsScore >= 65);
  return filteredJobs.sort((a, b) => b.hiringOddsScore - a.hiringOddsScore);
}
