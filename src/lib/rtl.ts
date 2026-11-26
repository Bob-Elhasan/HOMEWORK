import { I18nManager } from 'react-native';
import type { AppLanguage } from './i18n';

// Languages that read right-to-left.
const RTL_LANGUAGES: ReadonlySet<AppLanguage> = new Set<AppLanguage>(['ar']);

export function isRtlLanguage(language: AppLanguage): boolean {
  return RTL_LANGUAGES.has(language);
}

// Lets the native layer flip layouts when an RTL language is active.
// Native direction changes take effect after a reload, so callers should
// only switch direction at app start or after a deliberate restart.
export function applyLayoutDirection(language: AppLanguage): boolean {
  const wantRtl = isRtlLanguage(language);
  if (I18nManager.isRTL !== wantRtl) {
    I18nManager.allowRTL(wantRtl);
    I18nManager.forceRTL(wantRtl);
    return true; // reload required
  }
  return false;
}
