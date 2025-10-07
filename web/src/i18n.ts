import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEn from './locales/en/common.json';
import authEn from './locales/en/auth.json';
import dashboardEn from './locales/en/dashboard.json';
import projectsEn from './locales/en/projects.json';
import messagesEn from './locales/en/messages.json';
import platformsEn from './locales/en/platforms.json';
import apiKeysEn from './locales/en/apiKeys.json';
import membersEn from './locales/en/members.json';
import webhooksEn from './locales/en/webhooks.json';
import identitiesEn from './locales/en/identities.json';
import settingsEn from './locales/en/settings.json';
import acceptInviteEn from './locales/en/acceptInvite.json';

import commonPtBR from './locales/pt-BR/common.json';
import authPtBR from './locales/pt-BR/auth.json';
import dashboardPtBR from './locales/pt-BR/dashboard.json';
import projectsPtBR from './locales/pt-BR/projects.json';
import messagesPtBR from './locales/pt-BR/messages.json';
import platformsPtBR from './locales/pt-BR/platforms.json';
import apiKeysPtBR from './locales/pt-BR/apiKeys.json';
import membersPtBR from './locales/pt-BR/members.json';
import webhooksPtBR from './locales/pt-BR/webhooks.json';
import identitiesPtBR from './locales/pt-BR/identities.json';
import settingsPtBR from './locales/pt-BR/settings.json';
import acceptInvitePtBR from './locales/pt-BR/acceptInvite.json';

const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    dashboard: dashboardEn,
    projects: projectsEn,
    messages: messagesEn,
    platforms: platformsEn,
    apiKeys: apiKeysEn,
    members: membersEn,
    webhooks: webhooksEn,
    identities: identitiesEn,
    settings: settingsEn,
    acceptInvite: acceptInviteEn,
  },
  'pt-BR': {
    common: commonPtBR,
    auth: authPtBR,
    dashboard: dashboardPtBR,
    projects: projectsPtBR,
    messages: messagesPtBR,
    platforms: platformsPtBR,
    apiKeys: apiKeysPtBR,
    members: membersPtBR,
    webhooks: webhooksPtBR,
    identities: identitiesPtBR,
    settings: settingsPtBR,
    acceptInvite: acceptInvitePtBR,
  },
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt-BR'],

    // Language detection options
    detection: {
      order: ['navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
