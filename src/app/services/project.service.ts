import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Project } from '../models/project.model';

export interface ProjectMetrics {
  loadTime: number;
  errorRate: number;
  testCoverage?: number;
  bundleSize?: number;
  lighthouse?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects: Project[] = [
    {
      id: 'enterprise-dashboard',
      title: 'Enterprise Analytics Dashboard',
      description: 'High-performance analytics dashboard processing millions of data points in real-time using NgRx and WebSocket connections.',
      stack: [
        { name: 'Angular', version: '17.1.0' },
        { name: 'NgRx', version: '17.1.0' },
        { name: 'RxJS', version: '7.8.0' },
        { name: 'D3.js', version: '7.8.5' }
      ],
      challenges: [
        'Processing large datasets without impacting UI performance',
        'Real-time data synchronization across multiple views',
        'Complex state management with multiple data sources'
      ],
      solutions: [
        'Implemented virtual scrolling and data windowing techniques',
        'Utilized WebSocket with RxJS for efficient real-time updates',
        'Designed scalable NgRx state architecture with EntityAdapter'
      ],
      metrics: {
        loadTime: 0.8,
        errorRate: 0.01,
        testCoverage: 94,
        bundleSize: 156,
        lighthouse: {
          performance: 98,
          accessibility: 100,
          bestPractices: 95,
          seo: 100
        }
      },
      repository: 'https://github.com/yourusername/enterprise-dashboard',
      liveDemo: 'https://dashboard-demo.yourdomain.com',
      caseStudy: 'https://medium.com/@yourusername/case-study-enterprise-dashboard',
      thumbnail: 'assets/images/projects/dashboard-thumb.webp',
      images: [
        'assets/images/projects/dashboard-1.webp',
        'assets/images/projects/dashboard-2.webp',
        'assets/images/projects/dashboard-3.webp'
      ],
      videoUrl: 'https://youtube.com/watch?v=dashboard-demo',
      featured: true,
      completionDate: new Date('2024-01-15'),
      category: 'frontend',
      tags: ['Angular', 'NgRx', 'RxJS', 'D3.js', 'WebSocket', 'Performance']
    },
    {
      id: 'fintech-platform',
      title: 'FinTech Trading Platform',
      description: 'Real-time trading platform with complex state management and microsecond updates.',
      stack: [
        { name: 'Angular', version: '17.1.0' },
        { name: 'NgRx', version: '17.1.0' },
        { name: 'GraphQL', version: '16.8.0' },
        { name: 'WebSocket', version: '1.0.0' }
      ],
      challenges: [
        'Handling high-frequency trading data updates',
        'Managing complex application state',
        'Ensuring sub-millisecond response times'
      ],
      solutions: [
        'Custom RxJS operators for data transformation',
        'Optimized change detection strategy',
        'Implemented WebWorkers for heavy computations'
      ],
      metrics: {
        loadTime: 0.6,
        errorRate: 0.001,
        testCoverage: 96,
        bundleSize: 180,
        lighthouse: {
          performance: 95,
          accessibility: 98,
          bestPractices: 100,
          seo: 97
        }
      },
      repository: 'https://github.com/yourusername/fintech-platform',
      liveDemo: 'https://fintech-demo.yourdomain.com',
      thumbnail: 'assets/images/projects/fintech-thumb.webp',
      images: [
        'assets/images/projects/fintech-1.webp',
        'assets/images/projects/fintech-2.webp'
      ],
      featured: true,
      completionDate: new Date('2023-11-30'),
      category: 'fullstack',
      tags: ['Angular', 'NgRx', 'GraphQL', 'WebSocket', 'FinTech']
    }
  ];

  private projectsSubject = new BehaviorSubject<Project[]>(this.projects);

  getProjects(): Observable<Project[]> {
    return this.projectsSubject.asObservable();
  }

  getFeaturedProjects(): Observable<Project[]> {
    return new Observable(observer => {
      observer.next(this.projects.filter(project => project.featured));
      observer.complete();
    });
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find(project => project.id === id);
  }

  getProjectsByCategory(category: Project['category']): Project[] {
    return this.projects.filter(project => project.category === category);
  }

  getProjectsByTag(tag: string): Project[] {
    return this.projects.filter(project => 
      project.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  addProject(project: Project): void {
    this.projects.push(project);
    this.projectsSubject.next(this.projects);
  }

  updateProject(id: string, updates: Partial<Project>): void {
    const index = this.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projects[index] = { ...this.projects[index], ...updates };
      this.projectsSubject.next(this.projects);
    }
  }

  getAverageMetrics(): ProjectMetrics {
    const totalProjects = this.projects.length;
    return {
      loadTime: this.projects.reduce((acc, p) => acc + p.metrics.loadTime, 0) / totalProjects,
      errorRate: this.projects.reduce((acc, p) => acc + p.metrics.errorRate, 0) / totalProjects,
      testCoverage: this.projects.reduce((acc, p) => acc + (p.metrics.testCoverage || 0), 0) / totalProjects,
      lighthouse: {
        performance: this.projects.reduce((acc, p) => acc + (p.metrics.lighthouse?.performance || 0), 0) / totalProjects,
        accessibility: this.projects.reduce((acc, p) => acc + (p.metrics.lighthouse?.accessibility || 0), 0) / totalProjects,
        bestPractices: this.projects.reduce((acc, p) => acc + (p.metrics.lighthouse?.bestPractices || 0), 0) / totalProjects,
        seo: this.projects.reduce((acc, p) => acc + (p.metrics.lighthouse?.seo || 0), 0) / totalProjects
      }
    };
  }
} 