import { Component, inject, OnInit, signal, computed, HostListener } from '@angular/core';
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
  Filter,
  ChevronDown,
  Check
} from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { StatsService } from '../../core/services/stats.service';
import { LoanService } from '../../core/services/loan.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
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

  isFilterOpen = signal(false);
  activeTooltip = signal<string | null>(null);
  selectedMonth = signal<number>(new Date().getMonth());
  months = [
    { value: 0, label: 'Enero' },
    { value: 1, label: 'Febrero' },
    { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Mayo' },
    { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' },
    { value: -1, label: 'Todos (Global)' }
  ];

  currentMonthTotal = computed(() => {
    const currentMonth = new Date().getMonth();
    const stats = this.monthlyStats();
    if (stats && stats[currentMonth]) {
      return stats[currentMonth].paid || 0;
    }
    return 0;
  });

  selectedMonthLabel = computed(() => {
    const month = this.months.find(m => m.value === this.selectedMonth());
    return month ? month.label : 'Mes';
  });

  calculatedCapital = computed(() => {
    const month = this.selectedMonth();
    if (month === -1) {
      return this.overallStats()?.capital_otorgado || 0;
    }
    const stats = this.monthlyStats();
    if (stats && stats[month]) {
      return stats[month].capital_otorgado || 0;
    }
    return 0;
  });

  calculatedInterest = computed(() => {
    const month = this.selectedMonth();
    if (month === -1) {
      return this.overallStats()?.interes_recaudado || 0;
    }
    const stats = this.monthlyStats();
    if (stats && stats[month]) {
      return stats[month].interes_recaudado || 0;
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

  toggleFilter() {
    this.isFilterOpen.set(!this.isFilterOpen());
  }

  selectMonth(monthValue: number) {
    this.selectedMonth.set(monthValue);
    this.isFilterOpen.set(false);
  }

  toggleTooltip(id: string, event: Event) {
    event.stopPropagation();
    this.activeTooltip.set(this.activeTooltip() === id ? null : id);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-container')) {
      this.isFilterOpen.set(false);
    }
    if (!target.closest('.tooltip-trigger')) {
      this.activeTooltip.set(null);
    }
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

