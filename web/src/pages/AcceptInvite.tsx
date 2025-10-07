import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { useAcceptInvite } from '../hooks/useAuth';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function AcceptInvite() {
  const { t } = useTranslation('acceptInvite');
  const { t: tCommon } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const acceptInvite = useAcceptInvite();
  const toast = useToast();

  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
  });

  const [success, setSuccess] = useState(false);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error(t('errors.invalidToken'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('errors.passwordMismatch'));
      return;
    }

    if (formData.password.length < 8) {
      toast.error(t('errors.passwordTooShort'));
      return;
    }

    try {
      const result = await acceptInvite.mutateAsync({
        token,
        name: formData.name,
        password: formData.password,
      });

      setSuccess(true);
      toast.success(t('success.accountCreated'));

      // Sign in with the new credentials
      signIn(result.accessToken, result.user);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to accept invite:', err);
      // Error will be handled by global error handler
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('states.invalid.title')}</h2>
            <p className="text-gray-600">
              {t('states.invalid.message')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('states.success.title')}</h2>
            <p className="text-gray-600 mb-4">
              {t('states.success.message')}
            </p>
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-2">
              {t('subtitle')}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAcceptInvite} className="space-y-4">
            <Input
              label={t('form.nameLabel')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('form.namePlaceholder')}
              required
              autoFocus
            />

            <Input
              label={t('form.passwordLabel')}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={t('form.passwordPlaceholder')}
              required
            />

            <Input
              label={t('form.confirmPasswordLabel')}
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder={t('form.confirmPasswordPlaceholder')}
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={acceptInvite.isPending || !formData.name || !formData.password || !formData.confirmPassword}
            >
              {acceptInvite.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('buttons.submitting')}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {t('buttons.submit')}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('footer.alreadyHaveAccount')}{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                {t('footer.signIn')}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
