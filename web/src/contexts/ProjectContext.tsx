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

  // Validate saved project exists when projects load
  useEffect(() => {
    if (!projects || projects.length === 0) return;

    // Only validate on initial load when we have a saved project
    // This avoids re-validating every time selectedProjectId changes
    setSelectedProjectIdState(prevId => {
      const savedProjectExists = prevId && projects.some(p => p.id === prevId);

      if (!savedProjectExists) {
        // Saved project doesn't exist or no saved project, select first
        const firstProjectId = projects[0].id;
        // Also update localStorage with the new selection
        try {
          localStorage.setItem(STORAGE_KEY, firstProjectId);
        } catch (error) {
          console.error('Failed to save selected project to localStorage:', error);
        }
        return firstProjectId;
      }

      return prevId; // Keep the current selection
    });
  }, [projects]); // Now we can safely only depend on projects

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