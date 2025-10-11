import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useProjects } from '../../hooks/useProjects';
import {
  Zap,
  LayoutDashboard,
  MessageSquare,
  Layers,
  Key,
  Users,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Folder,
  Webhook,
  UserCircle,
  Settings,
} from 'lucide-react';
import { cn, getInitials } from '../../lib/utils';

interface AppShellProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
}

export function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation('common');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { selectedProjectId, setSelectedProjectId, clearSelectedProject } = useProjectContext();
  const { data: projects = [] } = useProjects();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  const selectedProject = projects.find((p: any) => p.id === selectedProjectId);

  const navigation: NavItem[] = [
    {
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      label: t('nav.projects'),
      icon: Folder,
      href: '/projects',
    },
    {
      label: t('nav.messages'),
      icon: MessageSquare,
      href: '/messages',
    },
    {
      label: t('nav.platforms'),
      icon: Layers,
      href: '/platforms',
    },
    {
      label: t('nav.apiKeys'),
      icon: Key,
      href: '/keys',
    },
    {
      label: t('nav.members'),
      icon: Users,
      href: '/members',
    },
    {
      label: t('nav.webhooks'),
      icon: Webhook,
      href: '/webhooks',
    },
    {
      label: t('nav.identities'),
      icon: UserCircle,
      href: '/identities',
    },
  ];

  const handleSignOut = () => {
    clearSelectedProject(); // Clear the selected project from localStorage
    signOut();
    navigate('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={cn(
          'fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">MsgCore</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Project Selector */}
            {projects.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {selectedProject ? selectedProject.name : t('project.selectProject')}
                    </span>
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-gray-500 transition-transform flex-shrink-0",
                    projectMenuOpen && "rotate-180"
                  )} />
                </button>

                {projectMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                    {projects.map((project: any) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setProjectMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors",
                          selectedProjectId === project.id && "bg-blue-50 text-blue-700"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{project.name}</span>
                          {selectedProjectId === project.id && (
                            <span className="text-xs bg-blue-100 px-2 py-0.5 rounded">{t('project.active')}</span>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {project.description}
                          </p>
                        )}
                      </button>
                    ))}
                    <Link
                      to="/projects"
                      onClick={() => setProjectMenuOpen(false)}
                      className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-200 font-medium"
                    >
                      {t('project.manageProjects')}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name ? getInitials(user.name) : user?.email ? getInitials(user.email) : 'U'}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || t('user.user')}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {t('nav.settings')}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none" />
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}