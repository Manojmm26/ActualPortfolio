import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, interval } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Extended Performance interface to include memory
interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// Extended PerformanceEntry interfaces
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface FirstInputEntry extends PerformanceEntry {
  processingStart: number;
}

interface ResourceEntry extends PerformanceEntry {
  transferSize?: number;
}

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  jsHeapSize: number; // JavaScript Heap Size
  domNodes: number; // Number of DOM Nodes
  resourceCount: number; // Number of Resources
  resourceSize: number; // Total Resource Size
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metrics = new BehaviorSubject<PerformanceMetrics>({
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    jsHeapSize: 0,
    domNodes: 0,
    resourceCount: 0,
    resourceSize: 0
  });

  constructor() {
    this.initializeMetrics();
    this.startMonitoring();
  }

  private initializeMetrics(): void {
    // First Contentful Paint
    this.observePaint('first-contentful-paint');
    
    // Largest Contentful Paint
    this.observePaint('largest-contentful-paint');
    
    // First Input Delay
    this.observeFirstInput();
    
    // Cumulative Layout Shift
    this.observeLayoutShift();
    
    // Time to First Byte
    this.measureTTFB();
  }

  private startMonitoring(): void {
    // Monitor heap size
    interval(5000).subscribe(() => {
      const perf = performance as ExtendedPerformance;
      if (perf.memory) {
        this.updateMetric('jsHeapSize', perf.memory.usedJSHeapSize);
      }
    });

    // Monitor DOM nodes
    interval(5000).subscribe(() => {
      this.updateMetric('domNodes', document.getElementsByTagName('*').length);
    });

    // Monitor resources
    interval(5000).subscribe(() => {
      const resources = performance.getEntriesByType('resource') as ResourceEntry[];
      this.updateMetric('resourceCount', resources.length);
      this.updateMetric('resourceSize', 
        resources.reduce((total, resource) => total + (resource.transferSize || 0), 0)
      );
    });
  }

  private observePaint(type: string): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.updateMetric(type === 'first-contentful-paint' ? 'fcp' : 'lcp', lastEntry.startTime);
    });

    observer.observe({ entryTypes: ['paint'] });
  }

  private observeFirstInput(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstInput = entries[0] as FirstInputEntry;
      this.updateMetric('fid', firstInput.processingStart - firstInput.startTime);
    });

    observer.observe({ entryTypes: ['first-input'] });
  }

  private observeLayoutShift(): void {
    let cumulativeScore = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) {
        if (!entry.hadRecentInput) {
          cumulativeScore += entry.value;
          this.updateMetric('cls', cumulativeScore);
        }
      }
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }

  private measureTTFB(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.updateMetric('ttfb', navigation.responseStart - navigation.requestStart);
    }
  }

  private updateMetric(key: keyof PerformanceMetrics, value: number): void {
    this.metrics.next({
      ...this.metrics.value,
      [key]: value
    });
  }

  getMetrics(): Observable<PerformanceMetrics> {
    return this.metrics.asObservable();
  }

  getMetric(key: keyof PerformanceMetrics): Observable<number> {
    return this.metrics.pipe(
      map(metrics => metrics[key]),
      distinctUntilChanged()
    );
  }

  getLighthouseScore(): Observable<number> {
    return this.metrics.pipe(
      map(metrics => {
        // Calculate a score based on Core Web Vitals
        const lcpScore = metrics.lcp <= 2500 ? 1 : metrics.lcp <= 4000 ? 0.5 : 0;
        const fidScore = metrics.fid <= 100 ? 1 : metrics.fid <= 300 ? 0.5 : 0;
        const clsScore = metrics.cls <= 0.1 ? 1 : metrics.cls <= 0.25 ? 0.5 : 0;
        
        return ((lcpScore + fidScore + clsScore) / 3) * 100;
      }),
      debounceTime(1000)
    );
  }

  clearMetrics(): void {
    this.metrics.next({
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      jsHeapSize: 0,
      domNodes: 0,
      resourceCount: 0,
      resourceSize: 0
    });
  }
} 