import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService } from './toast.service';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastMessage {
  severity: 'success' | 'info' | 'warning' | 'error';
  summary: string;
  detail?: string;
  duration?: number;
  sticky?: boolean;
  closable?: boolean;
  progressBar?: boolean;
}

interface InternalToastMessage extends ToastMessage {
  progressWidth: number;
  timeoutId?: number;
}

@Component({
  selector: 'ui-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" [class.top-right]="position === 'top-right'">
      <div *ngFor="let message of messages; let i = index"
           class="toast-message"
           [class]="message.severity"
           [@toastAnimation]>
        <div class="toast-content">
          <div class="toast-summary">{{ message.summary }}</div>
          <div *ngIf="message.detail" class="toast-detail">{{ message.detail }}</div>
        </div>
        <button *ngIf="message.closable" 
                class="toast-close" 
                (click)="removeMessage(i)">×</button>
        <div *ngIf="message.progressBar" 
             class="toast-progress"
             [style.width.%]="message.progressWidth"></div>
      </div>
    </div>
  `,
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() position: ToastPosition = 'top-right';

  messages: InternalToastMessage[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe(message => {
      this.showMessage(message);
    });

    this.toastService.clear$.subscribe(() => {
      this.messages = [];
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.messages.forEach(message => {
      if (message.timeoutId) {
        clearTimeout(message.timeoutId);
      }
    });
  }

  private showMessage(message: ToastMessage): void {
    const newMessage: InternalToastMessage = { ...message, progressWidth: 100 };
    this.messages.push(newMessage);

    if (!message.sticky && message.duration) {
      const startTime = Date.now();
      const duration = message.duration;
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const remaining = duration - elapsed;
        
        if (remaining <= 0) {
          this.removeMessage(this.messages.indexOf(newMessage));
        } else {
          newMessage.progressWidth = (remaining / duration) * 100;
          newMessage.timeoutId = window.setTimeout(updateProgress, 10);
        }
      };

      newMessage.timeoutId = window.setTimeout(updateProgress, 10);
    }
  }

  removeMessage(index: number): void {
    const message = this.messages[index];
    if (message?.timeoutId) {
      clearTimeout(message.timeoutId);
    }
    this.messages.splice(index, 1);
  }
} 