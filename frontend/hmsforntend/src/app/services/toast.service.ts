import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  public toast$ = this.toastSubject.asObservable();
  private currentTimeout: any = null;

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }
    this.toastSubject.next({ message, type });
    this.currentTimeout = setTimeout(() => {
      this.toastSubject.next(null);
      this.currentTimeout = null;
    }, duration);
  }

  success(message: string, duration: number = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 3000) {
    this.show(message, 'error', duration);
  }

  clear() {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    this.toastSubject.next(null);
  }
}
