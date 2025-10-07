import { useState } from 'react';
import { UserPlus, Mail, Shield, Trash2, Loader2, X, Check, Copy, CheckCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { formatDateTime, getInitials } from '../lib/utils';
import { useMembers, useRemoveMember, useInviteMember } from '../hooks/useMembers';
import { useProjectContext } from '../contexts/ProjectContext';
import { useConfirm } from '../hooks/useConfirm';
import { useToast } from '../contexts/ToastContext';

export function Members() {
  const { t } = useTranslation('members');
  const { selectedProjectId } = useProjectContext();
  const { data: members = [], isLoading, error } = useMembers(selectedProjectId || undefined);
  const toast = useToast();
  const removeMember = useRemoveMember(selectedProjectId || undefined);
  const inviteMember = useInviteMember(selectedProjectId || undefined);
  const { confirm, ConfirmDialog } = useConfirm();

  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copiedInviteUrl, setCopiedInviteUrl] = useState(false);

  const handleRemoveMember = async (userId: string, userName: string) => {
    const confirmed = await confirm({
      title: t('confirmDialogs.removeTitle'),
      message: t('confirmDialogs.removeMessage', { name: userName }),
      confirmText: t('actions.remove'),
      cancelText: t('actions.cancel'),
      variant: 'danger',
      confirmButtonVariant: 'danger',
    });

    if (!confirmed) return;

    setRemovingMemberId(userId);
    try {
      await removeMember.mutateAsync(userId);
    } catch (error) {
      console.error('Failed to remove member:', error);
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;

    try {
      const result = await inviteMember.mutateAsync({
        email: inviteEmail,
      });

      // Check if inviteLink exists
      if (!result.inviteLink) {
        toast.error(t('errors.errorGeneratingLink'));
        return;
      }

      // Extract token from inviteLink (format: http://*/invite/{token})
      const token = result.inviteLink.split('/invite/')[1];

      if (!token) {
        toast.error(t('errors.invalidInviteLinkFormat'));
        return;
      }

      // Build URL with current origin
      const baseUrl = window.location.origin;
      const fullInviteUrl = `${baseUrl}/accept-invite?token=${token}`;
      setInviteUrl(fullInviteUrl);
      setInviteEmail('');
    } catch (error) {
      console.error('Failed to invite member:', error);
      // Error will be handled by global error handler
    }
  };

  const handleCopyInviteUrl = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInviteUrl(true);
      setTimeout(() => setCopiedInviteUrl(false), 2000);
    } catch (error) {
      console.error('Failed to copy invite URL:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const config = {
      admin: { variant: 'success' as const, label: t('roles.admin') },
      member: { variant: 'info' as const, label: t('roles.member') },
      viewer: { variant: 'warning' as const, label: t('roles.viewer') },
      client_admin: { variant: 'success' as const, label: t('roles.clientAdmin') },
      client_member: { variant: 'info' as const, label: t('roles.clientMember') },
      system_admin: { variant: 'danger' as const, label: t('roles.systemAdmin') },
    };

    const roleConfig = config[role as keyof typeof config];
    if (!roleConfig) {
      return <Badge variant="secondary">{role}</Badge>;
    }

    const { variant, label } = roleConfig;
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <Alert variant="danger">{t('alerts.errorLoading')}</Alert>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-1">{t('subtitle')}</p>
          </div>
          {!showInviteForm && (
            <Button onClick={() => setShowInviteForm(true)}>
              <UserPlus className="w-4 h-4" />
              {t('actions.inviteMember')}
            </Button>
          )}
        </div>

        {showInviteForm && selectedProjectId && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">{t('inviteForm.title')}</h3>
            </CardHeader>
            <CardContent>
              {inviteUrl ? (
                <div className="space-y-4">
                  <Alert variant="success">{t('inviteForm.inviteCreated')}</Alert>
                  <div className="flex items-center gap-2">
                    <Input
                      value={inviteUrl}
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      onClick={handleCopyInviteUrl}
                      variant="outline"
                    >
                      {copiedInviteUrl ? (
                        <>
                          <CheckCheck className="w-4 h-4" />
                          {t('actions.copied')}
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          {t('actions.copy')}
                        </>
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInviteUrl(null);
                      setShowInviteForm(false);
                    }}
                  >
                    {t('actions.close')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    label={t('inviteForm.emailLabel')}
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder={t('inviteForm.emailPlaceholder')}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleInviteMember}
                      disabled={!inviteEmail.trim() || inviteMember.isPending}
                    >
                      {inviteMember.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('actions.creatingInvite')}
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          {t('actions.createInvite')}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowInviteForm(false);
                        setInviteEmail('');
                      }}
                    >
                      <X className="w-4 h-4" />
                      {t('actions.cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {!selectedProjectId ? (
        <Alert variant="warning">{t('alerts.selectProject')}</Alert>
      ) : (
        <>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                {isLoading ? t('list.loading') : t('list.title', { count: members.length })}
              </h3>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t('list.noMembers')}
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member: any) => (
                    <div
                      key={member.userId || member.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {getInitials(member.user?.name || member.user?.email || t('list.unknownUser'))}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {member.user?.name || member.user?.email || t('list.unknownUser')}
                          </h4>
                          {getRoleBadge(member.role)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{member.user?.email || t('list.noEmail')}</span>
                          <span>•</span>
                          <span>{t('list.memberSince', { date: formatDateTime(member.createdAt || member.joinedAt) })}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {member.role !== 'admin' && member.role !== 'client_admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(
                              member.userId || member.id,
                              member.user?.name || member.user?.email || t('list.unknownUser')
                            )}
                            disabled={removingMemberId === (member.userId || member.id)}
                          >
                            {removingMemberId === (member.userId || member.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-600" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {t('permissions.title')}
        </h3>
        <p className="text-sm text-amber-800">
          {t('permissions.message')}
        </p>
      </div>
        </>
      )}
    </div>
    </>
  );
}
