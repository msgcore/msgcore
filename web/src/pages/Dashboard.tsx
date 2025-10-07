import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectContext } from '../contexts/ProjectContext';
import { useProjects } from '../hooks/useProjects';
import { useMessageStats, useMessages } from '../hooks/useMessages';
import { usePlatforms } from '../hooks/usePlatforms';
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Layers,
  Key,
  Users,
  Settings,
  ArrowRight,
  Plus,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatNumber, formatDateTime, cn } from '../lib/utils';

interface StatCard {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}

export function Dashboard() {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const { selectedProjectId } = useProjectContext();
  const { data: projects = [] } = useProjects();

  // Fetch real data
  const { data: messageStats, isLoading: loadingStats } = useMessageStats(selectedProjectId || undefined);
  const { data: recentMessagesData, isLoading: loadingMessages } = useMessages(
    selectedProjectId || undefined,
    { limit: 5, order: 'desc' }
  );
  const { data: platformsData = [], isLoading: loadingPlatforms } = usePlatforms(selectedProjectId || undefined);

  const recentMessages = recentMessagesData?.messages || [];

  // Calculate stats from real data
  const stats: StatCard[] = messageStats ? [
    {
      label: t('stats.receivedMessages'),
      value: formatNumber(messageStats.received.totalMessages),
      icon: ArrowDownLeft,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: t('stats.sentMessages'),
      value: formatNumber(messageStats.sent.totalMessages),
      icon: ArrowUpRight,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: t('stats.uniqueUsers'),
      value: formatNumber(messageStats.received.uniqueUsers),
      icon: Users,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      label: t('stats.uniqueChats'),
      value: formatNumber(messageStats.received.uniqueChats),
      icon: MessageSquare,
      color: 'text-orange-600 bg-orange-100',
    },
  ] : [];

  const isLoading = loadingStats || loadingMessages || loadingPlatforms;

  const getStatusBadge = (status: string) => {
    const variants = {
      delivered: 'success',
      sent: 'info',
      failed: 'danger',
      pending: 'warning',
    } as const;

    const labels = {
      delivered: t('status.delivered'),
      sent: t('status.sent'),
      failed: t('status.failed'),
      pending: t('status.pending'),
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (!selectedProjectId || projects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Plus className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('empty.welcome')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('empty.createProject')}
          </p>
          <Link to="/projects?create=true">
            <Button size="lg">
              {t('empty.createButton')}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Layers className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('features.multiplePlatforms.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('features.multiplePlatforms.description')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Key className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">{t('features.simpleApi.title')}</h3>
              <p className="text-sm text-gray-600">
                {t('features.simpleApi.description')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('features.realTimeMetrics.title')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('features.realTimeMetrics.description')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('header.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('header.subtitle')}
          </p>
        </div>
        <Link to="/messages">
          <Button>
            <MessageSquare className="w-4 h-4" />
            {t('actions.viewMessages')}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={cn('p-3 rounded-lg', stat.color)}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('recentMessages.title')}
              </h3>
              <Link
                to="/messages"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('recentMessages.viewAll')}
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">{t('recentMessages.empty')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((message: any) => (
                  <div
                    key={message.id}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                        {message.messageText || t('recentMessages.noText')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {message.platform} • {message.userDisplay || message.providerUserId} • {formatDateTime(message.receivedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('platforms.title')}
              </h3>
              <Link
                to="/platforms"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('platforms.manage')}
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {platformsData.length === 0 ? (
              <div className="text-center py-8">
                <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">{t('platforms.empty')}</p>
                <Link to="/platforms">
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                    {t('platforms.connectButton')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {platformsData.map((platform: any) => (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <Layers className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {platform.platform}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {platform.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <Badge variant={platform.isActive ? 'success' : 'secondary'}>
                      {platform.isActive ? t('platforms.active') : t('platforms.inactive')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <Link to="/keys" className="block">
              <Key className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">{t('quickActions.apiKeys.title')}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('quickActions.apiKeys.description')}
              </p>
              <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
                {t('quickActions.apiKeys.action')}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <Link to="/webhooks" className="block">
              <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">{t('quickActions.webhooks.title')}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('quickActions.webhooks.description')}
              </p>
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                {t('quickActions.webhooks.action')}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <Link to="/members" className="block">
              <Users className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">{t('quickActions.members.title')}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('quickActions.members.description')}
              </p>
              <span className="text-sm text-purple-600 font-medium flex items-center gap-1">
                {t('quickActions.members.action')}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
