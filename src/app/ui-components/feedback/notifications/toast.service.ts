import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  severity: 'success' | 'info' | 'warning' | 'error';
  summary: string;
  detail?: string;
  duration?: number;
  sticky?: boolean;
  closable?: boolean;
  progressBar?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  private clearSubject = new Subject<void>();

  toast$ = this.toastSubject.asObservable();
  clear$ = this.clearSubject.asObservable();

  show(message: ToastMessage): void {
    this.toastSubject.next({
      closable: true,
      progressBar: true,
      duration: 3000,
      ...message
    });
  }

  success(summary: string, detail?: string): void {
    this.show({ severity: 'success', summary, detail });
  }

  info(summary: string, detail?: string): void {
    this.show({ severity: 'info', summary, detail });
  }

  warning(summary: string, detail?: string): void {
    this.show({ severity: 'warning', summary, detail });
  }

  error(summary: string, detail?: string): void {
    this.show({ severity: 'error', summary, detail });
  }

  clear(): void {
    this.clearSubject.next();
  }
} 