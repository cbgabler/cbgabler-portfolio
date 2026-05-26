/**
 * Central site content. Edit this file to change anything visitor-facing
 * that isn't a project case study (those live in `src/content/projects/`).
 *
 * Lines marked with TODO are placeholders you should review before the
 * site is shared with a real academic audience.
 */

export const SITE = {
  /** Canonical site URL. Update once a custom domain is wired in. */
  url: "https://cbgabler.pages.dev",

  /** Owner identity */
  name: "Carson Gabler",
  /** Used in <title> and meta description. */
  shortDescription:
    "Senior CS undergraduate at Oregon State University. Research interest: firmware and embedded-system security with ML-assisted vulnerability discovery.",
  /** One-line role descriptor shown under the hero. */
  tagline:
    "Firmware & embedded-system security · ML-assisted vulnerability discovery",
  /** A second, denser status line under the tagline. */
  status:
    "Senior, CS @ Oregon State · Data Engineering @ The Linux Foundation · Firmware @ Intel (Summer 2026)",

  /** Used by /cv page. Drop a new file into /public and update this path
   *  when you have an academic-format CV. */
  cv: {
    /** TODO: replace with an academic CV once available. The current file
     *  is an industry resume; suitable for industry but not ideal for
     *  graduate-school admissions audiences. */
    file: "/Carson_Gabler_Resume.pdf",
    label: "Résumé (PDF)",
  },

  /** Contact + professional links. Set any to null to hide. */
  contact: {
    email: "carsongabler7@gmail.com",
    emailAcademic: null as string | null, // e.g. "gablerc@oregonstate.edu"
    github: {
      handle: "cbgabler",
      url: "https://github.com/cbgabler",
    },
    linkedin: {
      handle: "carsongabler",
      url: "https://www.linkedin.com/in/carsongabler",
    },
    /** TODO: create profile at https://scholar.google.com/ and paste the
     *  citations URL here once it exists. Helps academic readers. */
    scholar: null as { url: string } | null,
    phone: "+1 503-577-0072",
    location: "Oregon, USA",
  },

  /** Short about-section copy. ~120 words for the academic audience. */
  about: [
    "I'm a senior at Oregon State University finishing a B.S. in Computer Science in December 2026 (GPA 3.7; Dean's List 2022–2026). My research interest is firmware and embedded-system security, with a focus on ML-assisted vulnerability discovery and side-channel resilience.",
    "I split my time between systems-level work (C/C++, Go, embedded toolchains, hardware bring-up) and data infrastructure (currently at The Linux Foundation). I care about systems that are obvious to read, robust to instrument, and honest about what they can and can't prove.",
    "Outside coursework, I build small platforms that join the two — see GlassBox below for the clearest example.",
  ],

  /** Experience timeline. Newest / future first. */
  experience: [
    {
      role: "Firmware Engineering Intern",
      org: "Intel Corporation",
      start: "Jun 2026",
      end: "Jan 2027",
      isCurrent: false,
      isFuture: true,
      summary: "Incoming. Firmware engineering on Intel platforms.",
    },
    {
      role: "Data Engineering Intern",
      org: "The Linux Foundation",
      start: "Oct 2025",
      end: "Present",
      isCurrent: true,
      isFuture: false,
      summary:
        "Building and maintaining data infrastructure that supports Linux Foundation programs and reporting.",
    },
    {
      role: "Cloud Engineering Intern",
      org: "Daimler Truck North America",
      start: "Mar 2025",
      end: "Sep 2025",
      isCurrent: false,
      isFuture: false,
      summary:
        "Cloud engineering work supporting internal platforms and tooling.",
    },
  ] satisfies ReadonlyArray<{
    role: string;
    org: string;
    start: string;
    end: string;
    isCurrent: boolean;
    isFuture: boolean;
    summary: string;
  }>,

  /** Education. */
  education: [
    {
      school: "Oregon State University",
      degree: "B.S., Computer Science",
      detail: "GPA 3.7 · Dean's List 2022–2026",
      start: "2022",
      end: "Dec 2026",
    },
  ],
} as const;

/** Primary nav links — these are anchored sections on the home page. */
export const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Projects", href: "/#projects" },
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Contact", href: "/#contact" },
];
