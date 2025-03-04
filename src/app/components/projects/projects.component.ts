import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { Observable } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="projects-section">
      <div class="container">
        <h2 class="section-title">Featured Projects</h2>
        
        <div class="project-filters">
          <button *ngFor="let category of categories"
                  (click)="filterByCategory(category)"
                  [class.active]="selectedCategory === category"
                  class="filter-btn">
            {{ category | titlecase }}
          </button>
        </div>

        <div class="projects-grid">
          <div *ngFor="let project of projects$ | async"
               class="project-card"
               [@projectAnimation]>
            
            <div class="project-thumbnail">
              <img [src]="project.thumbnail" [alt]="project.title">
              <div class="project-overlay">
                <a [href]="project.liveDemo" target="_blank" class="demo-link">View Demo</a>
                <a [href]="project.repository" target="_blank" class="repo-link">View Code</a>
              </div>
            </div>

            <div class="project-info">
              <h3>{{ project.title }}</h3>
              <p>{{ project.description }}</p>

              <div class="tech-stack">
                <span *ngFor="let tech of project.stack" class="tech-tag">
                  {{ tech.name }} {{ tech.version }}
                </span>
              </div>

              <div class="project-metrics">
                <div class="metric">
                  <span class="metric-label">Load Time</span>
                  <span class="metric-value">{{ project.metrics.loadTime }}s</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Test Coverage</span>
                  <span class="metric-value">{{ project.metrics.testCoverage }}%</span>
                </div>
              </div>

              <div class="project-links">
                <a *ngIf="project.caseStudy" 
                   [href]="project.caseStudy" 
                   target="_blank" 
                   class="case-study-link">
                  Read Case Study
                </a>
                <a *ngIf="project.videoUrl" 
                   [href]="project.videoUrl" 
                   target="_blank" 
                   class="video-link">
                  Watch Demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .projects-section {
      padding: var(--spacing-xl) 0;
      background: var(--color-background);
      min-height: 100vh;
    }

    .section-title {
      font-size: var(--font-size-xxl);
      text-align: center;
      margin-bottom: var(--spacing-xl);
      color: var(--color-text);
    }

    .project-filters {
      margin-bottom: var(--spacing-xl);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: var(--spacing-sm) var(--spacing-lg);
      border: 2px solid var(--color-primary);
      background: transparent;
      color: var(--color-text);
      border-radius: var(--border-radius-lg);
      cursor: pointer;
      transition: all var(--transition-duration) ease;

      &:hover, &.active {
        background: var(--color-primary);
        color: var(--color-primary-contrast);
      }
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-xl);
    }

    @media (max-width: 960px) {
      .projects-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .projects-grid {
        grid-template-columns: 1fr;
      }
    }

    .project-card {
      background: var(--color-surface);
      border-radius: var(--border-radius);
      overflow: hidden;
      transition: transform var(--transition-duration) ease;
      box-shadow: 0 2px 8px var(--color-shadow);

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px var(--color-shadow);

        .project-overlay {
          opacity: 1;
        }
      }
    }

    .project-thumbnail {
      position: relative;
      width: 100%;
      padding-top: /* 16:9 aspect ratio */ 56.25%;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .project-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--spacing-md);
      opacity: 0;
      transition: opacity var(--transition-duration) ease;

      a {
        padding: var(--spacing-sm) var(--spacing-md);
        border: 2px solid var(--color-primary);
        color: var(--color-primary-contrast);
        text-decoration: none;
        border-radius: var(--border-radius);
        transition: all var(--transition-duration) ease;

        &:hover {
          background: var(--color-primary);
        }
      }
    }

    .project-info {
      padding: var(--spacing-lg);

      h3 {
        color: var(--color-text);
        margin-bottom: var(--spacing-sm);
        font-size: var(--font-size-xl);
      }

      p {
        color: var(--color-text-secondary);
        margin-bottom: var(--spacing-md);
        line-height: var(--line-height-base);
      }
    }

    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
    }

    .tech-tag {
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--color-surface-hover);
      color: var(--color-primary);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
    }

    .project-metrics {
      display: flex;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .metric {
      display: flex;
      flex-direction: column;
      align-items: center;

      .metric-label {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
      }

      .metric-value {
        color: var(--color-primary);
        font-weight: bold;
      }
    }

    .project-links {
      display: flex;
      gap: var(--spacing-md);

      a {
        color: var(--color-primary);
        text-decoration: none;
        font-size: var(--font-size-sm);

        &:hover {
          color: var(--color-primary-hover);
          text-decoration: underline;
        }
      }
    }
  `],
  animations: [
    trigger('projectAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProjectsComponent implements OnInit {
  projects$: Observable<Project[]>;
  categories: string[] = ['all', 'frontend', 'backend', 'fullstack', 'mobile'];
  selectedCategory: string = 'all';

  constructor(private projectService: ProjectService) {
    this.projects$ = this.projectService.getProjects();
  }

  ngOnInit(): void {}

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.projects$ = category === 'all' 
      ? this.projectService.getProjects()
      : new Observable(observer => {
          observer.next(this.projectService.getProjectsByCategory(category as Project['category']));
          observer.complete();
        });
  }
}