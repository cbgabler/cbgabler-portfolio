import { SITE } from "../data/site-config";
import SectionHeading from "./SectionHeading";
import "./About.css";

export default function About() {
  return (
    <section id="about" className="section">
      <SectionHeading hash="about" command="cat about.md">
        about
      </SectionHeading>

      <div className="about-card">
        <div className="about-header">
          <span className="about-hash" aria-hidden>
            #
          </span>
          <span>About</span>
        </div>
        <div className="about-body">
          {SITE.about.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {SITE.location && (
          <div className="about-footer">
            <span className="about-key">location</span>
            <span className="about-sep">·</span>
            <span className="about-value">{SITE.location}</span>
          </div>
        )}
      </div>
    </section>
  );
}
