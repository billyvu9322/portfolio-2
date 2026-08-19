import data from "../content/profile.json";

export type NavLink = { id: string; label: string };

export type HeadlineWord = {
  text: string;
  type: "solid" | "stroke" | "stroke-accent";
};

export type CtaLink = { label: string; href: string };

export type Project = {
  title: string;
  year: string;
  tagline: string;
  description: string;
  tags: string[];
  caseStudy: string;
  liveSite: string;
  image: string;
  imageAlt: string;
};

export type ArchiveItem = {
  title: string;
  year: string;
  tagline: string;
  stack: string;
  caseStudy: string;
  liveSite: string;
  image: string;
};

export type Skill = { title: string; description: string };

export type SocialLink = {
  label: string;
  href: string;
  icon: "github" | "linkedin";
};

export type Profile = {
  meta: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    author: string;
    twitterCreator: string;
    keywords: string[];
    ogImage: string;
  };
  nav: NavLink[];
  hero: {
    location: string;
    name: string;
    role: string;
    headline: HeadlineWord[];
    description: string;
    primaryCta: CtaLink;
    secondaryCta: CtaLink;
    links: CtaLink[];
  };
  works: {
    heading: string;
    subheading: string;
    intro: string;
    galleryHint: string;
    projects: Project[];
    archiveHeading: string;
    archiveIntro: string;
    archive: ArchiveItem[];
    cta: {
      label: string;
      href: string;
      note: string;
      archiveLink: CtaLink;
    };
  };
  about: {
    heading: string;
    subheading: string;
    bio: string;
    proofLabel: string;
    proof: string;
    skills: Skill[];
  };
  contact: {
    eyebrow: string;
    heading: string;
    email: string;
    socials: SocialLink[];
    copyright: string;
  };
};

export const profile = data as Profile;

// convenience named exports
export const { nav, hero, works, about, contact, meta } = profile;
export const projects = works.projects;
export const archive = works.archive;
