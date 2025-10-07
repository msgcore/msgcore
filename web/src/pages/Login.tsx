import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Card, CardContent } from '../components/ui/Card';
import { Zap } from 'lucide-react';

export function Login() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, setupRequired, loading: authLoading } = useAuth();

  // Redirect to onboarding if setup is required
  useEffect(() => {
    if (!authLoading && setupRequired) {
      navigate('/onboarding', { replace: true });
    }
  }, [setupRequired, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('login.title')}</h1>
          <p className="text-gray-600 mt-2">{t('login.subtitle')}</p>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <Input
                type="email"
                label={t('login.emailLabel')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                required
                disabled={loading}
              />

              <Input
                type="password"
                label={t('login.passwordLabel')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                required
                disabled={loading}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? t('login.submitting') : t('login.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}