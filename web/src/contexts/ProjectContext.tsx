import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProjects } from '../hooks/useProjects';

interface ProjectContextData {
  selectedProjectId: string | null;
  setSelectedProjectId: (projectId: string) => void;
  clearSelectedProject: () => void;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextData | undefined>(undefined);
const STORAGE_KEY = 'msgcore:selectedProject';

export function ProjectProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const { data: projects, isLoading } = useProjects();

  // Wrapper function that also saves to localStorage
  const setSelectedProjectId = (projectId: string) => {
    setSelectedProjectIdState(projectId);
    try {
      localStorage.setItem(STORAGE_KEY, projectId);
    } catch (error) {
      console.error('Failed to save selected project to localStorage:', error);
    }
  };

  // Clear selected project (useful for logout)
  const clearSelectedProject = () => {
    setSelectedProjectIdState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear selected project from localStorage:', error);
    }
  };

  // Validate and restore saved project or auto-select first project
  useEffect(() => {
    if (!projects || projects.length === 0) return;

    // Check if we have a saved project and if it still exists
    const currentProjectId = selectedProjectId;
    const savedProjectExists = currentProjectId &&
      projects.some(p => p.id === currentProjectId);

    if (!savedProjectExists) {
      // Saved project doesn't exist anymore or no saved project, select first
      setSelectedProjectId(projects[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]); // Only re-run when projects change

  return (
    <ProjectContext.Provider
      value={{
        selectedProjectId,
        setSelectedProjectId,
        clearSelectedProject,
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