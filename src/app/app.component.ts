import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggleComponent } from './components/shared/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  template: `
    <div class="app-container">
      <nav class="main-nav" [class.nav-open]="isMenuOpen">
        <div class="nav-brand">Portfolio</div>
        <button class="hamburger" (click)="toggleMenu()">
          <span></span><span></span><span></span>
        </button>
        <div class="nav-content" (click)="closeMenu()">
          <div class="nav-links">
            <a routerLink="/" class="nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="nav-icon">🏠</span>Home
            </a>
            <a routerLink="/particle-text" class="nav-link" routerLinkActive="active">
              <span class="nav-icon">✨</span>Particle Text
            </a>
            <a routerLink="/digital-rain" class="nav-link" routerLinkActive="active">
              <span class="nav-icon">🌧</span>Digital Rain
            </a>
            <a routerLink="/interactive-universe" class="nav-link" routerLinkActive="active">
              <span class="nav-icon">🌌</span>Universe
            </a>
            <a routerLink="/hilbert-curve" class="nav-link" routerLinkActive="active">
              <span class="nav-icon">🔲</span>Hilbert Curve
            </a>
            <a routerLink="/ui-components" class="nav-link" routerLinkActive="active">
              <span class="nav-icon">🎨</span>UI Components
            </a>
            <a routerLink="/projects" class="nav-link" routerLinkActive="active">
              <span class="nav-icon">📂</span>Projects
            </a>
            <a routerLink="/about" class="nav-link" routerLinkActive="active">
              <span class="nav-icon">👤</span>About
            </a>
            <a routerLink="/performance" class="nav-link" routerLinkActive="active">
              <span class="nav-icon">⚡</span>Performance
            </a>
          </div>
          <app-theme-toggle class="theme-toggle-position"></app-theme-toggle>
        </div>
      </nav>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: var(--color-background);
      color: var(--color-text);
    }

    .main-nav {
      position: fixed;
      top: 1rem;
      left: 1rem;
      right: 1rem;
      padding: 0.75rem 1.5rem;
      background: rgba(var(--color-surface-rgb), 0.8);
      backdrop-filter: blur(10px);
      border-radius: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
      box-shadow: 0 8px 32px rgba(var(--color-shadow-rgb), 0.1);
      border: 1px solid rgba(var(--color-surface-rgb), 0.3);
    }

    .nav-brand {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav-content {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .nav-links {
      display: flex;
      gap: 1.5rem;
    }

    .nav-link {
      color: var(--color-text);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-icon {
      font-size: 1.2rem;
    }

    .nav-link:hover {
      background: rgba(var(--color-primary-rgb), 0.1);
      transform: translateY(-2px);
    }

    .nav-link.active {
      background: rgba(var(--color-primary-rgb), 0.15);
      color: var(--color-primary);
    }

    .hamburger {
      display: none;
      flex-direction: column;
      gap: 6px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }

    .hamburger span {
      display: block;
      width: 25px;
      height: 2px;
      background: var(--color-text);
      transition: all 0.3s ease;
    }

    @media (max-width: 1024px) {
      .hamburger {
        display: flex;
      }

      .nav-content {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--color-surface);
        backdrop-filter: blur(10px);
        padding: 1rem;
        border-radius: 0 0 1rem 1rem;
        flex-direction: column;
        gap: 1rem;
        transform: translateY(-100%);
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
        border: 1px solid rgba(var(--color-surface-rgb), 0.3);
        box-shadow: 0 8px 32px rgba(var(--color-shadow-rgb), 0.1);
      }

      .nav-open .nav-content {
        transform: translateY(0);
        opacity: 1;
        pointer-events: all;
      }

      .nav-links {
        flex-direction: column;
        width: 100%;
      }

      .nav-link {
        padding: 0.75rem 1rem;
        width: 100%;
      }

      .theme-toggle-position {
        margin: 0;
      }
    }

    .theme-toggle-position {
      margin-left: auto;
    }

    .main-content {
      padding-top: 64px; /* Height of nav */
    }
  `]
})
export class AppComponent {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}