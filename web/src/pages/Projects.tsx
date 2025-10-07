import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Folder,
  Settings,
  Trash2,
  Edit,
  Loader2,
  Calendar,
  Users,
  Key,
  Check,
  X,
  Copy,
  CheckCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { formatDateTime } from '../lib/utils';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { useProjectContext } from '../contexts/ProjectContext';
import { useConfirm } from '../hooks/useConfirm';

export function Projects() {
  const { t } = useTranslation('projects');
  const { t: tCommon } = useTranslation('common');
  const { selectedProjectId, setSelectedProjectId } = useProjectContext();
  const { data: projects = [], isLoading, error } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { confirm, ConfirmDialog } = useConfirm();
  const [searchParams] = useSearchParams();

  const [showCreateForm, setShowCreateForm] = useState(false);

  // Auto-open create form if ?create=true or if there are no projects
  useEffect(() => {
    if (searchParams.get('create') === 'true' || (projects.length === 0 && !isLoading)) {
      setShowCreateForm(true);
    }
  }, [searchParams, projects.length, isLoading]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const [newProjectData, setNewProjectData] = useState({
    name: '',
    description: ''
  });

  const [editProjectData, setEditProjectData] = useState({
    name: '',
    description: ''
  });

  const [copiedProjectId, setCopiedProjectId] = useState<string | null>(null);

  const handleCopyProjectId = async (projectId: string) => {
    try {
      await navigator.clipboard.writeText(projectId);
      setCopiedProjectId(projectId);
      setTimeout(() => setCopiedProjectId(null), 2000);
    } catch (error) {
      console.error('Failed to copy project ID:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectData.name.trim()) return;

    try {
      const result = await createProject.mutateAsync({
        name: newProjectData.name,
        description: newProjectData.description
      });

      // Auto-select the new project
      if (result?.id) {
        setSelectedProjectId(result.id);
      }

      setNewProjectData({ name: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleUpdateProject = async (projectId: string) => {
    if (!editProjectData.name.trim()) return;

    try {
      await updateProject.mutateAsync({
        projectId,
        name: editProjectData.name,
        description: editProjectData.description
      });

      setEditingProjectId(null);
      setEditProjectData({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    const confirmed = await confirm({
      title: t('deleteDialog.title'),
      message: t('deleteDialog.message', { projectName }),
      confirmText: t('deleteDialog.confirmText'),
      cancelText: t('deleteDialog.cancelText'),
      variant: 'danger',
      confirmButtonVariant: 'danger',
    });

    if (!confirmed) return;

    setDeletingProjectId(projectId);
    try {
      await deleteProject.mutateAsync(projectId);

      // If deleted project was selected, handle selection
      if (selectedProjectId === projectId) {
        const remainingProjects = projects.filter(p => p.id !== projectId);
        if (remainingProjects.length > 0) {
          // Select the first remaining project
          setSelectedProjectId(remainingProjects[0].id);
        } else {
          // No projects left, clear selection
          setSelectedProjectId(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setDeletingProjectId(null);
    }
  };

  const startEditProject = (project: any) => {
    setEditingProjectId(project.id);
    setEditProjectData({
      name: project.name,
      description: project.description || ''
    });
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
    setEditProjectData({ name: '', description: '' });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('page.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('page.subtitle')}
          </p>
        </div>
        <Alert variant="danger">
          {t('errors.loadError')}
        </Alert>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('page.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('page.subtitle')}
          </p>
        </div>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4" />
            {t('buttons.newProject')}
          </Button>
        )}
      </div>

      {showCreateForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">{t('form.createTitle')}</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label={t('form.nameLabel')}
                value={newProjectData.name}
                onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                placeholder={t('form.namePlaceholder')}
                autoFocus
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('form.descriptionLabel')}
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                  placeholder={t('form.descriptionPlaceholder')}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateProject}
                  disabled={!newProjectData.name.trim() || createProject.isPending}
                >
                  {createProject.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('buttons.creating')}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t('buttons.createProject')}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewProjectData({ name: '', description: '' });
                  }}
                >
                  <X className="w-4 h-4" />
                  {t('buttons.cancel')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('empty.title')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('empty.message')}
            </p>
            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4" />
                {t('buttons.createFirstProject')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <Card
              key={project.id}
              className={`relative ${
                selectedProjectId === project.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-lg transition-shadow'
              }`}
            >
              <CardContent className="pt-6">
                {selectedProjectId === project.id && (
                  <Badge variant="info" className="absolute top-4 right-4">
                    {t('badges.active')}
                  </Badge>
                )}

                {editingProjectId === project.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editProjectData.name}
                      onChange={(e) => setEditProjectData({ ...editProjectData, name: e.target.value })}
                      placeholder={t('form.nameLabel')}
                      autoFocus
                    />
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      rows={2}
                      value={editProjectData.description}
                      onChange={(e) => setEditProjectData({ ...editProjectData, description: e.target.value })}
                      placeholder={t('form.descriptionEditPlaceholder')}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateProject(project.id)}
                        disabled={!editProjectData.name.trim() || updateProject.isPending}
                      >
                        {updateProject.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        {t('buttons.save')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        <X className="w-3 h-3" />
                        {t('buttons.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Folder className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {project.name}
                          </h3>
                          <button
                            onClick={() => handleCopyProjectId(project.id)}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors group"
                          >
                            <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                              {project.id}
                            </code>
                            {copiedProjectId === project.id ? (
                              <CheckCheck className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {project.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {project.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{t('info.createdAt', { date: formatDateTime(project.createdAt) })}</span>
                      </div>

                      {project._count && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{t('info.members', { count: project._count.members || 0 })}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                      {selectedProjectId !== project.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedProjectId(project.id)}
                          className="flex-1"
                        >
                          {t('buttons.select')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditProject(project)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteProject(project.id, project.name)}
                        disabled={deletingProjectId === project.id}
                      >
                        {deletingProjectId === project.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('about.title')}
          </h3>
          <p className="text-sm text-blue-800">
            {t('about.description')}
          </p>
        </div>
      )}
    </div>
    </>
  );
}