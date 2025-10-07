import { useState } from 'react';
import { Key, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useUpdatePassword } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

export function Settings() {
  const { t } = useTranslation('settings');
  const updatePassword = useUpdatePassword();
  const toast = useToast();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('errors.passwordMismatch'));
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error(t('errors.passwordTooShort'));
      return;
    }

    try {
      await updatePassword.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success(t('password.success'));
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to update password:', error);
      // Error will be handled by global error handler
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Key className="w-5 h-5" />
            {t('password.title')}
          </h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <Input
              label={t('password.currentPasswordLabel')}
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              placeholder={t('password.currentPasswordPlaceholder')}
              required
              autoComplete="current-password"
            />

            <Input
              label={t('password.newPasswordLabel')}
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              placeholder={t('password.newPasswordPlaceholder')}
              required
              autoComplete="new-password"
            />

            <Input
              label={t('password.confirmPasswordLabel')}
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              placeholder={t('password.confirmPasswordPlaceholder')}
              required
              autoComplete="new-password"
            />

            <div className="pt-2">
              <Button
                type="submit"
                disabled={
                  updatePassword.isPending ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
              >
                {updatePassword.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('password.submitting')}
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    {t('password.submit')}
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              {t('passwordRequirements.title')}
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('passwordRequirements.minLength')}</li>
              <li>• {t('passwordRequirements.uppercase')}</li>
              <li>• {t('passwordRequirements.number')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
