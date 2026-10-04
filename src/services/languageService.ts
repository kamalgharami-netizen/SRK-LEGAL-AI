/**
 * Language & Localization Service (English & Bengali / ইংরেজি ও বাংলা)
 * Primary / Default language: 'en' (English)
 * Dynamic switching between 'en' (English) and 'bn' (Bengali)
 */

export type LanguageMode = 'en' | 'bn';

const STORAGE_KEY = 'srk_language_mode';

export class LanguageService {
  private static currentMode: LanguageMode = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'bn') return 'bn';
      return 'en'; // English is the primary / default language
    } catch {
      return 'en';
    }
  })();

  static getMode(): LanguageMode {
    return this.currentMode;
  }

  static setMode(mode: LanguageMode): void {
    this.currentMode = mode === 'bn' ? 'bn' : 'en';
    try {
      localStorage.setItem(STORAGE_KEY, this.currentMode);
    } catch {}
  }

  /**
   * Translation helper
   * If mode is 'bn', returns Bengali text (or English fallback).
   * If mode is 'en', returns English text.
   */
  static t(en: string, bn: string): string {
    if (this.currentMode === 'bn') {
      return bn || en;
    }
    return en;
  }
}
