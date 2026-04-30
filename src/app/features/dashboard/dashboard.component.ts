import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  CircleDollarSign, 
  Users, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Bookmark,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Home,
  Search,
  Filter
} from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { StatsService } from '../../core/services/stats.service';
import { LoanService } from '../../core/services/loan.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-12">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-[#7B61FF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#7B61FF]/10 shrink-0">
            <lucide-icon name="trending-up" class="w-6 h-6"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">¡Bienvenido, {{ (authService.currentUser()?.name || '').split(' ')[0] }}! 👋</h1>
            <p class="text-xs text-slate-500 font-medium">Este es el resumen operativo de hoy.</p>
          </div>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative min-w-[280px] group hidden md:block">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <lucide-icon name="search" class="w-4 h-4 text-slate-400 group-focus-within:text-[#7B61FF] transition-colors"></lucide-icon>
            </div>
            <input 
              type="text" 
              placeholder="Buscar préstamo..." 
              class="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-[#7B61FF]/10 focus:border-[#7B61FF] focus:bg-white transition-all outline-none text-[11px] shadow-sm"
            >
          </div>
          <button class="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-[#7B61FF]/10 hover:text-[#7B61FF] transition-all border border-slate-100 shadow-sm">
            <lucide-icon name="filter" class="w-5 h-5"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Main Stats Carousel/Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <!-- Cartera Total (Primary Card) -->
        <div class="bg-[#7B61FF] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-[#7B61FF]/30 relative overflow-hidden group">
          <lucide-icon name="wallet" class="w-32 h-32 absolute -right-6 -bottom-6 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-700"></lucide-icon>
          <div class="flex items-center justify-between mb-8 relative z-10">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <lucide-icon name="wallet" class="w-6 h-6"></lucide-icon>
            </div>
            <div class="flex gap-2">
              <span class="text-[9px] font-black bg-white/20 px-2 py-1 rounded-lg uppercase">Activo</span>
              <span class="text-[9px] font-black bg-white/20 px-2 py-1 rounded-lg uppercase">Total</span>
            </div>
          </div>
          <div class="relative z-10">
            <p class="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Cartera Total</p>
            <h3 class="text-3xl font-black tracking-tight">S/ {{ overallStats()?.total_portfolio || 0 | number:'1.0-0' }}</h3>
            <p class="text-xs text-white/60 mt-4 font-bold">Capital + Interés por cobrar</p>
          </div>
        </div>

        <!-- Recaudación Hoy (Orange Card) -->
        <div class="bg-orange-500 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden group">
          <lucide-icon name="calendar" class="w-32 h-32 absolute -right-6 -bottom-6 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-700"></lucide-icon>
          <div class="flex items-center justify-between mb-8 relative z-10">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <lucide-icon name="calendar" class="w-6 h-6"></lucide-icon>
            </div>
            <span class="text-[9px] font-black bg-white/20 px-2 py-1 rounded-lg uppercase tracking-widest">Prioridad</span>
          </div>
          <div class="relative z-10">
            <p class="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Cobros Hoy</p>
            <h3 class="text-3xl font-black tracking-tight">S/ {{ dailyStats()?.today || 0 | number:'1.0-0' }}</h3>
            <p class="text-xs text-white/60 mt-4 font-bold">Crecimiento: {{ dailyStats()?.growth || 0 | number:'1.1-1' }}%</p>
          </div>
        </div>

        <!-- Ganancia Real (Green Card) -->
        <div class="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-600/20 relative overflow-hidden group">
          <lucide-icon name="trending-up" class="w-32 h-32 absolute -right-6 -bottom-6 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-700"></lucide-icon>
          <div class="flex items-center justify-between mb-8 relative z-10">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <lucide-icon name="trending-up" class="w-6 h-6"></lucide-icon>
            </div>
            <span class="text-[9px] font-black bg-white/20 px-2 py-1 rounded-lg uppercase tracking-widest">Real</span>
          </div>
          <div class="relative z-10">
            <p class="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Ganancia Cobrada</p>
            <h3 class="text-3xl font-black tracking-tight">S/ {{ overallStats()?.total_collected || 0 | number:'1.0-0' }}</h3>
            <p class="text-xs text-white/60 mt-4 font-bold">Efectivo total en caja</p>
          </div>
        </div>

        <!-- Riesgo/Pendiente (Rose Card) -->
        <div class="bg-rose-500 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-rose-500/20 relative overflow-hidden group">
          <lucide-icon name="circle-dollar-sign" class="w-32 h-32 absolute -right-6 -bottom-6 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-700"></lucide-icon>
          <div class="flex items-center justify-between mb-8 relative z-10">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <lucide-icon name="circle-dollar-sign" class="w-6 h-6"></lucide-icon>
            </div>
            <span class="text-[9px] font-black bg-white/20 px-2 py-1 rounded-lg uppercase tracking-widest">Riesgo</span>
          </div>
          <div class="relative z-10">
            <p class="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Por Recuperar</p>
            <h3 class="text-3xl font-black tracking-tight">S/ {{ overallStats()?.total_pending || 0 | number:'1.0-0' }}</h3>
            <p class="text-xs text-white/60 mt-4 font-bold">Meta de recuperación mensual</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <!-- Mini Stats Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 hover:shadow-lg hover:shadow-slate-100 transition-all cursor-pointer group">
              <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <lucide-icon name="calendar" class="w-6 h-6"></lucide-icon>
              </div>
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cobros Hoy</p>
                <p class="text-lg font-black text-emerald-600">S/ {{ dailyStats()?.today || 0 | number:'1.0-0' }}</p>
              </div>
            </div>
            <div class="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 hover:shadow-lg hover:shadow-slate-100 transition-all cursor-pointer group">
              <div class="w-12 h-12 bg-[#7B61FF]/5 text-[#7B61FF] rounded-2xl flex items-center justify-center group-hover:bg-[#7B61FF] group-hover:text-white transition-colors">
                <lucide-icon name="calendar" class="w-6 h-6"></lucide-icon>
              </div>
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acumulado Mes</p>
                <p class="text-lg font-black text-[#7B61FF]">S/ {{ currentMonthTotal() | number:'1.0-0' }}</p>
              </div>
            </div>
          </div>

          <!-- Recent Loans styled like Flutter cards -->
          <div class="space-y-4">
            <div class="flex items-center justify-between mb-2 px-2">
              <h4 class="text-sm font-black text-slate-900 uppercase tracking-widest">Préstamos Recientes</h4>
              <button (click)="router.navigate(['/loans'])" class="text-xs font-bold text-slate-400 hover:text-[#7B61FF] transition-all">Ver todos</button>
            </div>
            
            <div *ngFor="let loan of recentLoans()" class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer" (click)="router.navigate(['/loans', loan.id])">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-[#7B61FF]/5 text-[#7B61FF] rounded-2xl flex items-center justify-center font-black text-lg group-hover:bg-[#7B61FF] group-hover:text-white transition-all">
                  {{ (loan.clientName || loan.client?.name || 'C').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h5 class="font-black text-slate-900 group-hover:text-[#7B61FF] transition-colors">{{ loan.clientName || loan.client?.name || 'Cliente' }}</h5>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Frecuencia: {{ translateFrequency(loan.paymentFrequency || loan.frequency) }}</span>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-black text-[#7B61FF]">S/ {{ loan.amount | number:'1.0-0' }}</p>
                <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 mt-1">Activo</span>
              </div>
            </div>

            <div *ngIf="recentLoans().length === 0" class="bg-white p-12 rounded-[2.5rem] border border-slate-100 border-dashed text-center">
              <div class="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <lucide-icon name="wallet" class="w-8 h-8"></lucide-icon>
              </div>
              <p class="text-slate-400 font-bold">No hay préstamos recientes.</p>
            </div>
          </div>
        </div>

        <!-- Sidebar Actions & Banner -->
        <div class="space-y-6">
          <div class="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
            <lucide-icon name="circle-dollar-sign" class="w-32 h-32 absolute -right-6 -bottom-6 text-white/5 rotate-12"></lucide-icon>
            <h4 class="text-xl font-black mb-8 relative z-10 tracking-tight">Acciones Rápidas</h4>
            <div class="space-y-3 relative z-10">
              <button (click)="router.navigate(['/loans'])" class="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-4 px-6 border border-white/5">
                <lucide-icon name="circle-dollar-sign" class="w-4 h-4"></lucide-icon>
                Nuevo Préstamo
              </button>
              <button (click)="router.navigate(['/clients'])" class="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-4 px-6 border border-white/5">
                <lucide-icon name="users" class="w-4 h-4"></lucide-icon>
                Registrar Cliente
              </button>
              <button (click)="router.navigate(['/rentals'])" class="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-4 px-6 border border-white/5">
                <lucide-icon name="home" class="w-4 h-4"></lucide-icon>
                Gestionar Alquiler
              </button>
              <div class="pt-4">
                <button 
                  *ngIf="authService.hasAuthority('ROLES_VIEW')"
                  (click)="router.navigate(['/rbac'])"
                  class="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 px-6 shadow-xl active:scale-[0.98]"
                >
                  <lucide-icon name="shield-check" class="w-4 h-4"></lucide-icon>
                  Panel de Seguridad
                </button>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-br from-[#7B61FF] to-[#6349E6] p-8 rounded-[2.5rem] text-white shadow-xl shadow-[#7B61FF]/20 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-500">
            <lucide-icon name="trending-up" class="w-32 h-32 absolute -right-8 -bottom-8 text-white/10 rotate-12"></lucide-icon>
            <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
              <lucide-icon name="trending-up" class="w-6 h-6"></lucide-icon>
            </div>
            <h4 class="text-xl font-black mb-2 tracking-tight">Análisis Premium</h4>
            <p class="text-white/70 text-xs font-medium leading-relaxed">Visualiza el crecimiento de tu cartera y el estado detallado de tus cobros en tiempo real.</p>
            <div class="mt-8 flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest">
              <span>Ver estadísticas</span>
              <lucide-icon name="arrow-right" class="w-4 h-4"></lucide-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  statsService = inject(StatsService);
  loanService = inject(LoanService);

  overallStats = signal<any>(null);
  dailyStats = signal<any>(null);
  monthlyStats = signal<any[]>([]);
  recentLoans = signal<any[]>([]);

  currentMonthTotal = computed(() => {
    const currentMonth = new Date().getMonth();
    const stats = this.monthlyStats();
    if (stats && stats[currentMonth]) {
      return stats[currentMonth].paid || 0;
    }
    return 0;
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.statsService.getOverallStats().subscribe(data => this.overallStats.set(data));
    this.statsService.getDailyStats().subscribe(data => this.dailyStats.set(data));
    this.statsService.getMonthlyStats(new Date().getFullYear()).subscribe(data => this.monthlyStats.set(data));
    
    this.loanService.loadLoans().subscribe(loans => {
      this.recentLoans.set(loans.slice(0, 4));
    });
  }

  translateFrequency(freq: string): string {
    switch (freq?.toUpperCase()) {
      case 'DAILY': return 'Diario';
      case 'WEEKLY': return 'Semanal';
      case 'BIWEEKLY': return 'Quincenal';
      case 'MONTHLY': return 'Mensual';
      default: return freq || 'No definida';
    }
  }
}
