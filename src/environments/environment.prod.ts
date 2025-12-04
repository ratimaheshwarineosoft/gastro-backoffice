import { env } from './.env';

export const environment = {
  production: true,
  version: env['npm_package_version'] + '-dev',
  defaultLanguage: 'de-DE',
  supportedLanguages: ['de-DE', 'en-EN', 'es-ES', 'fr-FR', 'it-IT'],
  serverUrl: 'https://ec2.gastroguide.de/',
  mainServerUrl: 'https://ec2.gastroguide.de/',
  secondaryServerUrl: 'https://ec2.gastroguide.de/',
  ticketServerUrl: 'https://tickets.gastroguide.de',
  gastroPayUrl: 'https://gastropay.azurewebsites.de/api/v1.0/',
  revolutPayUrl: 'https://ms.gastroguide.de/',
  versionCheckURL: '/dist/version.json',
  frontendUrl: 'https://kunden.gastro.digital',
  onlineResURL: 'https://reservierung.gastroguide.de',
  googleTranslationUrl: 'https://translation.googleapis.com/language/translate/v2?key=',
  googleTranslationApiKey: 'AIzaSyCVGSVFC4w5IbDNwDP3Zgq1PswBH8JHiiY',
  baseUrl: 'https://kunden.gastro.digital/',
  baseUrlHetzner: 'https://kunden.gastrodigital.net/',
};
