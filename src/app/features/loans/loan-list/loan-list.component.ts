import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule, 
  Search, 
  Plus, 
  CircleDollarSign, 
  Calendar, 
  TrendingUp, 
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Wallet,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  ChevronDown,
  X,
  History,
  ArrowRight,
  ShieldCheck,
  Circle,
  RefreshCw,
  Edit2,
  Banknote
} from 'lucide-angular';
import { LoanService } from '../../../core/services/loan.service';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { Loan, LoanCreateRequest } from '../../../core/models/loan.model';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-10">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-[#7B61FF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#7B61FF]/10 shrink-0">
            <lucide-icon name="circle-dollar-sign" class="w-6 h-6"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Cartera de Préstamos</h1>
            <p class="text-xs text-slate-500 font-medium">Control de créditos y cobranzas.</p>
          </div>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative min-w-[280px] group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <lucide-icon name="search" class="w-4 h-4 text-slate-400 group-focus-within:text-[#7B61FF] transition-colors"></lucide-icon>
            </div>
            <input 
              type="text" 
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
              placeholder="Buscar por cliente o ID..." 
              class="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-[#7B61FF]/10 focus:border-[#7B61FF] focus:bg-white transition-all outline-none text-[11px] shadow-sm"
            >
          </div>
          <div class="relative min-w-[180px] group">
            <select 
              [ngModel]="selectedDay()"
              (ngModelChange)="selectedDay.set($event)"
              class="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-4 pr-10 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-[#7B61FF]/10 focus:border-[#7B61FF] focus:bg-white transition-all outline-none text-[11px] shadow-sm appearance-none"
            >
              <option value="">Todos los días</option>
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miércoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
              <option value="6">Sábado</option>
              <option value="0">Domingo</option>
            </select>
            <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <lucide-icon name="calendar" class="w-4 h-4 text-slate-400"></lucide-icon>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button 
              (click)="refreshData()"
              class="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-[#7B61FF]/10 hover:text-[#7B61FF] transition-all border border-slate-100"
              title="Refrescar datos"
            >
              <lucide-icon name="refresh-cw" [class.animate-spin]="isRefreshing()" class="w-5 h-5"></lucide-icon>
            </button>
            <button 
              routerLink="/loans/new"
              class="bg-[#7B61FF] text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-[#6349E6] hover:shadow-lg transition-all text-xs"
            >
              <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
              Nuevo Préstamo
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white border border-slate-100 p-5 rounded-[1.5rem] shadow-sm flex items-center gap-4">
          <div class="w-11 h-11 bg-[#7B61FF]/5 text-[#7B61FF] rounded-xl flex items-center justify-center">
            <lucide-icon name="trending-up" class="w-6 h-6"></lucide-icon>
          </div>
          <div>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total en Calle</p>
            <p class="text-xl font-black text-slate-900">S/ {{ totalOnStreet() | number:'1.0-0' }}</p>
          </div>
        </div>
        <div class="bg-white border border-slate-100 p-5 rounded-[1.5rem] shadow-sm flex items-center gap-4">
          <div class="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <lucide-icon name="clock" class="w-6 h-6"></lucide-icon>
          </div>
          <div>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pendientes</p>
            <p class="text-xl font-black text-slate-900">{{ pendingLoansCount() }} Créditos</p>
          </div>
        </div>
        <div class="bg-white border border-slate-100 p-5 rounded-[1.5rem] shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div class="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <lucide-icon name="check-circle-2" class="w-6 h-6"></lucide-icon>
          </div>
          <div>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Cobros Hoy</p>
            <p class="text-xl font-black text-slate-900">S/ 2,450</p>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden relative min-h-[400px]">
        <!-- Loading State -->
        <div *ngIf="loanService.loading()" class="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <lucide-icon name="loader-2" class="w-10 h-10 text-[#7B61FF] animate-spin mb-4"></lucide-icon>
          <p class="text-xs font-black text-slate-900 uppercase tracking-widest">Cargando préstamos...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loanService.loading() && filteredLoans().length === 0" class="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
            <lucide-icon name="circle-dollar-sign" class="w-10 h-10"></lucide-icon>
          </div>
          <h3 class="text-xl font-black text-slate-900 tracking-tight">No hay préstamos</h3>
          <p class="text-xs text-slate-500 font-medium mt-2 max-w-xs mx-auto">No se encontraron créditos que coincidan con tu búsqueda o aún no has registrado ninguno.</p>
        </div>

        <div class="overflow-x-auto" *ngIf="filteredLoans().length > 0">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Amortización</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Vencimiento</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let loan of paginatedLoans()" class="hover:bg-slate-50/50 transition-colors group">
                <td class="p-6">
                  <div class="flex items-center gap-4">
                    <div [routerLink]="['/loans', loan.id]" class="w-10 h-10 bg-[#7B61FF]/5 text-[#7B61FF] rounded-xl flex items-center justify-center font-black cursor-pointer hover:bg-[#7B61FF] hover:text-white transition-colors">
                      <lucide-icon name="wallet" class="w-5 h-5"></lucide-icon>
                    </div>
                    <div [routerLink]="['/loans', loan.id]" class="cursor-pointer overflow-hidden">
                      <p class="font-black text-slate-900 text-sm truncate max-w-[150px]">{{ loan.clientName || loan.client?.name || 'Cliente' }}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">S/ {{ loan.amount | number:'1.0-0' }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-6">
                  <div class="w-40">
                    <div class="flex items-center justify-between text-[9px] font-black uppercase mb-1.5">
                      <span class="text-[#7B61FF]">S/ {{ (loan.amountPaid || 0) | number:'1.0-0' }}</span>
                      <span class="text-slate-400">{{ loan.paidInstallments || 0 }}/{{ loan.totalInstallments }}</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-[#7B61FF] rounded-full transition-all duration-1000" [style.width.%]="((loan.amountPaid || 0) / (loan.totalToPay || 1)) * 100"></div>
                    </div>
                  </div>
                </td>
                <td class="p-6 text-xs font-bold text-slate-600">
                  {{ loan.dueDate | date:'dd MMM' }}
                </td>
                <td class="p-6 text-center">
                  <span [class]="loan.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'"
                        class="px-3 py-1 rounded-full text-[8px] font-black uppercase border tracking-tighter">
                    {{ loan.status === 'PAID' ? 'PAGADO' : 'VIGENTE' }}
                  </span>
                </td>
                <td class="p-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      *ngIf="loan.status !== 'PAID'" 
                      (click)="openPaymentModal(loan)" 
                      class="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-[#7B61FF] transition-all shadow-sm"
                      title="Registrar Cobro"
                    >
                      <lucide-icon name="banknote" class="w-3.5 h-3.5"></lucide-icon>
                    </button>
                    <button 
                      *ngIf="authService.hasAuthority('LOANS_UPDATE')"
                      [routerLink]="['/loans/edit', loan.id]"
                      class="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-[#7B61FF]/10 hover:text-[#7B61FF] transition-all border border-slate-100"
                      title="Editar Préstamo"
                    >
                      <lucide-icon name="edit-2" class="w-3.5 h-3.5"></lucide-icon>
                    </button>
                    <button 
                      [routerLink]="['/loans', loan.id]" 
                      class="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-all border border-slate-100"
                      title="Ver Detalles y Cronograma"
                    >
                      <lucide-icon name="history" class="w-3.5 h-3.5"></lucide-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination Controls -->
          <div class="p-6 border-t border-slate-50 flex items-center justify-between bg-white">
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

      <!-- Create Loan Modal (Optimized) -->
      <div *ngIf="showCreateModal()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300" (click)="showCreateModal.set(false)"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 relative z-10 animate-in zoom-in-95 duration-300 border border-white/20 max-h-[95vh] overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                <lucide-icon name="circle-dollar-sign" class="w-6 h-6"></lucide-icon>
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-900 tracking-tight">{{ isEditing() ? 'Actualizar Préstamo' : 'Nuevo Préstamo' }}</h3>
                <p class="text-xs text-slate-500 font-medium mt-0.5">{{ isEditing() ? 'Modifica las condiciones del crédito.' : 'Configura las condiciones del crédito.' }}</p>
              </div>
            </div>
            <button (click)="showCreateModal.set(false)" class="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-900 transition-all">
              <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
            </button>
          </div>
          
          <form (submit)="saveLoan()" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="sm:col-span-2">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Cliente</label>
                <div class="relative">
                  <select [ngModel]="clientId()" (ngModelChange)="clientId.set($event)" name="clientId" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-slate-900 outline-none focus:border-emerald-400 focus:bg-white transition-all appearance-none">
                    <option value="">Seleccionar cliente...</option>
                    <option *ngFor="let client of clientService.clients()" [value]="client.id">{{ client.name }} ({{ client.dni }})</option>
                  </select>
                  <lucide-icon name="chevron-down" class="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></lucide-icon>
                </div>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Monto Capital (S/)</label>
                <input type="number" [ngModel]="amount()" (ngModelChange)="amount.set($event)" name="amount" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-emerald-400 focus:bg-white transition-all">
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Interés Mensual (%)</label>
                <input type="number" [ngModel]="interestRate()" (ngModelChange)="interestRate.set($event)" name="interestRate" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-emerald-400 focus:bg-white transition-all">
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Cuotas</label>
                <input type="number" [ngModel]="totalInstallments()" (ngModelChange)="totalInstallments.set($event)" name="totalInstallments" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-emerald-400 focus:bg-white transition-all">
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Frecuencia</label>
                <div class="relative">
                  <select [ngModel]="paymentFrequency()" (ngModelChange)="paymentFrequency.set($event)" name="paymentFrequency" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-emerald-400 focus:bg-white transition-all appearance-none">
                    <option value="DAILY">Diario</option>
                    <option value="WEEKLY">Semanal</option>
                    <option value="BIWEEKLY">Quincenal</option>
                    <option value="MONTHLY">Mensual</option>
                  </select>
                  <lucide-icon name="chevron-down" class="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></lucide-icon>
                </div>
              </div>
            </div>

            <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center gap-3" *ngIf="amount() > 0">
              <div class="text-center">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Proyectado</p>
                <p class="text-2xl font-black text-emerald-600">S/ {{ totalToPay() | number:'1.2-2' }}</p>
              </div>
              <button type="button" (click)="showSimulationModal.set(true)" class="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-black text-[10px] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm uppercase">
                <lucide-icon name="calculator" class="w-3.5 h-3.5"></lucide-icon>
                Simular Cronograma
              </button>
            </div>

            <div class="flex gap-4 pt-6 border-t border-slate-100">
              <button type="button" (click)="showCreateModal.set(false)" class="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-all text-xs">Cancelar</button>
              <button type="submit" [disabled]="isSaving() || !clientId()" class="flex-[1.5] bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-emerald-100 text-xs uppercase">
                <lucide-icon *ngIf="isSaving()" name="loader-2" class="w-4 h-4 animate-spin"></lucide-icon>
                {{ isSaving() ? 'Guardando...' : (isEditing() ? 'Actualizar Crédito' : 'Finalizar Crédito') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Simulation Modal (Optimized) -->
      <div *ngIf="showSimulationModal()" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-lg transition-all duration-500" (click)="showSimulationModal.set(false)"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative z-10 animate-in zoom-in-95 duration-300 border border-white/20 flex flex-col max-h-[90vh]">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <lucide-icon name="calculator" class="w-5 h-5"></lucide-icon>
              </div>
              <h3 class="text-xl font-black text-slate-900 tracking-tight">Simulación</h3>
            </div>
            <button (click)="showSimulationModal.set(false)" class="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-900 transition-all">
              <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
            </button>
          </div>
          <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p class="text-[8px] font-black text-slate-400 uppercase mb-0.5">Cuota</p>
              <p class="text-sm font-black text-slate-900">S/ {{ installmentAmount() | number:'1.2-2' }}</p>
            </div>
            <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
              <p class="text-[8px] font-black text-emerald-800 uppercase mb-0.5">Total</p>
              <p class="text-sm font-black text-emerald-600">S/ {{ totalToPay() | number:'1.2-2' }}</p>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            <div *ngFor="let inst of simulatedInstallments(); let i = index" class="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black uppercase group hover:bg-white transition-all">
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-slate-400">#{{ i + 1 }}</span>
                <span class="text-slate-600 tracking-tight">{{ inst.dueDate | date:'dd MMM, yyyy' }}</span>
              </div>
              <span class="text-slate-900">S/ {{ inst.amount | number:'1.2-2' }}</span>
            </div>
          </div>
          <button (click)="showSimulationModal.set(false)" class="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs hover:bg-emerald-600 transition-all">Entendido</button>
        </div>
      </div>

      <!-- Details Modal (Optimized) -->
      <div *ngIf="showDetailsModal()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-all duration-300" (click)="showDetailsModal.set(false)"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 relative z-10 animate-in zoom-in-95 duration-300 border border-white/20 flex flex-col max-h-[90vh]">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <lucide-icon name="history" class="w-6 h-6"></lucide-icon>
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-900 tracking-tight">Cronograma</h3>
                <p class="text-xs text-slate-500 font-medium">{{ selectedLoan()?.client?.name }}</p>
              </div>
            </div>
            <button (click)="showDetailsModal.set(false)" class="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-900 transition-all">
              <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
            </button>
          </div>

          <div class="grid grid-cols-3 gap-3 mb-8">
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p class="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-tighter">Inversión</p>
              <p class="text-xs font-black text-slate-900">S/ {{ selectedLoan()?.amount | number:'1.0-0' }}</p>
            </div>
            <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
              <p class="text-[8px] font-black text-emerald-800 uppercase mb-0.5 tracking-tighter">Cobrado</p>
              <p class="text-xs font-black text-emerald-600">S/ {{ (selectedLoan()?.amountPaid || 0) | number:'1.0-0' }}</p>
            </div>
            <div class="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
              <p class="text-[8px] font-black text-amber-800 uppercase mb-0.5 tracking-tighter">Pendiente</p>
              <p class="text-xs font-black text-amber-600">S/ {{ ((selectedLoan()?.totalToPay || 0) - (selectedLoan()?.amountPaid || 0)) | number:'1.0-0' }}</p>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            <div *ngFor="let inst of getLoanSchedule(selectedLoan()); let i = index" 
                 class="flex items-center justify-between p-4 rounded-2xl border transition-all"
                 [class]="inst.isPaid ? 'bg-emerald-50 border-emerald-100 opacity-60' : 'bg-slate-50 border-slate-100'">
              <div class="flex items-center gap-4">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
                     [class]="inst.isPaid ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'">
                  {{ i + 1 }}
                </div>
                <div>
                  <p class="text-[8px] font-black uppercase tracking-widest mb-0.5" [class]="inst.isPaid ? 'text-emerald-700' : 'text-slate-400'">
                    {{ inst.isPaid ? 'Pagada' : 'Pendiente' }}
                  </p>
                  <p class="font-black text-slate-900 text-xs tracking-tight">{{ inst.dueDate | date:'dd MMM yyyy' }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-black tracking-tight" [class]="inst.isPaid ? 'text-emerald-600' : 'text-slate-900'">
                  S/ {{ inst.amount | number:'1.2-2' }}
                </p>
              </div>
            </div>
          </div>
          <button (click)="showDetailsModal.set(false)" class="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs hover:bg-emerald-600 transition-all shadow-lg active:scale-95">Cerrar Historial</button>
        </div>
      </div>

      <!-- Payment Modal (Optimized) -->
      <div *ngIf="showPaymentModal()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300" (click)="showPaymentModal.set(false)"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 relative z-10 animate-in zoom-in-95 duration-300 border border-white/20">
          <div class="mb-6 text-center">
            <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <lucide-icon name="wallet" class="w-8 h-8"></lucide-icon>
            </div>
            <h3 class="text-xl font-black text-slate-900 tracking-tight">Registrar Cobro</h3>
            <p class="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wide">{{ selectedLoanForPayment()?.client?.name }}</p>
          </div>
          <div class="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100 text-center">
            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Sugerido</p>
            <p class="text-3xl font-black text-slate-900 tracking-tighter">S/ {{ paymentAmount | number:'1.2-2' }}</p>
          </div>
          <div class="space-y-5">
            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Monto Recibido</label>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">S/</span>
                <input type="number" [(ngModel)]="paymentAmount" class="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-4 font-black text-slate-900 text-xl outline-none focus:border-emerald-400 focus:bg-white transition-all tracking-tight">
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button (click)="showPaymentModal.set(false)" class="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-all text-xs">Cerrar</button>
              <button (click)="confirmPayment()" [disabled]="isSaving()" class="flex-[1.5] bg-emerald-600 text-white py-4 rounded-xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg text-xs uppercase">
                <lucide-icon *ngIf="isSaving()" name="loader-2" class="w-4 h-4 animate-spin"></lucide-icon>
                {{ isSaving() ? 'Cobrando...' : 'Confirmar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
    input::-webkit-search-decoration,
    input::-webkit-search-cancel-button,
    input::-webkit-search-results-button,
    input::-webkit-search-results-decoration { display: none; }
  `]
})
export class LoanListComponent implements OnInit {
  loanService = inject(LoanService);
  clientService = inject(ClientService);
  authService = inject(AuthService);
  
  searchTerm = signal('');
  selectedDay = signal('');
  showCreateModal = signal(false);
  showPaymentModal = signal(false);
  showSimulationModal = signal(false);
  showDetailsModal = signal(false);
  isSaving = signal(false);
  isRefreshing = signal(false);
  isEditing = signal(false);
  selectedLoanId = signal<string | null>(null);
  
  selectedLoan = signal<Loan | null>(null);
  selectedLoanForPayment = signal<Loan | null>(null);
  payments = signal<any[]>([]);
  paymentAmount = 0;

  clientId = signal('');
  amount = signal(0);
  interestRate = signal(20);
  totalInstallments = signal(24);
  startDate = signal(new Date().toISOString().split('T')[0]);
  paymentFrequency = signal<'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'BIWEEK' | 'MONTHLY'>('DAILY');

  totalToPay = computed(() => {
    const amt = this.amount() || 0;
    const rate = this.interestRate() || 0;
    const interest = amt * (rate / 100);
    return amt + interest;
  });

  installmentAmount = computed(() => {
    const total = this.totalToPay();
    const inst = this.totalInstallments() || 1;
    return total / inst;
  });

  simulatedInstallments = computed(() => {
    return this.generateSchedule(this.startDate(), this.installmentAmount(), this.totalInstallments(), this.paymentFrequency());
  });

  currentPage = signal(1);
  pageSize = 10;

  paginatedLoans = computed(() => {
    const loans = this.filteredLoans();
    const start = (this.currentPage() - 1) * this.pageSize;
    return loans.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredLoans().length / this.pageSize);
  });

  constructor() {
    effect(() => {
      this.searchTerm();
      this.currentPage.set(1);
    });
  }

  ngOnInit() {
    this.loanService.loadLoans().subscribe();
    this.clientService.loadClients().subscribe();
  }

  private generateSchedule(startStr: string, instAmount: number, totalInst: number, freq: string) {
    const installments = [];
    const start = new Date(startStr);
    for (let i = 1; i <= totalInst; i++) {
      const dueDate = new Date(start);
      if (freq === 'DAILY') {
        dueDate.setDate(start.getDate() + i);
      } else if (freq === 'WEEKLY') {
        dueDate.setDate(start.getDate() + (i * 7));
      } else if (freq === 'BIWEEKLY' || freq === 'BIWEEK') {
        dueDate.setDate(start.getDate() + (i * 15));
      } else if (freq === 'MONTHLY') {
        dueDate.setMonth(start.getMonth() + i);
      }
      installments.push({ month: i, dueDate: dueDate, amount: instAmount });
    }
    return installments;
  }

  getLoanSchedule(loan: Loan | null) {
    if (!loan) return [];
    const amt = loan.amount || 0;
    const rate = loan.interestRate || 0;
    const interest = amt * (rate > 1 ? rate / 100 : rate);
    const total = amt + interest;
    const instAmt = total / (loan.totalInstallments || 1);
    
    const schedule = this.generateSchedule(loan.startDate || new Date().toISOString(), instAmt, loan.totalInstallments || 0, loan.paymentFrequency || loan.frequency || 'DAILY');
    return schedule.map((inst, index) => ({
      ...inst,
      isPaid: index < (loan.paidInstallments || 0)
    }));
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.selectedLoanId.set(null);
    this.resetForm();
    this.showCreateModal.set(true);
  }

  openEditModal(loan: Loan) {
    this.isEditing.set(true);
    this.selectedLoanId.set(loan.id);
    this.clientId.set(loan.client?.id || '');
    this.amount.set(loan.amount);
    this.interestRate.set((loan.interestRate || 0) * 100);
    this.totalInstallments.set(loan.totalInstallments);
    this.startDate.set(loan.startDate || new Date().toISOString().split('T')[0]);
    this.paymentFrequency.set(loan.paymentFrequency || loan.frequency || 'DAILY');
    this.showCreateModal.set(true);
  }

  refreshData() {
    this.isRefreshing.set(true);
    this.loanService.loadLoans().subscribe({
      next: () => this.isRefreshing.set(false),
      error: () => this.isRefreshing.set(false)
    });
  }

  filteredLoans = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const day = this.selectedDay();
    return this.loanService.loans().filter(l => {
      const matchesTerm = (l.clientName || '').toLowerCase().includes(term) ||
        (l.client?.name || '').toLowerCase().includes(term) || 
        (l.id || '').toLowerCase().includes(term);

      if (!matchesTerm) return false;

      if (day && day !== '') {
        const dateToUse = l.dueDate ? new Date(l.dueDate) : (l.startDate ? new Date(l.startDate) : null);
        if (dateToUse) {
          // Ajustamos para comparar con getDay(): 0 = Domingo, 1 = Lunes, etc.
          return dateToUse.getDay() === parseInt(day, 10);
        }
        return false;
      }
      return true;
    });
  });

  totalOnStreet = computed(() => {
    return this.loanService.loans().reduce((acc, l) => acc + ((l.totalToPay || 0) - (l.amountPaid || 0)), 0);
  });

  pendingLoansCount = computed(() => {
    return this.loanService.loans().filter(l => l.status !== 'PAID').length;
  });

  openDetailsModal(loan: Loan) {
    this.selectedLoan.set(loan);
    this.showDetailsModal.set(true);
    this.loanService.getPayments(loan.id).subscribe(p => this.payments.set(p));
  }

  saveLoan() {
    this.isSaving.set(true);
    const requestData: LoanCreateRequest = {
      clientId: this.clientId(),
      amount: this.amount(),
      interestRate: this.interestRate(),
      totalInstallments: this.totalInstallments(),
      startDate: this.startDate(),
      paymentFrequency: (this.paymentFrequency() || 'DAILY').toUpperCase() as any
    };

    const obs = this.isEditing() && this.selectedLoanId()
      ? this.loanService.updateLoan(this.selectedLoanId()!, requestData as any)
      : this.loanService.createLoan(requestData);

    obs.subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.isSaving.set(false);
        this.resetForm();
        this.refreshData();
      },
      error: () => this.isSaving.set(false)
    });
  }

  resetForm() {
    this.clientId.set('');
    this.amount.set(0);
    this.interestRate.set(20);
    this.totalInstallments.set(24);
    this.startDate.set(new Date().toISOString().split('T')[0]);
    this.paymentFrequency.set('DAILY');
  }

  openPaymentModal(loan: Loan) {
    this.selectedLoanForPayment.set(loan);
    const suggested = (loan.totalToPay || 0) / (loan.totalInstallments || 1);
    this.paymentAmount = suggested;
    this.showPaymentModal.set(true);
  }

  confirmPayment() {
    const loan = this.selectedLoanForPayment();
    if (!loan) return;
    this.isSaving.set(true);
    this.loanService.registerPayment({
      loanId: loan.id,
      amount: this.paymentAmount,
      note: 'Cobro realizado desde Panel Admin'
    }).subscribe({
      next: () => {
        this.showPaymentModal.set(false);
        this.isSaving.set(false);
        this.loanService.loadLoans().subscribe();
      },
      error: () => this.isSaving.set(false)
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
