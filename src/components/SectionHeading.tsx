import type { ReactNode } from "react";

type Props = {
  /** The id-fragment for the section anchor (e.g. "about"). */
  hash: string;
  /** Command shown after the `$` prompt (e.g. "cat about.md"). */
  command: string;
  /** Plain-text section label, used for screen readers only. */
  children: ReactNode;
};

export default function SectionHeading({ hash, command, children }: Props) {
  return (
    <h2 className="section-heading" id={`${hash}-heading`}>
      <a href={`#${hash}`} className="section-anchor" aria-hidden tabIndex={-1}>
        #
      </a>
      <span className="section-prompt">$</span>{" "}
      <span className="section-cmd">{command}</span>
      <span className="sr-only"> — {children}</span>
    </h2>
  );
}
