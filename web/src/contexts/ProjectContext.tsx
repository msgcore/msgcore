import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProjects } from '../hooks/useProjects';

interface ProjectContextData {
  selectedProjectId: string | null;
  setSelectedProjectId: (projectId: string) => void;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextData | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { data: projects, isLoading } = useProjects();

  // Auto-select first project if none selected
  useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  return (
    <ProjectContext.Provider
      value={{
        selectedProjectId,
        setSelectedProjectId,
        loading: isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
}