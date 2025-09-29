import { env } from './.env';

export const environment = {
  production: false,
  version: env['npm_package_version'] + '-dev',
  defaultLanguage: 'de-DE',
  supportedLanguages: ['de-DE', 'en-EN', 'es-ES', 'fr-FR', 'it-IT'],
  // version: env.npm_package_version + '-dev',
  serverUrl: 'http://localhost:2017/',
  mainServerUrl: 'http://localhost:2017/',
  secondaryServerUrl: 'http://localhost:2017/',
  ticketServerUrl: 'http://localhost:4201',
  // serverUrl: 'https://api.gastroguide.de/',
  gastroPayUrl: 'http://gpaytest.azurewebsites.de/api/v1.0/',
  revolutPayUrl: 'https://ms-test.gastroguide.de/',
  // defaultLanguage: 'de-DE',
  versionCheckURL: '/dist/version.json',
  frontendUrl: 'https://kunden.gastro.digital',
  onlineResURL: 'http://localhost:4201',
  googleTranslationUrl: 'https://translation.googleapis.com/language/translate/v2?key=',
  googleTranslationApiKey: 'AIzaSyCVGSVFC4w5IbDNwDP3Zgq1PswBH8JHiiY',
  baseUrl: 'http://localhost:4201/',
  baseUrlHetzner: 'http://localhost:4201/',
};
