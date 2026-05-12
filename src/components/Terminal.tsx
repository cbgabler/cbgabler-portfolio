import type { ReactNode } from "react";
import "./Terminal.css";

type Props = {
  /** Shown in the title bar after `carson@portfolio: ` — e.g. `~/projects/foo`. */
  path: string;
  /** Anything you want in the status bar (left side). */
  status?: ReactNode;
  /** Click handler for the ↻ button. Omit to hide the button. */
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Command shown after the `$` prompt at the top of the body. */
  command?: string;
  /** Show the blinking block cursor after the command. Defaults to true. */
  showCursor?: boolean;
  /** Optional title-bar overrides (e.g. set the user@host part). */
  user?: string;
  host?: string;
  children: ReactNode;
};

export default function Terminal({
  path,
  status,
  onRefresh,
  refreshing = false,
  command,
  showCursor = true,
  user = "carson",
  host = "portfolio",
  children,
}: Props) {
  return (
    <div className="terminal" role="region" aria-label={`${path} terminal`}>
      <div className="terminal-titlebar">
        <span className="tl-dots" aria-hidden>
          <span className="tl-dot tl-red" />
          <span className="tl-dot tl-yellow" />
          <span className="tl-dot tl-green" />
        </span>
        <div className="tl-title">
          <span className="tl-user">
            {user}@{host}:
          </span>{" "}
          <span className="tl-path">{path}</span>
        </div>
        <span className="tl-spacer" aria-hidden />
      </div>

      {(status || onRefresh) && (
        <div className="terminal-statusbar">
          <div className="status-content">{status}</div>
          {onRefresh && (
            <button
              type="button"
              className={`status-refresh ${refreshing ? "is-spinning" : ""}`}
              onClick={onRefresh}
              aria-label="Refresh"
              title="Refresh"
            >
              ↻
            </button>
          )}
        </div>
      )}

      <div className="terminal-body">
        {command && (
          <div className="prompt-line">
            <span className="prompt-sigil">$</span>{" "}
            <span className="prompt-cmd">{command}</span>
            {showCursor && (
              <span className="prompt-cursor" aria-hidden />
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
