import { BucketScore } from "@/lib/schemas/audit.schema";

const AI_BUZZWORDS = [
  "spearheaded", "delved", "synergy", "synergies", "orchestrated",
  "cutting-edge", "seamlessly", "tapestry", "fostered", "pivotal role",
  "leveraged", "transformative", "game-changer", "testament", "beacon",
  "dynamic", "innovative", "go-getter"
];

function checkBucket1(text: string): BucketScore {
  let score = 100;
  const passed = [];
  const failed = [];
  const hasExp = /(experience|employment)/i.test(text);
  const hasEdu = /(education|academic)/i.test(text);
  const hasSkills = /(skills|technologies)/i.test(text);
  const hasProj = /(projects)/i.test(text);
  const pipeCount = (text.match(/\|/g) || []).length;
  const hasColumnRisk = pipeCount > 8;

  if (hasExp && hasEdu && hasSkills) passed.push("Standard headings found");
  else {
    score -= 30;
    failed.push("Missing standard headings (Experience/Education/Skills)");
  }
  
  if (hasColumnRisk) {
    score -= 40;
    failed.push("High risk of multi-column layout or tables");
  } else {
    passed.push("Single-column safe layout");
  }

  const hasDates = /\b(19|20)\d{2}\b/.test(text);
  if (!hasDates) {
    score -= 20;
    failed.push("No standard date formats detected");
  } else {
    passed.push("Standard date format detected");
  }

  score = Math.max(0, score);
  
  return {
    id: "b1", name: "ATS Parseability", weight: 15, score, weightedPoints: (score * 15) / 100,
    passedChecks: passed, failedChecks: failed,
    priority: (15 * (score < 50 ? 3 : score < 80 ? 2 : 0.5) * (100 - score)) / 100,
    severity: score < 50 ? "Critical" : score < 80 ? "High" : "Low",
    feedback: {
      whatsWrong: failed.length > 0 ? failed[0] : "Your resume format is mostly ATS-safe.",
      whyItHurts: "ATS bots cannot read multi-column layouts or unusual date formats, leading to instant auto-rejection.",
      howToFix: "Use a simple single-column word document format and standard Month YYYY dates.",
      beforeRewrite: "A complicated 2-column layout with tables",
      afterRewrite: "A top-to-bottom single-column list of text"
    }
  };
}

function checkBucket2(text: string): BucketScore {
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  let score = 100;
  const passed = [];
  const failed = [];

  if (wordCount < 300) { score -= 30; failed.push("Resume is too short (<300 words)"); }
  else if (wordCount > 800) { score -= 20; failed.push("Resume is too long (>800 words)"); }
  else { passed.push("Optimal length (300-800 words)"); }

  const longLines = text.split('\n').filter(l => l.length > 150).length;
  if (longLines > 3) {
    score -= 30;
    failed.push("Found walls of text (bullets > 2 lines)");
  } else {
    passed.push("Bullets are concise");
  }

  score = Math.max(0, score);
  
  return {
    id: "b2", name: "Format & Structure", weight: 10, score, weightedPoints: (score * 10) / 100,
    passedChecks: passed, failedChecks: failed,
    priority: (10 * (score < 50 ? 3 : score < 80 ? 2 : 0.5) * (100 - score)) / 100,
    severity: score < 50 ? "Critical" : score < 80 ? "High" : "Low",
    feedback: {
      whatsWrong: failed.length > 0 ? failed[0] : "Good overall structure and length.",
      whyItHurts: "Recruiters skim resumes in 6 seconds. Walls of text are ignored entirely.",
      howToFix: "Keep bullets to 1-2 lines maximum and stick to a 1-page length.",
      beforeRewrite: "A massive 4-line paragraph explaining everything you did.",
      afterRewrite: "A punchy 1-line bullet focused on the result."
    }
  };
}

function checkBucket3(text: string): BucketScore {
  let score = 100;
  const passed = [];
  const failed = [];
  
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(text);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasLinkedin = /linkedin/i.test(text);
  const hasGithub = /(github|gitlab|portfolio)/i.test(text);

  if (hasEmail) passed.push("Professional Email"); else { score -= 40; failed.push("Missing Email"); }
  if (hasPhone) passed.push("Phone Number"); else { score -= 40; failed.push("Missing Phone Number"); }
  if (hasLinkedin) passed.push("LinkedIn URL"); else { score -= 10; failed.push("Missing LinkedIn"); }
  if (hasGithub) passed.push("Portfolio/GitHub URL"); else { score -= 10; failed.push("Missing GitHub/Portfolio"); }

  score = Math.max(0, score);
  
  return {
    id: "b3", name: "Contact & Links", weight: 5, score, weightedPoints: (score * 5) / 100,
    passedChecks: passed, failedChecks: failed,
    priority: (5 * (score < 50 ? 3 : score < 80 ? 2 : 0.5) * (100 - score)) / 100,
    severity: score < 50 ? "Critical" : score < 80 ? "High" : "Low",
    feedback: {
      whatsWrong: failed.length > 0 ? failed[0] : "All contact info is present.",
      whyItHurts: "If they can't contact you or verify your work, they will move to the next candidate.",
      howToFix: "Add a clear contact header with Email, Phone, LinkedIn, and GitHub.",
      beforeRewrite: "Just your name and city",
      afterRewrite: "Name | Email | Phone | LinkedIn | GitHub"
    }
  };
}

function checkBucket4(text: string): BucketScore {
  let score = 100;
  const passed = [];
  const failed = [];
  
  const hasSummary = /(summary|objective|profile)/i.test(text);
  if (!hasSummary) {
    score -= 50;
    failed.push("No Summary section found");
  } else {
    passed.push("Summary section exists");
    if (/hardworking|motivated|enthusiastic/i.test(text)) {
      score -= 30;
      failed.push("Summary uses generic fluff words");
    } else {
      passed.push("No generic fluff in summary");
    }
  }

  score = Math.max(0, score);
  return {
    id: "b4", name: "Summary / Objective", weight: 5, score, weightedPoints: (score * 5) / 100,
    passedChecks: passed, failedChecks: failed,
    priority: (5 * (score < 50 ? 3 : score < 80 ? 2 : 0.5) * (100 - score)) / 100,
    severity: score < 50 ? "Critical" : score < 80 ? "High" : "Low",
    feedback: {
      whatsWrong: failed.length > 0 ? failed[0] : "Summary is concise and impactful.",
      whyItHurts: "Recruiters skip summaries that read like a generic objective statement.",
      howToFix: "Use the formula: [Role] + [Years/Level] + [Core Stack] + [Quantified Achievement].",
      beforeRewrite: "Hardworking software engineer looking for opportunities to grow.",
      afterRewrite: "Full-Stack Engineer with 3 years of experience in React and Node.js, delivering high-scale web apps."
    }
  };
}

function checkBucket5(text: string): BucketScore {
  let score = 100;
  const passed = [];
  const failed = [];
  
  const passiveVerbs = (text.match(/\b(responsible for|worked on|helped with|assisted)\b/gi) || []).length;
  if (passiveVerbs > 0) {
    score -= Math.min(50, passiveVerbs * 15);
    failed.push(`Found ${passiveVerbs} passive verbs (e.g. "Responsible for")`);
  } else {
    passed.push("No passive verbs detected");
  }

  const strongVerbs = (text.match(/\b(architected|engineered|spearheaded|developed|optimized|implemented|reduced|increased)\b/gi) || []).length;
  if (strongVerbs < 3) {
    score -= 30;
    failed.push("Too few strong action verbs");
  } else {
    passed.push("Good use of strong action verbs");
  }

  score = Math.max(0, score);
  return {
    id: "b5", name: "Work Experience", weight: 20, score, weightedPoints: (score * 20) / 100,
    passedChecks: passed, failedChecks: failed,
    priority: (20 * (score < 50 ? 3 : score < 80 ? 2 : 0.5) * (100 - score)) / 100,
    severity: score < 50 ? "Critical" : score < 80 ? "High" : "Low",
    feedback: {
      whatsWrong: failed.length > 0 ? failed[0] : "Experience bullets use strong verbs.",
      whyItHurts: "Passive phrases like 'Responsible for' tell the recruiter your duties, not your achievements.",
      howToFix: "Start every bullet with a strong action verb (Developed, Optimized, Led).",
      beforeRewrite: "Responsible for building the frontend in React.",
      afterRewrite: "Engineered a high-performance React frontend, reducing load times by 40%."
    }
  };
}

function checkBucket6(text: string): BucketScore {
  let score = 100;
  const passed = [];
  const failed = [];
  
  if (/(rating|expert|beginner|proficient|90%)/i.test(text)) {
    score -= 40;
    failed.push("Fake rating bars or self-assessments found");
  } else {
    passed.push("No self-assessed skill ratings");
  }
  
  const techSkills = (text.match(/\b(javascript|python|react|java|c\+\+|aws|docker|sql|node|typescript)\b/gi) || []).length;
  if (techSkills < 5) {
    score -= 40;
    failed.push("Low keyword density for hard skills");
  } else {
    passed.push("Good keyword density");
  }

  score = Math.max(0, score);
  return {
    id: "b6", name: "Skills & Keywords", weight: 15, score, weightedPoints: (score * 15) / 100,
    passedChecks: passed, failedChecks: failed,
    priority: (15 * (score < 50 ? 3 : score < 80 ? 2 : 0.5) * (100 - score)) / 100,
    severity: score < 50 ? "Critical" : score < 80 ? "High" : "Low",
    feedback: {
      whatsWrong: failed.length > 0 ? failed[0] : "Skills are listed clearly.",
      whyItHurts: "Self-ratings like 'Expert' are meaningless to recruiters and waste space.",
      howToFix: "List your skills in clean groups (Languages, Frameworks, Tools) without ratings.",
      beforeRewrite: "Python (Expert), React (Intermediate)",
      afterRewrite: "Languages: Python, JavaScript | Frameworks: React, Node.js"
    }
  };
}

function checkBucket7(text: string): BucketScore {
  let score = 100;
  const passed = [];
  const failed = [];
  
  const hasDegree = /(bachelor|master|bs|ms|b\.s|b\.a|btech|mtech|phd|degree)/i.test(text);
  if (!hasDegree) {
    score -= 30;
    failed.push("No Degree found");
  } else {
    passed.push("Degree mentioned");
  }

  const hasUni = /(university|college|institute)/i.test(text);
  if (!hasUni) {
    score -= 30;
    failed.push("No University/Institution found");
  } else {
    passed.push("Institution mentioned");
  }

  score = Math.max(0, score);
  return {
    id: "b7", name: "Education & Certifications", weight: 5, score, weightedPoints: (score * 5) / 100,
    passedChecks: passed, failedChecks: failed,
    priority: (5 * (score < 50 ? 3 : score < 80 ? 2 : 0.5) * (100 - score)) / 100,
    severity: score < 50 ? "Critical" : score < 80 ? "High" : "Low",
    feedback: {
      whatsWrong: failed.length > 0 ? failed[0] : "Education is formatted correctly.",
      whyItHurts: "Missing education details can auto-fail basic ATS degree requirements.",
      howToFix: "Ensure you list your Degree, Institution, and Graduation Date clearly.",
      beforeRewrite: "Computer Science, 2024",
      afterRewrite: "Bachelor of Science in Computer Science, XYZ University, May 2024"
    }
  };
}

function checkBucket8(text: string): BucketScore {
  let score = 100;
  const passed = [];
  const failed = [];
  
  const projectRegex = /(project|portfolio)/i;
  if (!projectRegex.test(text)) {
    score -= 80;
    failed.push("No Projects section found");
  } else {
    passed.push("Projects section exists");
    const links = (text.match(/(github\.com|live demo|vercel\.app|netlify)/gi) || []).length;
    if (links === 0) {
      score -= 40;
      failed.push("No live links or GitHub repos in projects");
    } else {
      passed.push("Project links found");
    }
  }

  score = Math.max(0, score);
  return {
    id: "b8", name: "Projects / Portfolio", weight: 5, score, weightedPoints: (score * 5) / 100,
    passedChecks: passed, failedChecks: failed,
    priority: (5 * (score < 50 ? 3 : score < 80 ? 2 : 0.5) * (100 - score)) / 100,
    severity: score < 50 ? "Critical" : score < 80 ? "High" : "Low",
    feedback: {
      whatsWrong: failed.length > 0 ? failed[0] : "Projects section is solid.",
      whyItHurts: "Saying you built something without a link to the code or a demo provides zero proof.",
      howToFix: "Add a GitHub repo link or live demo URL to every project.",
      beforeRewrite: "E-Commerce App (React, Node)",
      afterRewrite: "E-Commerce App | GitHub: link.com | Live: link.app"
    }
  };
}

function checkBucket9(text: string): BucketScore {
  let score = 100;
  const passed = [];
  const failed = [];
  
  const numbers = (text.match(/\d+%|\b\d+[kKmM]?\b|\$\d+/g) || []).length;
  if (numbers < 5) {
    score -= 60;
    failed.push("Very few numbers or metrics detected");
  } else if (numbers < 10) {
    score -= 30;
    failed.push("Moderate use of metrics, aim for more");
  } else {
    passed.push("High density of metrics and numbers");
  }

  score = Math.max(0, score);
  return {
    id: "b9", name: "Impact & Metrics", weight: 10, score, weightedPoints: (score * 10) / 100,
    passedChecks: passed, failedChecks: failed,
    priority: (10 * (score < 50 ? 3 : score < 80 ? 2 : 0.5) * (100 - score)) / 100,
    severity: score < 50 ? "Critical" : score < 80 ? "High" : "Low",
    feedback: {
      whatsWrong: failed.length > 0 ? failed[0] : "Great use of numbers and impact metrics.",
      whyItHurts: "Without numbers, your bullets are just unproven claims.",
      howToFix: "Quantify your impact. Add %, $, user counts, or latency reductions.",
      beforeRewrite: "Improved application performance.",
      afterRewrite: "Decreased API latency by 45% (200ms to 110ms) by implementing Redis caching."
    }
  };
}

function checkBucket10(text: string): BucketScore {
  let score = 100;
  const passed = [];
  const failed = [];
  
  const pronouns = (text.match(/\b(I|me|my|we)\b/gi) || []).length;
  if (pronouns > 0) {
    score -= Math.min(50, pronouns * 10);
    failed.push(`Found ${pronouns} first-person pronouns (I, me, my)`);
  } else {
    passed.push("No first-person pronouns");
  }

  let buzzwords = 0;
  AI_BUZZWORDS.forEach(word => {
    if (new RegExp(`\\b${word}\\b`, 'i').test(text)) buzzwords++;
  });
  
  if (buzzwords > 3) {
    score -= 40;
    failed.push("High density of generic buzzwords (e.g. synergy, spearheaded)");
  } else {
    passed.push("Professional, direct language used");
  }

  score = Math.max(0, score);
  return {
    id: "b10", name: "Readability & Grammar", weight: 10, score, weightedPoints: (score * 10) / 100,
    passedChecks: passed, failedChecks: failed,
    priority: (10 * (score < 50 ? 3 : score < 80 ? 2 : 0.5) * (100 - score)) / 100,
    severity: score < 50 ? "Critical" : score < 80 ? "High" : "Low",
    feedback: {
      whatsWrong: failed.length > 0 ? failed[0] : "Resume reads professionally.",
      whyItHurts: "First-person pronouns and fluff words make the resume sound unprofessional and AI-generated.",
      howToFix: "Remove all instances of 'I', 'me', and 'my'. Cut generic adjectives.",
      beforeRewrite: "I spearheaded the development of a synergistic platform.",
      afterRewrite: "Engineered a cross-functional data pipeline."
    }
  };
}

export function generateDeterministicBuckets(text: string): BucketScore[] {
  return [
    checkBucket1(text),
    checkBucket2(text),
    checkBucket3(text),
    checkBucket4(text),
    checkBucket5(text),
    checkBucket6(text),
    checkBucket7(text),
    checkBucket8(text),
    checkBucket9(text),
    checkBucket10(text),
  ];
}

export function calculateExperienceTier(text: string): string {
  const cleanText = text.replace(/\r\n/g, '\n');
  const studentSignals = /(B\.Tech|B\.E\.|Undergraduate|Pursuing|Student|Fresher|Semester|Expected 202|Class of)/i;
  
  // Extract Experience Section
  const expMatch = cleanText.match(/(?:work\s+experience|experience|employment\s+history|professional\s+experience)([\s\S]*?)(?=\n(?:education|projects|skills|certifications|awards|academic)\b|$)/i);
  
  if (!expMatch || !expMatch[1]) {
    return "Student / Fresher (0 yrs)";
  }

  const expSection = expMatch[1];
  
  // Check if they only have internship listed in experience
  const hasOnlyInternships = !/(full[- ]time|engineer|developer|manager|consultant|specialist)/i.test(expSection) && /(intern|internship)/i.test(expSection);

  // Extract years from dates like 2020 - 2023, 2022-Present, Jan 2021 to Mar 2022
  const dateRegex = /\b(20\d{2})\b/g;
  let matches;
  const years = [];
  while ((matches = dateRegex.exec(expSection)) !== null) {
    years.push(parseInt(matches[1], 10));
  }
  
  let durationYears = 0;
  if (years.length >= 2) {
    const minYear = Math.min(...years);
    const maxYear = /present|now|current/i.test(expSection) ? new Date().getFullYear() : Math.max(...years);
    durationYears = Math.max(0, maxYear - minYear);
  } else if (years.length === 1 && /present|now|current/i.test(expSection)) {
    durationYears = Math.max(0, new Date().getFullYear() - years[0]);
  }

  const hasStudentSignal = studentSignals.test(cleanText);

  if (durationYears === 0) {
    return "Student / Fresher (0 yrs)";
  } else if (hasOnlyInternships || durationYears < 1) {
    return "Intern / Early Career (< 1 yr)";
  } else if (durationYears <= 2) {
    if (hasStudentSignal && durationYears <= 1) return "Intern / Early Career (< 1 yr)";
    return "Junior (1-2 yrs)";
  } else if (durationYears <= 5) {
    return "Mid-Level (3-5 yrs)";
  } else {
    return "Senior (5+ yrs)";
  }
}

export function calculateAiRisk(text: string): { baseAiRisk: number, clichesFound: string[] } {
  let risk = 0;
  const clichesFound: string[] = [];

  // Signal A: ChatGPT Cliché Phrases
  const signalAPhrases = [
    "passionate", "aspiring", "results-driven", "detail-oriented", "eager to", 
    "leverage", "leveraging", "honing", "fostering", "cutting-edge", "dynamic", 
    "spearheaded", "delved", "adept at", "proven track record", "fast-paced", 
    "seamless", "seamlessly", "meticulous", "orchestrated", "synergy", "utilizing", 
    "cultivated", "demonstrated ability", "strong foundation", "enthusiastic", 
    "committed to", "seeking to", "hands-on experience", "problem-solving skills", 
    "collaborative environment", "continuously learning", "driven individual", "impactful"
  ];

  signalAPhrases.forEach(phrase => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      risk += matches.length * 10;
      if (!clichesFound.includes(phrase)) clichesFound.push(phrase);
    }
  });

  // Signal B: AI Sentence Tails
  const signalBTails = [
    ", ensuring", ", resulting in", ", fostering", ", enabling", ", showcasing", 
    ", demonstrating", " aimed at ", " with a focus on "
  ];

  signalBTails.forEach(tail => {
    const regex = new RegExp(tail, 'gi');
    const matches = text.match(regex);
    if (matches) {
      risk += matches.length * 10;
      if (!clichesFound.includes(tail.trim())) clichesFound.push(tail.trim().replace(/,/g, ''));
    }
  });

  // Signal C: High Adjective Density
  const adjectives = ["skilled", "proficient", "experienced", "dedicated", "innovative"];
  let adjCount = 0;
  adjectives.forEach(adj => {
    const regex = new RegExp(`\\b${adj}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) adjCount += matches.length;
  });

  const metrics = (text.match(/\d+%|\b\d+[kKmM]?\b|\$\d+/g) || []).length;
  
  if (adjCount >= 3 && metrics <= 1) {
    risk += 25;
    clichesFound.push("High Adjective Density (0 Metrics)");
  }

  return { 
    baseAiRisk: Math.min(100, risk),
    clichesFound 
  };
}

