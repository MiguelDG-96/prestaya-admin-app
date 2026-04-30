import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Bell, CheckCircle2, AlertTriangle, UserPlus, Info } from 'lucide-angular';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-10">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-[#7B61FF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#7B61FF]/10 shrink-0">
            <lucide-icon name="bell" class="w-6 h-6"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Notificaciones</h1>
            <p class="text-xs text-slate-500 font-medium">Actividades y alertas del sistema.</p>
          </div>
        </div>
        <button 
          *ngIf="notificationService.unreadCount() > 0"
          (click)="markAllAsRead()"
          class="text-[#7B61FF] bg-[#7B61FF]/5 px-6 py-3 rounded-2xl font-black hover:bg-[#7B61FF]/10 transition-all text-xs uppercase tracking-widest"
        >
          Marcar todas como leídas
        </button>
      </div>

      <!-- Notifications List -->
      <div class="space-y-4">
        <div *ngIf="notificationService.loading()" class="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
          <div class="w-12 h-12 border-4 border-[#7B61FF]/20 border-t-[#7B61FF] rounded-full animate-spin"></div>
          <p class="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando notificaciones...</p>
        </div>

        <div *ngIf="!notificationService.loading() && notificationService.notifications().length === 0" class="bg-white rounded-[2rem] border border-slate-100 p-20 text-center shadow-sm">
          <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
            <lucide-icon name="bell" class="w-10 h-10"></lucide-icon>
          </div>
          <h3 class="text-xl font-black text-slate-900 tracking-tight">Todo al día</h3>
          <p class="text-xs text-slate-500 font-medium mt-2">No tienes notificaciones nuevas por el momento.</p>
        </div>

        <div 
          *ngFor="let n of paginatedNotifications()" 
          [class.bg-white]="n.isRead"
          [class.bg-[#7B61FF]/5]="!n.isRead"
          [class.border-[#7B61FF]/10]="!n.isRead"
          class="p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md group relative overflow-hidden"
        >
          <div *ngIf="!n.isRead" class="absolute top-0 left-0 w-1.5 h-full bg-[#7B61FF]"></div>
          
          <div class="flex gap-5">
            <div 
              [class]="getIconBgClass(n.type)"
              class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-black/5"
            >
              <lucide-icon [name]="getIconName(n.type)" [class]="getIconColorClass(n.type)" class="w-6 h-6"></lucide-icon>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h4 [class.font-black]="!n.isRead" [class.font-bold]="n.isRead" class="text-slate-900 text-base leading-tight tracking-tight">{{ n.title }}</h4>
                  <p class="text-xs text-slate-500 font-medium mt-1">{{ n.description }}</p>
                </div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{{ n.createdAt | date:'shortTime' }}</span>
              </div>
              
              <div class="mt-4 flex items-center justify-between">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ n.createdAt | date:'dd MMM, yyyy' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div class="bg-white rounded-[2rem] border border-slate-100 p-6 flex items-center justify-between shadow-sm" *ngIf="totalPages() > 1">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Página {{ currentPage() }} de {{ totalPages() }}
          </p>
          <div class="flex items-center gap-2">
            <button 
              (click)="changePage(currentPage() - 1)"
              [disabled]="currentPage() === 1"
              class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <lucide-icon name="chevron-left" class="w-5 h-5"></lucide-icon>
            </button>
            
            <div class="flex items-center gap-1">
              <button 
                *ngFor="let p of [].constructor(totalPages()); let i = index"
                (click)="changePage(i + 1)"
                [class]="currentPage() === i + 1 ? 'bg-[#7B61FF] text-white shadow-lg shadow-[#7B61FF]/20' : 'text-slate-500 hover:bg-slate-50'"
                class="w-10 h-10 rounded-xl font-black text-xs transition-all"
              >
                {{ i + 1 }}
              </button>
            </div>

            <button 
              (click)="changePage(currentPage() + 1)"
              [disabled]="currentPage() === totalPages()"
              class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <lucide-icon name="chevron-right" class="w-5 h-5"></lucide-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationListComponent implements OnInit {
  notificationService = inject(NotificationService);
  currentPage = signal(1);
  pageSize = 10;

  paginatedNotifications = computed(() => {
    const notifications = this.notificationService.notifications();
    const start = (this.currentPage() - 1) * this.pageSize;
    return notifications.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.ceil(this.notificationService.notifications().length / this.pageSize);
  });

  ngOnInit() {
    this.notificationService.loadNotifications().subscribe();
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  getIconName(type: string): string {
    switch (type) {
      case 'NEW_CLIENT': return 'user-plus';
      case 'PAYMENT': return 'check-circle-2';
      case 'ALERT': return 'alert-triangle';
      default: return 'info';
    }
  }

  getIconBgClass(type: string): string {
    switch (type) {
      case 'NEW_CLIENT': return 'bg-emerald-50';
      case 'PAYMENT': return 'bg-[#7B61FF]/5';
      case 'ALERT': return 'bg-rose-50';
      default: return 'bg-slate-50';
    }
  }

  getIconColorClass(type: string): string {
    switch (type) {
      case 'NEW_CLIENT': return 'text-emerald-600';
      case 'PAYMENT': return 'text-[#7B61FF]';
      case 'ALERT': return 'text-rose-600';
      default: return 'text-slate-600';
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
