import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Card, CardContent } from '../components/ui/Card';
import { Zap } from 'lucide-react';

export function Onboarding() {
  const { t } = useTranslation('auth');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError(t('errors.passwordTooShort'));
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, name);

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('onboarding.title')}</h1>
          <p className="text-gray-600 text-lg">{t('onboarding.subtitle')}</p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <div>
                <Input
                  type="text"
                  label={t('onboarding.nameLabel')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('onboarding.namePlaceholder')}
                  required
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

              <div>
                <Input
                  type="email"
                  label={t('onboarding.emailLabel')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('onboarding.emailPlaceholder')}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div>
                <Input
                  type="password"
                  label={t('onboarding.passwordLabel')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('onboarding.passwordPlaceholder')}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                <p className="text-xs text-gray-500 mt-1">{t('onboarding.passwordHint')}</p>
              </div>

              <div>
                <Input
                  type="password"
                  label={t('onboarding.confirmPasswordLabel')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('onboarding.confirmPasswordPlaceholder')}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={loading}
                size="lg"
              >
                {loading ? t('onboarding.submitting') : t('onboarding.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t('onboarding.disclaimer')}
        </p>
      </div>
    </div>
  );
}
