import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Settings, Trash2, CheckCircle, XCircle, Loader2, AlertCircle, RefreshCw, Wifi, Radio, Globe, Copy, CheckCheck } from 'lucide-react';
import { FaWhatsapp, FaDiscord, FaTelegram, FaSlack, FaEnvelope, FaSms } from 'react-icons/fa';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { formatDateTime } from '../lib/utils';
import { useProjectContext } from '../contexts/ProjectContext';
import { usePlatforms, useDeletePlatform, useConfigurePlatform, useUpdatePlatform, useSupportedPlatforms } from '../hooks/usePlatforms';
import { useConfirm } from '../hooks/useConfirm';
import { useToast } from '../contexts/ToastContext';

export function Platforms() {
  const { t } = useTranslation('platforms');
  const { selectedProjectId } = useProjectContext();
  const { data: platforms = [], isLoading, error } = usePlatforms(selectedProjectId);
  const { data: supportedPlatformsData } = useSupportedPlatforms();
  const deletePlatform = useDeletePlatform(selectedProjectId);
  const configurePlatform = useConfigurePlatform(selectedProjectId);
  const updatePlatform = useUpdatePlatform(selectedProjectId);
  const { confirm, ConfirmDialog } = useConfirm();
  const toast = useToast();

  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const [editingPlatform, setEditingPlatform] = useState<any>(null);
  const [copiedPlatformId, setCopiedPlatformId] = useState<string | null>(null);

  const handleCopyPlatformId = async (platformId: string) => {
    try {
      await navigator.clipboard.writeText(platformId);
      setCopiedPlatformId(platformId);
      setTimeout(() => setCopiedPlatformId(null), 2000);
    } catch (error) {
      console.error('Failed to copy platform ID:', error);
    }
  };
  const [configureFormData, setConfigureFormData] = useState<any>({
    name: '',
    description: '',
    credentials: {},
    isActive: true
  });

  // Get supported platforms from API or fallback to empty array
  const supportedPlatforms = supportedPlatformsData?.platforms || [];

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: 'success' as const, icon: CheckCircle },
      connected: { variant: 'success' as const, icon: CheckCircle },
      disconnected: { variant: 'default' as const, icon: XCircle },
      error: { variant: 'danger' as const, icon: AlertCircle },
      pending: { variant: 'warning' as const, icon: RefreshCw },
    };

    const statusConfig = config[status as keyof typeof config] || config.disconnected;
    const { variant, icon: Icon } = statusConfig;

    return (
      <Badge variant={variant}>
        <Icon className="w-3 h-3 mr-1" />
        {t(`status.${status}`, { defaultValue: status })}
      </Badge>
    );
  };

  const getPlatformIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
      case 'whatsapp-evo':
        return <FaWhatsapp className="w-8 h-8 text-green-500" />;
      case 'discord':
        return <FaDiscord className="w-8 h-8 text-indigo-500" />;
      case 'telegram':
        return <FaTelegram className="w-8 h-8 text-blue-400" />;
      case 'slack':
        return <FaSlack className="w-8 h-8 text-purple-500" />;
      case 'email':
        return <FaEnvelope className="w-8 h-8 text-gray-500" />;
      case 'sms':
        return <FaSms className="w-8 h-8 text-pink-500" />;
      default:
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {type.charAt(0).toUpperCase()}
          </div>
        );
    }
  };

  const getConnectionTypeIcon = (type: string) => {
    switch (type) {
      case 'websocket':
        return <Wifi className="w-4 h-4 text-green-600" />;
      case 'webhook':
        return <Globe className="w-4 h-4 text-blue-600" />;
      case 'polling':
        return <Radio className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const handleDeletePlatform = async (platformId: string, platformName: string) => {
    const confirmed = await confirm({
      title: t('deleteConfirmation.title'),
      message: t('deleteConfirmation.message', { platformName }),
      confirmText: t('deleteConfirmation.confirm'),
      cancelText: t('deleteConfirmation.cancel'),
      variant: 'danger',
      confirmButtonVariant: 'danger',
    });

    if (!confirmed) return;

    try {
      await deletePlatform.mutateAsync(platformId);
    } catch (error) {
      console.error('Failed to delete platform:', error);
    }
  };

  const handleConfigurePlatform = (platform: any) => {
    setSelectedPlatform(platform);
    setEditingPlatform(null);
    // Initialize credentials with empty values for required fields
    const initialCredentials: any = {};
    if (platform.credentials?.required) {
      platform.credentials.required.forEach((field: string) => {
        initialCredentials[field] = '';
      });
    }
    if (platform.credentials?.optional) {
      platform.credentials.optional.forEach((field: string) => {
        initialCredentials[field] = '';
      });
    }

    setConfigureFormData({
      name: '',
      description: '',
      credentials: initialCredentials,
      isActive: true
    });
    setShowConfigureModal(true);
  };

  const handleEditPlatform = (platform: any) => {
    // Get platform info to know the credential fields
    const platformInfo = getPlatformInfo(platform.platform);
    setSelectedPlatform(platformInfo);
    setEditingPlatform(platform);

    // Initialize credentials with empty values (since they're redacted)
    const initialCredentials: any = {};
    if (platformInfo?.credentials?.required) {
      platformInfo.credentials.required.forEach((field: string) => {
        initialCredentials[field] = '';
      });
    }
    if (platformInfo?.credentials?.optional) {
      platformInfo.credentials.optional.forEach((field: string) => {
        initialCredentials[field] = '';
      });
    }

    setConfigureFormData({
      name: platform.name || '',
      description: platform.description || '',
      credentials: initialCredentials,
      isActive: platform.isActive || false
    });
    setShowConfigureModal(true);
  };

  const submitPlatformConfiguration = async () => {
    if (!configureFormData.name) return;

    try {
      if (editingPlatform) {
        // Update existing platform
        // Only send fields that have changed
        const updateData: any = {
          platformId: editingPlatform.id,
          name: configureFormData.name,
          description: configureFormData.description,
          isActive: configureFormData.isActive
        };

        // Only include non-empty credential fields (since existing ones are redacted)
        const nonEmptyCredentials: any = {};
        Object.keys(configureFormData.credentials).forEach(key => {
          if (configureFormData.credentials[key]) {
            nonEmptyCredentials[key] = configureFormData.credentials[key];
          }
        });

        // Only add credentials if there are any non-empty ones
        if (Object.keys(nonEmptyCredentials).length > 0) {
          updateData.credentials = nonEmptyCredentials;
        }

        await updatePlatform.mutateAsync(updateData);
      } else {
        // Create new platform
        if (!selectedPlatform) return;

        // Check if all required fields are filled for new platform
        const requiredFields = selectedPlatform.credentials?.required || [];
        for (const field of requiredFields) {
          if (!configureFormData.credentials[field]) {
            toast.error(t('validation.fillRequiredField', { field }));
            return;
          }
        }

        await configurePlatform.mutateAsync({
          platform: selectedPlatform.name as any,
          name: configureFormData.name,
          description: configureFormData.description,
          credentials: configureFormData.credentials,
          isActive: configureFormData.isActive
        });
      }

      setShowConfigureModal(false);
      setSelectedPlatform(null);
      setEditingPlatform(null);
      setConfigureFormData({
        name: '',
        description: '',
        credentials: {},
        isActive: true
      });
    } catch (error) {
      console.error('Failed to configure/update platform:', error);
    }
  };

  // Helper to get platform info from supported platforms
  const getPlatformInfo = (platformName: string) => {
    return supportedPlatforms.find((p: any) => p.name === platformName);
  };

  // Helper to format field name for display
  const formatFieldName = (field: string): string => {
    // Convert camelCase to Title Case
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/Api/g, 'API')
      .replace(/Url/g, 'URL')
      .replace(/Id/g, 'ID');
  };

  // Helper to get field type based on name
  const getFieldType = (field: string): string => {
    const lowerField = field.toLowerCase();
    if (lowerField.includes('password') ||
        lowerField.includes('token') ||
        lowerField.includes('key') ||
        lowerField.includes('secret')) {
      return 'password';
    }
    if (lowerField.includes('url') ||
        lowerField.includes('endpoint')) {
      return 'url';
    }
    if (lowerField.includes('email')) {
      return 'email';
    }
    if (lowerField.includes('number') ||
        lowerField.includes('port')) {
      return 'number';
    }
    return 'text';
  };

  if (!selectedProjectId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Alert variant="warning">
          {t('alerts.selectProject')}
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Alert variant="danger">
          {t('alerts.loadError')}
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
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-1">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('connectedPlatforms.title')}
            </h3>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : platforms.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">
                  {t('connectedPlatforms.noPlatforms')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {platforms.map((platform: any) => {
                  const platformInfo = getPlatformInfo(platform.platform);
                  return (
                    <div
                      key={platform.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {getPlatformIcon(platform.platform)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-base font-semibold text-gray-900">
                            {platform.name}
                          </h4>
                          {getStatusBadge(platform.isActive ? 'active' : 'disconnected')}
                        </div>
                        <button
                          onClick={() => handleCopyPlatformId(platform.id)}
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors group mb-2"
                        >
                          <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                            {platform.id}
                          </code>
                          {copiedPlatformId === platform.id ? (
                            <CheckCheck className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{t('connectedPlatforms.type')}: {platformInfo?.displayName || platform.platform}</span>
                          <span>•</span>
                          <span>{t('connectedPlatforms.createdAt')}: {formatDateTime(platform.createdAt)}</span>
                        </div>
                        {platform.description && (
                          <p className="text-sm text-gray-500 mt-1">{platform.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPlatform(platform)}
                        >
                          <Settings className="w-4 h-4" />
                          {t('connectedPlatforms.configure')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePlatform(
                            platform.id,
                            platform.name
                          )}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('availablePlatforms.title')}
            </h3>
          </CardHeader>
          <CardContent>
            {!supportedPlatforms.length ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('availablePlatforms.loading')}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supportedPlatforms.map((platform: any) => {
                  const configuredCount = platforms.filter((p: any) => p.platform === platform.name).length;

                  return (
                    <div
                      key={platform.name}
                      className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 flex items-center justify-center">
                          {getPlatformIcon(platform.name)}
                        </div>
                        {configuredCount > 0 && (
                          <Badge variant="info">{configuredCount} {t('availablePlatforms.configured')}{configuredCount > 1 ? 's' : ''}</Badge>
                        )}
                      </div>

                      <h4 className="font-semibold text-gray-900 mb-1">
                        {platform.displayName}
                      </h4>

                      {platform.features && (
                        <div className="flex gap-2 text-xs text-gray-500 mb-3">
                          {platform.features.supportsWebhooks && <span>✓ {t('features.webhooks')}</span>}
                          {platform.features.supportsWebSocket && <span>✓ {t('features.webSocket')}</span>}
                          {platform.features.supportsPolling && <span>✓ {t('features.polling')}</span>}
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleConfigurePlatform(platform)}
                      >
                        <Plus className="w-4 h-4" />
                        {t('availablePlatforms.add')} {platform.displayName}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Configuration Modal */}
        {showConfigureModal && selectedPlatform && (
          <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingPlatform ? `${t('configurationModal.titleEdit')} ${configureFormData.name}` : `${t('configurationModal.titleConfigure')} ${selectedPlatform.displayName}`}
              </h3>

              <div className="space-y-4">
                <Input
                  label={t('configurationModal.nameLabel')}
                  value={configureFormData.name}
                  onChange={(e) => setConfigureFormData({ ...configureFormData, name: e.target.value })}
                  placeholder={t('configurationModal.namePlaceholder', { platformName: selectedPlatform.displayName })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('configurationModal.descriptionLabel')}
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={2}
                    value={configureFormData.description}
                    onChange={(e) => setConfigureFormData({ ...configureFormData, description: e.target.value })}
                    placeholder={t('configurationModal.descriptionPlaceholder')}
                  />
                </div>

                {/* Dynamic credential fields based on platform requirements */}
                {selectedPlatform.credentials && (
                  <>
                    {/* Required fields - show as optional when editing since current values are redacted */}
                    {selectedPlatform.credentials.required?.map((field: string) => (
                      <div key={field}>
                        <Input
                          label={`${formatFieldName(field)}${editingPlatform ? ` ${t('configurationModal.leaveEmptyHint')}` : ''}`}
                          type={getFieldType(field)}
                          value={configureFormData.credentials[field] || ''}
                          onChange={(e) => setConfigureFormData({
                            ...configureFormData,
                            credentials: { ...configureFormData.credentials, [field]: e.target.value }
                          })}
                          placeholder={
                            editingPlatform
                              ? t('configurationModal.leaveEmptyPlaceholder')
                              : selectedPlatform.credentials.example?.[field]
                                ? `${t('configurationModal.examplePrefix')} ${selectedPlatform.credentials.example[field]}`
                                : `${t('configurationModal.enterPrefix')} ${formatFieldName(field).toLowerCase()}`
                          }
                          required={!editingPlatform}
                        />
                      </div>
                    ))}

                    {/* Optional fields */}
                    {selectedPlatform.credentials.optional?.length > 0 && (
                      <>
                        <div className="text-sm text-gray-600 mt-4">{t('configurationModal.optionalFields')}</div>
                        {selectedPlatform.credentials.optional.map((field: string) => (
                          <div key={field}>
                            <Input
                              label={`${formatFieldName(field)} ${t('form.optional')}`}
                              type={getFieldType(field)}
                              value={configureFormData.credentials[field] || ''}
                              onChange={(e) => setConfigureFormData({
                                ...configureFormData,
                                credentials: { ...configureFormData.credentials, [field]: e.target.value }
                              })}
                              placeholder={
                                selectedPlatform.credentials.example?.[field]
                                  ? `${t('configurationModal.examplePrefix')} ${selectedPlatform.credentials.example[field]}`
                                  : `${t('configurationModal.enterPrefix')} ${formatFieldName(field).toLowerCase()}`
                              }
                            />
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}

                {/* Configuration options */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={configureFormData.isActive}
                      onChange={(e) => setConfigureFormData({ ...configureFormData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{t('configurationModal.activateImmediately')}</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={submitPlatformConfiguration}
                  disabled={(configurePlatform.isPending || updatePlatform.isPending) || !configureFormData.name}
                  className="flex-1"
                >
                  {(configurePlatform.isPending || updatePlatform.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingPlatform ? t('configurationModal.updating') : t('configurationModal.configuring')}
                    </>
                  ) : (
                    editingPlatform ? t('configurationModal.update') : t('configurationModal.configure')
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfigureModal(false);
                    setSelectedPlatform(null);
                    setEditingPlatform(null);
                    setConfigureFormData({
                      name: '',
                      description: '',
                      credentials: {},
                      isActive: true
                    });
                  }}
                  className="flex-1"
                >
                  {t('configurationModal.cancel')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}