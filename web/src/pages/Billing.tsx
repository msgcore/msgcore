import { useState } from 'react';
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Check,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  useSubscription,
  useUsage,
  useCreateCheckout,
  useCreatePortal,
  useSyncSubscription,
} from '../hooks/useBilling';
import { useToast } from '../contexts/ToastContext';
import type { SubscriptionTier } from '@msgcore/sdk';

const TIER_INFO = {
  FREE: {
    name: 'Free',
    price: '$0',
    features: ['1 project', '1,000 messages/month', '2 platforms', '7 days history'],
  },
  STARTER: {
    name: 'Starter',
    monthlyPrice: '$19',
    annualPrice: '$190',
    features: [
      '5 projects',
      '10,000 messages/month',
      'Unlimited platforms',
      '30 days history',
      '5 webhooks',
      '10 team members',
    ],
  },
  PRO: {
    name: 'Pro',
    monthlyPrice: '$49',
    annualPrice: '$490',
    features: [
      'Unlimited projects',
      '50,000 messages/month',
      'Unlimited platforms',
      '90 days history',
      '25 webhooks',
      '50 team members',
    ],
  },
  BUSINESS: {
    name: 'Business',
    monthlyPrice: '$99',
    annualPrice: '$990',
    features: [
      'Unlimited projects',
      '250,000 messages/month',
      'Unlimited platforms',
      '365 days history',
      '100 webhooks',
      '250 team members',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 'Contact Us',
    features: [
      'Unlimited everything',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
    ],
  },
};

export function Billing() {
  const { t } = useTranslation();
  const toast = useToast();
  const subscription = useSubscription();
  const usage = useUsage();
  const createCheckout = useCreateCheckout();
  const createPortal = useCreatePortal();
  const syncSubscription = useSyncSubscription();

  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'annual'>('monthly');

  const handleUpgrade = async (tier: SubscriptionTier) => {
    try {
      const result = await createCheckout.mutateAsync({ tier, interval: selectedInterval });
      window.location.href = result.url;
    } catch (error) {
      console.error('Failed to create checkout:', error);
      toast.error('Failed to create checkout session');
    }
  };

  const handleManageSubscription = async () => {
    try {
      const result = await createPortal.mutateAsync();
      window.location.href = result.url;
    } catch (error) {
      console.error('Failed to open portal:', error);
      toast.error('Failed to open customer portal');
    }
  };

  const handleSync = async () => {
    try {
      await syncSubscription.mutateAsync();
      toast.success('Subscription synced successfully');
    } catch (error) {
      console.error('Failed to sync:', error);
      toast.error('Failed to sync subscription');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      ACTIVE: 'bg-green-100 text-green-800',
      TRIALING: 'bg-blue-100 text-blue-800',
      PAST_DUE: 'bg-yellow-100 text-yellow-800',
      CANCELED: 'bg-red-100 text-red-800',
      UNPAID: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
    );
  };

  const getUsageBar = (current: number, limit: number) => {
    const percent = limit === -1 ? 0 : Math.min((current / limit) * 100, 100);
    const isWarning = percent >= 80;
    const isDanger = percent >= 100;

    return (
      <div className="mt-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">
            {current.toLocaleString()} / {limit === -1 ? '∞' : limit.toLocaleString()}
          </span>
          <span className={isDanger ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-gray-600'}>
            {limit === -1 ? 'Unlimited' : `${percent.toFixed(0)}%`}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isDanger ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: `${limit === -1 ? 0 : percent}%` }}
          />
        </div>
      </div>
    );
  };

  if (subscription.isLoading || usage.isLoading) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const currentTier = subscription.data?.tier || 'FREE';

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-1">Manage your subscription and usage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSync} disabled={syncSubscription.isPending}>
            {syncSubscription.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Sync
          </Button>
          {currentTier !== 'FREE' && (
            <Button onClick={handleManageSubscription} disabled={createPortal.isPending}>
              {createPortal.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Manage Subscription
            </Button>
          )}
        </div>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Subscription
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {TIER_INFO[currentTier as keyof typeof TIER_INFO]?.name}
                </h2>
                {subscription.data?.status && getStatusBadge(subscription.data.status)}
              </div>
              {subscription.data?.isTrialing && subscription.data.daysUntilEnd && (
                <p className="text-sm text-blue-600 mt-1">
                  Trial ends in {subscription.data.daysUntilEnd} days
                </p>
              )}
              {subscription.data?.startedAt && (
                <p className="text-sm text-gray-500 mt-1">
                  Started: {new Date(subscription.data.startedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Usage Statistics
          </h3>
        </CardHeader>
        <CardContent>
          {usage.data?.warnings && usage.data.warnings.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900">Usage Warnings</h4>
                  <ul className="mt-2 space-y-1">
                    {usage.data.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-yellow-800">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900">Projects</h4>
              {usage.data?.projects &&
                getUsageBar(usage.data.projects.current, usage.data.projects.limit)}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Messages (This Month)</h4>
              {usage.data?.messages &&
                getUsageBar(usage.data.messages.current, usage.data.messages.limit)}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Platforms</h4>
              {usage.data?.platforms &&
                getUsageBar(usage.data.platforms.current, usage.data.platforms.limit)}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Webhooks</h4>
              {usage.data?.webhooks &&
                getUsageBar(usage.data.webhooks.current, usage.data.webhooks.limit)}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Team Members</h4>
              {usage.data?.teamMembers &&
                getUsageBar(usage.data.teamMembers.current, usage.data.teamMembers.limit)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Available Plans</h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedInterval('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedInterval === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedInterval('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedInterval === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="ml-1 text-green-600 font-semibold">Save 17%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(['STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'] as const).map((tier) => {
            const info = TIER_INFO[tier];
            const isCurrent = currentTier === tier;
            const isDowngrade = ['FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'].indexOf(tier) <
              ['FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'].indexOf(currentTier);

            return (
              <Card key={tier} className={isCurrent ? 'ring-2 ring-blue-500' : ''}>
                <CardHeader>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">{info.name}</h3>
                    <div className="mt-2">
                      {tier === 'ENTERPRISE' ? (
                        <p className="text-2xl font-bold text-gray-900">{info.price}</p>
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-gray-900">
                            {selectedInterval === 'monthly'
                              ? info.monthlyPrice
                              : info.annualPrice}
                          </p>
                          <p className="text-sm text-gray-500">
                            /{selectedInterval === 'monthly' ? 'month' : 'year'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {info.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <Button variant="outline" disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : isDowngrade ? (
                    <Button
                      variant="outline"
                      onClick={handleManageSubscription}
                      className="w-full"
                      disabled={createPortal.isPending}
                    >
                      Downgrade via Portal
                    </Button>
                  ) : tier === 'ENTERPRISE' ? (
                    <Button
                      variant="outline"
                      onClick={() => window.open('mailto:sales@msgcore.dev')}
                      className="w-full"
                    >
                      Contact Sales
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(tier)}
                      disabled={createCheckout.isPending}
                      className="w-full"
                    >
                      {createCheckout.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Upgrade'
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
