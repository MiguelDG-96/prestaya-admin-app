import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { 
  LucideAngularModule, 
  LayoutDashboard, 
  Users, 
  CircleDollarSign, 
  History, 
  ShieldCheck, 
  LogOut, 
  Menu,
  X,
  ChevronRight,
  Bell,
  Home
} from 'lucide-angular';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationDrawerComponent } from './notification-drawer/notification-drawer.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, NotificationDrawerComponent],
  template: `
    <div class="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <!-- Sidebar -->
      <aside 
        [class.w-64]="!isSidebarCollapsed()"
        [class.w-20]="isSidebarCollapsed()"
        [class.translate-x-0]="isMobileMenuOpen()"
        [class.-translate-x-full]="!isMobileMenuOpen() && isMobile()"
        class="fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 transform md:relative md:translate-x-0 flex flex-col shadow-xl md:shadow-none"
      >
        <!-- Logo Section -->
        <div class="p-6 flex items-center gap-3 overflow-hidden h-20 shrink-0">
          <div class="w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden rounded-xl bg-indigo-50 border border-indigo-100">
            <img src="/img/logo/logo-prestaya-angular.png" alt="Logo" class="w-6 h-6 object-contain">
          </div>
          <div [class.opacity-0]="isSidebarCollapsed()" [class.hidden]="isSidebarCollapsed()" class="transition-opacity duration-300 whitespace-nowrap">
            <h1 class="text-xl font-black text-slate-900 tracking-tight">PrestaYa</h1>
            <p class="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">Fintech Panel</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar py-4">
          <ng-container *ngFor="let item of menuItems">
            <a 
              *ngIf="!item.authority || authService.hasAuthority(item.authority)"
              [routerLink]="item.link" 
              routerLinkActive="bg-[#7B61FF] text-white shadow-lg shadow-[#7B61FF]/30"
              [class.justify-center]="isSidebarCollapsed()"
              (click)="closeMobileMenu()"
              class="flex items-center gap-3 px-3 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all group relative"
            >
              <lucide-icon [name]="item.icon" class="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform"></lucide-icon>
              <span [class.hidden]="isSidebarCollapsed()" class="font-bold text-sm transition-all">{{ item.label }}</span>
              
              <!-- Tooltip for Collapsed State -->
              <div *ngIf="isSidebarCollapsed()" class="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                {{ item.label }}
              </div>
            </a>
          </ng-container>

          <div class="pt-6 pb-2 px-4" [class.hidden]="isSidebarCollapsed()">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Sistema</p>
          </div>

          <a 
            *ngIf="authService.hasAuthority('USERS_VIEW')"
            routerLink="/users" 
            routerLinkActive="bg-[#7B61FF] text-white shadow-lg shadow-[#7B61FF]/30"
            [class.justify-center]="isSidebarCollapsed()"
            (click)="closeMobileMenu()"
            class="flex items-center gap-3 px-3 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all group"
          >
            <lucide-icon name="users" class="w-5 h-5 shrink-0"></lucide-icon>
            <span [class.hidden]="isSidebarCollapsed()" class="font-bold text-sm">Usuarios</span>
          </a>

          <a 
            *ngIf="authService.hasAuthority('ROLES_VIEW')"
            routerLink="/rbac" 
            routerLinkActive="bg-[#7B61FF] text-white shadow-lg shadow-[#7B61FF]/30"
            [class.justify-center]="isSidebarCollapsed()"
            (click)="closeMobileMenu()"
            class="flex items-center gap-3 px-3 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all group"
          >
            <lucide-icon name="shield-check" class="w-5 h-5 shrink-0"></lucide-icon>
            <span [class.hidden]="isSidebarCollapsed()" class="font-bold text-sm">Seguridad</span>
          </a>
        </nav>

        <!-- User Section -->
        <div class="p-3 border-t border-slate-100">
          <div [class.flex-col]="isSidebarCollapsed()" class="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100">
            <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-900 font-black border border-slate-200 shadow-sm shrink-0 overflow-hidden">
              <img *ngIf="authService.currentUser()?.photoUrl" [src]="authService.getFullPhotoUrl(authService.currentUser()?.photoUrl)" class="w-full h-full object-cover">
              <span *ngIf="!authService.currentUser()?.photoUrl">{{ authService.currentUser()?.name?.charAt(0) }}</span>
            </div>
            <div [class.hidden]="isSidebarCollapsed()" class="flex-1 min-w-0">
              <p class="text-xs font-black text-slate-900 truncate">{{ authService.currentUser()?.name }}</p>
              <p class="text-[9px] font-bold text-slate-400 uppercase truncate">{{ authService.currentUser()?.role }}</p>
            </div>
          </div>
          <button 
            (click)="logout()"
            [class.justify-center]="isSidebarCollapsed()"
            class="mt-3 w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-black text-xs"
          >
            <lucide-icon name="log-out" class="w-4 h-4 shrink-0"></lucide-icon>
            <span [class.hidden]="isSidebarCollapsed()">Salir del Panel</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <!-- Header -->
        <header class="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40">
          <div class="flex items-center gap-4">
            <button (click)="toggleSidebar()" class="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-100">
              <lucide-icon [name]="isMobile() ? (isMobileMenuOpen() ? 'x' : 'menu') : 'menu'" class="w-5 h-5"></lucide-icon>
            </button>
            <h2 class="text-lg font-black text-slate-900 hidden sm:block tracking-tight">Panel Administrativo</h2>
          </div>

          <div class="flex items-center gap-3">
            <button 
              (click)="isNotificationDrawerOpen.set(true)"
              class="relative w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
            >
              <lucide-icon name="bell" class="w-5 h-5"></lucide-icon>
              <div *ngIf="notificationService.unreadCount() > 0" class="absolute -top-1 -right-1 min-w-[20px] h-5 bg-rose-500 rounded-full border-2 border-white text-[10px] font-black text-white flex items-center justify-center px-1">
                {{ notificationService.unreadCount() }}
              </div>
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <router-outlet></router-outlet>
        </div>

        <!-- Mobile Overlay -->
        <div 
          *ngIf="isMobile() && isMobileMenuOpen()" 
          (click)="closeMobileMenu()"
          class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] animate-in fade-in duration-300"
        ></div>
      </main>

      <!-- Notification Drawer -->
      <app-notification-drawer 
        [open]="isNotificationDrawerOpen()"
        (close)="isNotificationDrawerOpen.set(false)"
      ></app-notification-drawer>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  `]
})
export class AdminLayoutComponent implements OnInit {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);
  
  isSidebarCollapsed = signal(false);
  isMobileMenuOpen = signal(false);
  isNotificationDrawerOpen = signal(false);

  menuItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', link: '/dashboard' },
    { label: 'Préstamos', icon: 'circle-dollar-sign', link: '/loans', authority: 'LOANS_VIEW' },
    { label: 'Clientes', icon: 'users', link: '/clients', authority: 'CLIENTS_VIEW' },
    { label: 'Alquileres', icon: 'home', link: '/rentals', authority: 'RENTALS_VIEW' },
    { label: 'Inquilinos', icon: 'users', link: '/tenants', authority: 'TENANTS_VIEW' }
  ];

  ngOnInit() {
    this.notificationService.loadNotifications().subscribe();
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    if (window.innerWidth < 768) {
      this.isSidebarCollapsed.set(false);
    }
  }

  isMobile() {
    return window.innerWidth < 768;
  }

  toggleSidebar() {
    if (this.isMobile()) {
      this.isMobileMenuOpen.update(v => !v);
    } else {
      this.isSidebarCollapsed.update(v => !v);
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
