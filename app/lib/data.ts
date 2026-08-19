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

export const projects: Project[] = [
  {
    title: "Print Service BELGIUM",
    year: "2026",
    tagline: "Shop for customizable clothes",
    description:
      "Customize T-shirts, sweatshirts, polo shirts, caps, and accessories with Print Service: online configurator, high-quality textile printing, and delivery in Belgium.",
    tags: ["Next.js", "TypeScript", ".NET"],
    caseStudy: "/work/print-service",
    liveSite: "https://beta.print-service.be/",
    image: "/images/print.webp",
    imageAlt: "Print Service BELGIUM preview",
  },
  {
    title: "IAstroMatch",
    year: "2025",
    tagline: "Webcup Finalist 2025",
    description:
      "Intergalactic dating experience — swipe, match, and deploy under hackathon pressure.",
    tags: ["React", "TypeScript", "Next.js"],
    caseStudy: "/work/iastromatch",
    liveSite: "https://iastromatch.vercel.app",
    image: "/images/iastromatch.webp",
    imageAlt: "IAstroMatch preview",
  },
  {
    title: "Mystic Arcane",
    year: "2024",
    tagline: "Webcup MG Winner 2024",
    description:
      "Award-winning e-commerce for magical tools — catalog, cart, and checkout that feel enchanted, not templated.",
    tags: ["React", "TypeScript", "Next.js"],
    caseStudy: "/work/mystic-arcane",
    liveSite: "https://codeipsum-madagascar-webcup.vercel.app/",
    image: "/images/mystic-arcane.webp",
    imageAlt: "Mystic Arcane preview",
  },
  {
    title: "RiddleRumble",
    year: "2024",
    tagline: "Guess the place from a given enigma",
    description:
      "Geography riddle game — clues, guesses, and instant feedback in a tight loop.",
    tags: ["React", "TypeScript", "Next.js"],
    caseStudy: "/work/riddlerumble",
    liveSite: "https://riddlerumble.vercel.app/",
    image: "/images/riddlerumble.webp",
    imageAlt: "RiddleRumble preview",
  },
];

export type ArchiveItem = {
  title: string;
  year: string;
  tagline: string;
  stack: string;
  caseStudy: string;
  liveSite: string;
  image: string;
};

export const archive: ArchiveItem[] = [
  {
    title: "Tia zaza",
    year: "2023",
    tagline: "Mini game for kids",
    stack: "React · TypeScript",
    caseStudy: "/work/tia-zaza",
    liveSite: "https://wcc-s2-thony.netlify.app/",
    image: "/images/tiazaza.webp",
  },
  {
    title: "Portfolio",
    year: "2024",
    tagline: "Friend Portfolio",
    stack: "React · TypeScript",
    caseStudy: "/work/portfolio-muriel",
    liveSite: "https://murielari.netlify.app/",
    image: "/images/wccs3.webp",
  },
  {
    title: "Fode",
    year: "2024",
    tagline: "Italian Food",
    stack: "React · TypeScript",
    caseStudy: "/work/fode",
    liveSite: "https://wcc-s4-raya.netlify.app/",
    image: "/images/fode.webp",
  },
  {
    title: "react-pop-cards",
    year: "2024",
    tagline: "npm package try",
    stack: "React · TypeScript",
    caseStudy: "/work/react-pop-cards",
    liveSite: "https://react-pop-cards.vercel.app/",
    image: "/images/popcards.webp",
  },
];
