import { SITE } from "../data/site-config";
import SectionHeading from "./SectionHeading";
import "./Contact.css";

type Row = {
  key: string;
  label: string;
  value: string;
  href?: string;
};

export default function Contact() {
  const rows: Row[] = [];

  if (SITE.social.email) {
    rows.push({
      key: "email",
      label: "email",
      value: SITE.social.email,
      href: `mailto:${SITE.social.email}`,
    });
  }
  if (SITE.social.github) {
    rows.push({
      key: "github",
      label: "github",
      value: `@${SITE.social.github}`,
      href: SITE.social.githubUrl ?? `https://github.com/${SITE.social.github}`,
    });
  }
  if (SITE.social.linkedin) {
    rows.push({
      key: "linkedin",
      label: "linkedin",
      value: `/in/${SITE.social.linkedin}`,
      href:
        SITE.social.linkedinUrl ??
        `https://www.linkedin.com/in/${SITE.social.linkedin}`,
    });
  }
  if (SITE.social.twitter) {
    rows.push({
      key: "twitter",
      label: "twitter",
      value: `@${SITE.social.twitter}`,
      href:
        SITE.social.twitterUrl ?? `https://twitter.com/${SITE.social.twitter}`,
    });
  }
  if (SITE.social.bluesky) {
    rows.push({
      key: "bluesky",
      label: "bluesky",
      value: `@${SITE.social.bluesky}`,
      href:
        SITE.social.blueskyUrl ?? `https://bsky.app/profile/${SITE.social.bluesky}`,
    });
  }
  if (SITE.location) {
    rows.push({
      key: "location",
      label: "location",
      value: SITE.location,
    });
  }

  return (
    <section id="contact" className="section">
      <SectionHeading hash="contact" command="cat contact.txt">
        contact
      </SectionHeading>

      <div className="contact-card">
        <div className="contact-header">
          <span className="contact-hash" aria-hidden>
            #
          </span>
          <span>contact.txt</span>
        </div>
        <dl className="contact-list">
          {rows.map((r) => (
            <div key={r.key} className="contact-row">
              <dt>{r.label}</dt>
              <dd>
                {r.href ? (
                  <a
                    href={r.href}
                    target={r.href.startsWith("http") ? "_blank" : undefined}
                    rel={r.href.startsWith("http") ? "noreferrer" : undefined}
                  >
                    {r.value}
                  </a>
                ) : (
                  <span>{r.value}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <p className="contact-footer">
          <span className="contact-prompt">$</span>{" "}
          The fastest way to reach me is{" "}
          <a href={`mailto:${SITE.social.email}`}>email</a>.
        </p>
      </div>
    </section>
  );
}
