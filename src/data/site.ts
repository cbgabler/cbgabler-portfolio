/** Central visitor-facing content outside the project case studies. */

export const SITE = {
  /** Canonical site URL. Update once a custom domain is wired in. */
  url: "https://cbgabler.pages.dev",

  name: "Carson Gabler",
  shortDescription:
    "Engineer and builder working across systems, security, data, and creative tools.",
  hero: {
    eyebrow: "Carson Gabler · Corvallis, Oregon",
    heading: "I find the signal in the noise.",
    subhead:
      "I build systems across firmware, security, data, and creative tooling — currently engineering at Intel and always looking for the hidden structure in complicated things.",
  },
  ticker: [
    "engineering @ intel",
    "systems · security · data · creative tools",
    "corvallis, oregon · 44.5646° n",
  ],

  /** Used by the /cv redirect. */
  cv: {
    file: "/Carson_Gabler_Resume.pdf",
    label: "Resume (PDF)",
  },

  /** Contact + professional links. */
  contact: {
    email: "carsongabler7@gmail.com",
    github: {
      handle: "cbgabler",
      url: "https://github.com/cbgabler",
    },
    linkedin: {
      handle: "carsongabler",
      url: "https://www.linkedin.com/in/carsongabler",
    },
  },

  skills: [
    {
      tag: "FW",
      title: "Firmware & silicon",
      items: [
        "SoC firmware",
        "x86 chiplet platforms",
        "die-to-die UCIe",
        "BIOS",
        "pre/post-silicon validation",
        "Simics regression testing",
      ],
    },
    {
      tag: "HW",
      title: "Hardware security",
      items: [
        "side-channel analysis (TVLA, CPA)",
        "embedded C/C++",
        "ESP32 bring-up",
        "UART/ADC interfacing",
        "power-trace diagnostics",
      ],
    },
    {
      tag: "DATA",
      title: "Data & cloud",
      items: [
        "dbt",
        "SQL",
        "Kafka",
        "Azure Data Factory",
        "Power BI",
        "Bicep IaC",
        "CI/CD",
      ],
    },
    {
      tag: "LANG",
      title: "Languages & tools",
      items: [
        "C",
        "C++",
        "Python",
        "Go",
        "TypeScript",
        "R",
        "Bash",
        "Git",
        "Linux",
        "Docker",
      ],
    },
  ],

  /** Experience timeline. Newest / future first. */
  experience: [
    {
      role: "Firmware Engineering Intern",
      org: "Intel",
      start: "Jun 2026",
      end: "Present",
      summary:
        "SoC firmware for x86 chiplet platforms, die-to-die UCIe interconnect firmware, and automated regression testing on Simics.",
    },
    {
      role: "Data Engineering Intern",
      org: "The Linux Foundation",
      start: "Oct 2025",
      end: "Jun 2026",
      summary:
        "dbt models powering commit-tracking across 800+ open source projects, CI/CD-integrated pipelines.",
    },
    {
      role: "Cloud Engineering Intern",
      org: "Daimler Truck North America",
      start: "Mar 2025",
      end: "Sep 2025",
      summary:
        "Financial Operations Hub, 32% cloud cost reduction, Power BI dashboards.",
    },
  ] satisfies ReadonlyArray<{
    role: string;
    org: string;
    start: string;
    end: string;
    summary: string;
  }>,

  /** Education. */
  education: [
    {
      school: "Oregon State University",
      degree: "B.S. Computer Science",
      detail: "3.7 GPA",
      end: "Dec 2026",
    },
  ],

  offDuty: {
    heading: "Signals of a different kind",
    copy: "Outside of chips, I'm usually knee-deep in my own music library. I built a tool that listens to every track locally with librosa to tag BPM and mood, cross-references Spotify and Discogs to fill in the gaps, and keeps years of poorly-tagged mp3s organized. Turns out reading a waveform for a hidden AES key and reading one for tempo aren't so different.",
  },

  availability:
    "Based in Corvallis, OR · open to firmware & embedded security roles.",
} as const;

export type DistrictId =
  | "core"
  | "skills"
  | "projects"
  | "experience"
  | "off-duty"
  | "contact";

export type MapDistrict = {
  marker: string;
  id: DistrictId;
  label: string;
  shortLabel: string;
  href: string;
  description: string;
  route: string;
};

/** Conceptual city neighborhoods used by the interactive poster map. */
export const MAP_DISTRICTS: readonly MapDistrict[] = [
  {
    marker: "CENTER",
    id: "core",
    label: "Overview",
    shortLabel: "CORE",
    href: "#core",
    description: "Return to the portfolio overview",
    route: "core",
  },
  {
    marker: "PRACTICE",
    id: "skills",
    label: "Practice",
    shortLabel: "SKILLS",
    href: "#skills",
    description: "Tour firmware, silicon, security, data, and language skills",
    route: "fw",
  },
  {
    marker: "WORKS",
    id: "projects",
    label: "Selected works",
    shortLabel: "WORKS",
    href: "#projects",
    description: "Tour selected projects including GlassBox",
    route: "sec",
  },
  {
    marker: "TIMELINE",
    id: "experience",
    label: "Timeline",
    shortLabel: "WORK",
    href: "#experience",
    description: "Tour professional experience",
    route: "io",
  },
  {
    marker: "AFTER DARK",
    id: "off-duty",
    label: "After dark",
    shortLabel: "LIFE",
    href: "#off-duty",
    description: "Tour music and audio work",
    route: "dsp",
  },
  {
    marker: "CONTACT",
    id: "contact",
    label: "Contact",
    shortLabel: "HELLO",
    href: "#contact",
    description: "Open contact information",
    route: "pad",
  },
] as const;
