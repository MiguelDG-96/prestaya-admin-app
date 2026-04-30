import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-drawer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Overlay -->
    <div 
      *ngIf="isOpen()" 
      class="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] transition-opacity animate-in fade-in duration-300"
      (click)="close.emit()"
    ></div>

    <!-- Drawer -->
    <div 
      [class.translate-x-0]="isOpen()"
      [class.translate-x-full]="!isOpen()"
      class="fixed top-0 right-0 h-full w-full max-w-md bg-white/70 backdrop-blur-2xl border-l border-white/30 z-[70] shadow-2xl transition-transform duration-500 ease-out flex flex-col"
    >
      <!-- Liquid Glass Accent -->
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
      <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>

      <!-- Header -->
      <div class="p-8 flex items-center justify-between border-b border-white/20 relative z-10">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Notificaciones
            <span *ngIf="notificationService.unreadCount() > 0" class="flex h-6 px-2 items-center justify-center bg-indigo-600 text-white text-[10px] font-black rounded-full">
              {{ notificationService.unreadCount() }}
            </span>
          </h2>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Actividad Reciente</p>
        </div>
        <button 
          (click)="close.emit()"
          class="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/50 text-slate-400 hover:text-slate-900 hover:bg-white transition-all border border-white/50"
        >
          <lucide-icon name="x" class="w-6 h-6"></lucide-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar relative z-10">
        <div *ngIf="notificationService.loading()" class="flex flex-col items-center justify-center h-64">
          <div class="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>

        <div *ngIf="!notificationService.loading() && notificationService.notifications().length === 0" class="flex flex-col items-center justify-center h-64 text-center opacity-50">
          <lucide-icon name="bell" class="w-16 h-16 mb-4 text-slate-300"></lucide-icon>
          <p class="font-black text-slate-400 uppercase tracking-widest text-xs">Sin notificaciones</p>
        </div>

        <div 
          *ngFor="let n of notificationService.notifications()" 
          class="group p-5 rounded-[2rem] border border-white/40 bg-white/40 hover:bg-white/80 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden"
        >
          <div *ngIf="!n.isRead" class="absolute top-4 right-4 w-2 h-2 bg-indigo-600 rounded-full ring-4 ring-indigo-600/10"></div>
          
          <div class="flex gap-4">
            <div [class]="getIconBgClass(n.type)" class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/50 shadow-inner">
              <lucide-icon [name]="getIconName(n.type)" [class]="getIconColorClass(n.type)" class="w-5 h-5"></lucide-icon>
            </div>
            
            <div class="flex-1 min-w-0">
              <h4 [class.font-black]="!n.isRead" [class.font-bold]="n.isRead" class="text-slate-900 text-sm leading-tight mb-1">{{ n.title }}</h4>
              <p class="text-xs text-slate-500 font-medium line-clamp-2">{{ n.description }}</p>
              <div class="mt-3 flex items-center justify-between">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ n.createdAt | date:'shortTime' }}</span>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ n.createdAt | date:'dd MMM' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-8 border-t border-white/20 bg-white/30 relative z-10">
        <button 
          (click)="notificationService.markAllAsRead().subscribe()"
          class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
        >
          <lucide-icon name="check" class="w-5 h-5"></lucide-icon>
          Marcar todo como leído
        </button>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
  `]
})
export class NotificationDrawerComponent {
  notificationService = inject(NotificationService);
  
  isOpen = signal(false);
  @Input() set open(value: boolean) { this.isOpen.set(value); }
  @Output() close = new EventEmitter<void>();

  getIconName(type: string): string {
    switch (type) {
      case 'NEW_CLIENT': return 'user-plus';
      case 'PAYMENT': return 'circle-dollar-sign';
      case 'ALERT': return 'alert-triangle';
      default: return 'info';
    }
  }

  getIconBgClass(type: string): string {
    switch (type) {
      case 'NEW_CLIENT': return 'bg-emerald-50';
      case 'PAYMENT': return 'bg-indigo-50';
      case 'ALERT': return 'bg-rose-50';
      default: return 'bg-slate-50';
    }
  }

  getIconColorClass(type: string): string {
    switch (type) {
      case 'NEW_CLIENT': return 'text-emerald-600';
      case 'PAYMENT': return 'text-indigo-600';
      case 'ALERT': return 'text-rose-600';
      default: return 'text-slate-600';
    }
  }
}
