import { SITE } from "../data/site-config";
import SectionHeading from "./SectionHeading";
import "./Skills.css";

export default function Skills() {
  return (
    <section id="skills" className="section">
      <SectionHeading hash="skills" command="ls -1 ~/skills">
        skills
      </SectionHeading>

      <div className="skills-card">
        <ul className="skills-list">
          {SITE.skills.map((group) => (
            <li key={group.category} className="skill-group">
              <div className="skill-group-label">
                <span className="sg-arrow" aria-hidden>
                  ▸
                </span>
                <span className="sg-name">{group.category}/</span>
              </div>
              <div className="skill-items">
                {group.items.map((item) => (
                  <span key={item} className="skill-chip">
                    {item}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
