import { createContext, useContext, type ReactNode } from "react";
import {
  useProjects,
  type UseProjectsOptions,
  type UseProjectsResult,
} from "../hooks/useProjects";

const ProjectsContext = createContext<UseProjectsResult | null>(null);

type ProviderProps = UseProjectsOptions & { children: ReactNode };

export function ProjectsProvider({ children, ...options }: ProviderProps) {
  const value = useProjects(options);
  return (
    <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
  );
}

/**
 * Read the shared projects state. Throws if used outside ProjectsProvider so
 * we fail loud during development.
 */
export function useProjectsContext(): UseProjectsResult {
  const ctx = useContext(ProjectsContext);
  if (!ctx) {
    throw new Error(
      "useProjectsContext must be used inside <ProjectsProvider>"
    );
  }
  return ctx;
}
