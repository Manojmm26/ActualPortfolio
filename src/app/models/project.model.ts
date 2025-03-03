export interface Technology {
  name: string;
  version: string;
}

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

export interface Project {
  id: string;
  title: string;
  description: string;
  stack: Technology[];
  challenges: string[];
  solutions: string[];
  metrics: ProjectMetrics;
  repository: string;
  liveDemo: string;
  caseStudy?: string;
  thumbnail: string;
  images: string[];
  videoUrl?: string;
  featured: boolean;
  completionDate: Date;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile';
  tags: string[];
} 