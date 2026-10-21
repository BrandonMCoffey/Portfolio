// src/data/cv/types.ts

export interface EducationItem {
  institution: string;
  degree: string;
  period: string;
  notes?: string;
}

export interface PublicationItem {
  id: string;
  title: string;
  venue: string;
  date: string;
  roles: string;
  projectSlug?: string;
  doi?: string;
  paperUrl?: string;
  extraUrl?: string;
  abstract?: string;
}

export interface GrantItem {
  agency: string;
  program?: string;
  amount: string;
  date: string;
  title: string;
  status: "Approved" | "Pending";
  duration?: string;
}

export interface AwardItem {
  organization: string;
  title: string;
  year: number;
  project: string;
  projectSlug?: string;
  url?: string;
  badge?: string;
}

export interface MediaRecognitionItem {
  id: string;
  title: string;
  outlet: string;
  date: string;
  articleUrl?: string;
  videoUrl?: string;
  podcastUrl?: string;
  projectSlug?: string;
}

export interface ShowcaseEventItem {
  title: string;
  project: string;
  date: string;
  location: string;
  url?: string;
}

export interface LabTourItem {
  guest: string;
  type: "Showcase and Introductions" | "Project Proposal" | "Education Showcase" | "Completion and Showcase";
  date: string;
}

export interface TeachingItem {
  role: string;
  courseOrEvent: string;
  institution: string;
  term: string;
}
