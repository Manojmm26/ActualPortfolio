import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'preferred-theme';
  private readonly darkThemeClass = 'dark-theme';
  private themeSubject = new BehaviorSubject<Theme>(this.getInitialTheme());

  currentTheme$ = this.themeSubject.asObservable();

  constructor() {
    // Initialize theme
    this.setTheme(this.themeSubject.value);
    
    // Watch for system theme changes
    this.watchSystemThemeChanges();
  }

  toggleTheme(): void {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private setTheme(theme: Theme): void {
    document.documentElement.classList.toggle(this.darkThemeClass, theme === 'dark');
    localStorage.setItem(this.THEME_KEY, theme);
    this.themeSubject.next(theme);
  }

  private getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private watchSystemThemeChanges(): void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.THEME_KEY)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
} 