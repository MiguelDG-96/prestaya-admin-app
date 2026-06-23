import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { 
  LucideAngularModule, 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  User, 
  TrendingUp, 
  CheckCircle2, 
  Wallet, 
  Clock, 
  Calendar,
  Info,
  Loader2,
  Percent,
  Layers,
  ArrowUpRight,
  Plus
} from 'lucide-angular';
import { LoanService } from '../../../core/services/loan.service';
import { AuthService } from '../../../core/services/auth.service';
import { Loan } from '../../../core/models/loan.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-20 px-4 max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-6">
        <div class="flex items-center gap-5">
          <button 
            routerLink="/loans"
            class="w-12 h-12 bg-white text-slate-400 rounded-2xl flex items-center justify-center hover:bg-[#7B61FF]/10 hover:text-[#7B61FF] transition-all border border-slate-100 shadow-sm active:scale-90"
          >
            <lucide-icon name="arrow-left" class="w-6 h-6"></lucide-icon>
          </button>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Sistema de Auditoría v2</span>
              <span class="text-[10px] text-slate-400 font-bold tracking-tighter">Sync: OK</span>
            </div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Detalle del Préstamo</h1>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">{{ loan()?.clientName || loan()?.client?.name }} • Ref. {{ loan()?.id?.substring(0,8) }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-3">
            <div class="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Modo Protección de Fechas Activo</span>
          </div>
          <button 
            *ngIf="authService.hasAuthority('PRESTAMOS_UPDATE')"
            (click)="editLoan()"
            class="w-12 h-12 bg-white text-[#7B61FF] rounded-2xl flex items-center justify-center hover:bg-[#7B61FF] hover:text-white transition-all border border-[#7B61FF]/10 shadow-sm active:scale-90"
            title="Editar préstamo"
          >
            <lucide-icon name="edit-2" class="w-5 h-5"></lucide-icon>
          </button>
          <button 
            *ngIf="authService.hasAuthority('PRESTAMOS_DELETE')"
            (click)="showDeleteConfirm.set(true)"
            class="w-12 h-12 bg-white text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm active:scale-90"
            title="Eliminar préstamo"
          >
            <lucide-icon name="trash-2" class="w-5 h-5"></lucide-icon>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Main Info Card -->
        <div class="lg:col-span-2 space-y-10">
          <div class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-[#7B61FF]/20 to-indigo-500/20 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div class="relative bg-white/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-xl shadow-[#7B61FF]/5 overflow-hidden">
              <div class="relative z-10">
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div class="space-y-5">
                    <div>
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cliente Titular</p>
                      <h2 class="text-2xl font-black text-slate-900 tracking-tight">{{ loan()?.clientName || loan()?.client?.name }}</h2>
                      <p class="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-tight">Estado de Cartera • {{ isLoanFullyPaid() ? 'Finalizado' : 'En curso' }}</p>
                    </div>
                    
                    <div class="flex flex-wrap gap-3">
                      <div class="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/20">
                        <lucide-icon name="wallet" class="w-4 h-4 text-[#7B61FF]"></lucide-icon>
                        Capital: S/ {{ loan()?.amount | number:'1.0-0' }}
                      </div>
                      <div [class]="isLoanFullyPaid() ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'"
                            class="px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all">
                        <div class="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        {{ isLoanFullyPaid() ? 'Totalmente Pagado' : 'Pendiente de Cobro' }}
                      </div>
                    </div>
                  </div>

                  <div class="text-left md:text-right">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total a Recaudar</p>
                    <div class="flex items-start md:justify-end gap-1">
                      <span class="text-sm font-black text-slate-400 mt-2">S/</span>
                      <p class="text-5xl font-black text-slate-900 tracking-tighter leading-none">{{ loan()?.totalToPay | number:'1.0-0' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div class="mt-12">
                  <div class="flex items-center justify-between mb-3 px-1">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progreso de Pago</span>
                    <span class="text-xs font-black text-[#7B61FF]">{{ ((loan()?.amountPaid || 0) / (loan()?.totalToPay || 1)) * 100 | number:'1.0-0' }}%</span>
                  </div>
                  <div class="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                    <div class="h-full bg-gradient-to-r from-[#7B61FF] to-indigo-400 rounded-full transition-all duration-1000 ease-out shadow-sm"
                         [style.width.%]="((loan()?.amountPaid || 0) / (loan()?.totalToPay || 1)) * 100"></div>
                  </div>
                </div>

                <div class="mt-10 pt-10 border-t border-slate-200/50 grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div class="space-y-1">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Interés</p>
                    <p class="text-base font-black text-slate-900 tracking-tight">{{ (loan()?.interestRate || 0) * 100 }}%</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cuotas</p>
                    <p class="text-base font-black text-slate-900 tracking-tight">{{ loan()?.totalInstallments }} pagos</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Frecuencia</p>
                    <p class="text-base font-black text-slate-900 tracking-tight">{{ translateFrequency(loan()?.paymentFrequency || loan()?.frequency) }}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cobrado</p>
                    <p class="text-base font-black text-[#7B61FF] tracking-tight">S/ {{ loan()?.amountPaid | number:'1.0-0' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Installment Schedule -->
          <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div class="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 class="text-xl font-black text-slate-900 tracking-tight">Cronograma de Cuotas</h3>
                <p class="text-xs text-slate-500 font-medium">Control individual de cada vencimiento.</p>
              </div>
              <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <lucide-icon name="layers" class="w-6 h-6"></lucide-icon>
              </div>
            </div>
            
            <div class="p-6">
              <div class="space-y-3">
                <div *ngFor="let inst of installmentSchedule()" 
                     class="group p-5 rounded-3xl border flex items-center justify-between transition-all duration-300"
                     [class.bg-emerald-50/50]="inst.isPaid"
                     [class.border-emerald-100]="inst.isPaid"
                     [class.bg-slate-50/50]="!inst.isPaid"
                     [class.border-slate-50]="!inst.isPaid"
                     [class.hover:border-emerald-200]="!inst.isPaid"
                >
                  <div class="flex items-center gap-5">
                    <div [class]="inst.isPaid ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white text-slate-400 shadow-sm border border-slate-100'" 
                         class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm">
                      {{ inst.number }}
                    </div>
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <p class="text-[8px] font-black uppercase tracking-widest" [class]="inst.isPaid ? 'text-emerald-600' : 'text-slate-400'">
                          Cuota nº {{ inst.number }} 
                          <span *ngIf="inst.isPaid" class="text-[7px] text-slate-400 ml-1">(Prog: {{ inst.dueDate | date:'dd/MM/yy' }})</span>
                        </p>
                        <span *ngIf="!inst.isPaid" class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border border-amber-200/60 leading-none">Pendiente</span>
                        <span *ngIf="inst.isPaid" class="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border border-emerald-200/60 leading-none">Pagado</span>
                      </div>
                      <p class="font-black text-slate-900 text-sm tracking-tight">
                        {{ inst.isPaid ? (inst.realPaymentDate | date:'dd MMMM, yyyy':'UTC') : (inst.dueDate | date:'dd MMMM, yyyy':'UTC') }}
                      </p>
                      <p *ngIf="inst.isPaid" class="text-[7px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">
                        Vencimiento Original: {{ inst.dueDate | date:'dd/MM/yy':'UTC' }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-6">
                  <div class="flex flex-col items-end">
                    <p class="text-xs font-black text-slate-900">S/ {{ inst.amount | number:'1.2-2' }}</p>
                    <p *ngIf="inst.paidAmount > 0" class="text-[9px] font-bold text-emerald-600 mt-0.5">
                      Pagado: S/ {{ inst.paidAmount | number:'1.2-2' }}
                    </p>
                  </div>
                    
                    <div *ngIf="inst.isPaid" class="bg-emerald-100 text-emerald-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 border border-emerald-200/50">
                      <lucide-icon name="check-circle-2" class="w-3.5 h-3.5"></lucide-icon>
                      Pagado
                    </div>
                    
                    <button 
                      *ngIf="!inst.isPaid && !isLoanFullyPaid() && authService.hasAuthority('PRESTAMOS_UPDATE')"
                      (click)="openPaymentModal(inst)"
                      class="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-slate-900 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                    >
                      Pagar
                    </button>
                  </div>
                </div>
              </div>

              <!-- Botón para generar cuota adicional -->
              <div *ngIf="canCreateExtraInstallment()" class="mt-6 flex justify-center border-t border-slate-50 pt-6">
                <button 
                  (click)="createExtraInstallment()"
                  class="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center gap-2"
                >
                  <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
                  Crear Cuota Adicional
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Fechas de Gestión</h3>
            <div class="space-y-6">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <lucide-icon name="calendar" class="w-5 h-5"></lucide-icon>
                </div>
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Emisión</p>
                  <p class="font-black text-slate-900 text-sm">{{ loan()?.startDate | date:'dd/MM/yyyy':'UTC' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <lucide-icon name="clock" class="w-5 h-5"></lucide-icon>
                </div>
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximo Vencimiento</p>
                  <p class="font-black text-slate-900 text-sm">{{ loan()?.dueDate | date:'dd/MM/yyyy':'UTC' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
            <lucide-icon name="arrow-up-right" class="w-24 h-24 absolute -right-6 -bottom-6 text-white/10 rotate-12"></lucide-icon>
            <h3 class="text-sm font-black uppercase tracking-widest mb-6 opacity-80">Rendimiento Estimado</h3>
            <div class="space-y-6 relative z-10">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Interés Generado</p>
                <p class="text-3xl font-black tracking-tighter">S/ {{ (loan()?.totalToPay || 0) - (loan()?.amount || 0) | number:'1.0-0' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Rentabilidad</p>
                <p class="text-3xl font-black tracking-tighter">{{ (loan()?.interestRate || 0) * 100 | number:'1.0-2' }}%</p>
              </div>
            </div>
          </div>

          <div *ngIf="(loan()?.paidInstallments || 0) > 0" class="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
            <div class="w-10 h-10 bg-white text-amber-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <lucide-icon name="info" class="w-5 h-5"></lucide-icon>
            </div>
            <div>
              <p class="text-xs font-black text-amber-900 uppercase tracking-tight mb-1">Restricción de Edición</p>
              <p class="text-[10px] text-amber-700 font-medium leading-relaxed">No se pueden modificar las condiciones del préstamo porque ya cuenta con cuotas amortizadas.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Modal -->
      <div *ngIf="showPaymentModal()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="showPaymentModal.set(false)"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 relative z-10 animate-in zoom-in-95 duration-300">
          <div class="mb-6 text-center">
            <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
              <lucide-icon name="wallet" class="w-8 h-8"></lucide-icon>
            </div>
            <h3 class="text-xl font-black text-slate-900 tracking-tight">Cobrar Cuota</h3>
            <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Cuota nº {{ selectedInstallment()?.number }} - {{ loan()?.clientName || loan()?.client?.name }}</p>
          </div>
          
          <div class="bg-slate-50 p-6 rounded-2xl mb-4 border border-slate-100 text-center relative overflow-hidden">
            <div *ngIf="adjustmentBalance() !== 0" class="absolute top-0 right-0">
              <div [class]="adjustmentBalance() < 0 ? 'bg-rose-500' : 'bg-emerald-500'" class="text-[7px] font-black text-white px-2 py-0.5 uppercase tracking-tighter rotate-0">
                Ajustado
              </div>
            </div>
            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Sugerido</p>
            <p class="text-3xl font-black text-slate-900 tracking-tighter">S/ {{ selectedInstallment()?.amount - adjustmentBalance() | number:'1.2-2' }}</p>
          </div>

          <!-- Mensaje de Ajuste de Saldo -->
          <div *ngIf="adjustmentBalance() !== 0" class="mb-6 animate-in slide-in-from-top-2 duration-300">
            <div [class]="adjustmentBalance() < 0 ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'" 
                 class="p-4 rounded-2xl border flex items-start gap-3">
              <lucide-icon [name]="adjustmentBalance() < 0 ? 'info' : 'check-circle-2'" class="w-4 h-4 mt-0.5 shrink-0"></lucide-icon>
              <div>
                <p class="text-[9px] font-black uppercase tracking-widest mb-0.5">Nota de Ajuste</p>
                <p class="text-[10px] font-medium leading-relaxed">
                  <span *ngIf="adjustmentBalance() < 0">
                    Se incluye un recargo de <b>S/ {{ -adjustmentBalance() | number:'1.2-2' }}</b> porque quedó un saldo pendiente de la cuota anterior.
                  </span>
                  <span *ngIf="adjustmentBalance() > 0">
                    Se aplica un descuento de <b>S/ {{ adjustmentBalance() | number:'1.2-2' }}</b> por un pago excedente realizado anteriormente.
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-4 mb-6">
            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Monto a Pagar</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="font-black text-slate-400 text-xs">S/</span>
                </div>
                <input 
                  type="number" 
                  [ngModel]="paymentAmount()" 
                  (ngModelChange)="paymentAmount.set($event)"
                  name="paymentAmount"
                  required
                  class="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 font-black text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm"
                >
              </div>
            </div>

            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Fecha de Pago</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <lucide-icon name="calendar" class="w-4 h-4 text-slate-400"></lucide-icon>
                </div>
                <input 
                  type="date" 
                  [ngModel]="paymentDate()" 
                  (ngModelChange)="paymentDate.set($event)"
                  name="paymentDate"
                  required
                  class="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 font-black text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all text-sm"
                >
              </div>
            </div>

            <!-- Alerta de abono parcial -->
            <div *ngIf="paymentAmount() < ((selectedInstallment()?.amount || 0) - adjustmentBalance()) && paymentAmount() > 0" class="bg-amber-50 border border-amber-100 p-4 rounded-xl space-y-3">
              <div class="flex items-start gap-2">
                <lucide-icon name="info" class="w-4 h-4 text-amber-600 mt-0.5"></lucide-icon>
                <div>
                  <p class="text-[9px] font-black text-amber-600 uppercase tracking-tight">Abono Parcial</p>
                  <p class="text-[10px] text-amber-700 font-medium leading-normal">
                    El monto es menor al total sugerido (S/ {{ (selectedInstallment()?.amount || 0) - adjustmentBalance() | number:'1.2-2' }}).
                  </p>
                </div>
              </div>
              
              <div class="pt-2 border-t border-amber-200/50">
                <label class="flex items-center gap-3 cursor-pointer group">
                  <div class="relative">
                    <input 
                      type="checkbox" 
                      [ngModel]="forceCompletion()" 
                      (ngModelChange)="forceCompletion.set($event)"
                      class="peer sr-only"
                    >
                    <div class="w-8 h-4 bg-amber-200 rounded-full peer peer-checked:bg-emerald-500 transition-all"></div>
                    <div class="absolute left-1 top-1 w-2 h-2 bg-white rounded-full peer-checked:translate-x-4 transition-all"></div>
                  </div>
                  <span class="text-[9px] font-black text-slate-700 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Completar cuota y pasar saldo a la siguiente</span>
                </label>
              </div>
            </div>
          </div>

          <div class="space-y-5">
            <div class="flex gap-3">
              <button (click)="showPaymentModal.set(false)" class="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-all text-xs">Cancelar</button>
              <button (click)="confirmPayment()" [disabled]="isSaving() || paymentAmount() <= 0" class="flex-[1.5] bg-emerald-600 text-white py-4 rounded-xl font-black hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg text-xs uppercase shadow-emerald-100">
                <lucide-icon *ngIf="isSaving()" name="loader-2" class="w-4 h-4 animate-spin"></lucide-icon>
                {{ isSaving() ? 'Cobrando...' : 'Confirmar Cobro' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation -->
      <div *ngIf="showDeleteConfirm()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="showDeleteConfirm.set(false)"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 relative z-10 animate-in zoom-in-95 duration-300">
          <div class="mb-6 text-center">
            <div class="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-sm">
              <lucide-icon name="trash-2" class="w-8 h-8"></lucide-icon>
            </div>
            <h3 class="text-xl font-black text-slate-900 tracking-tight">¿Eliminar Préstamo?</h3>
            <p class="text-xs text-slate-500 font-medium mt-2">Se borrará toda la información del crédito y sus cuotas. Esta acción es irreversible.</p>
          </div>
          
          <div class="flex gap-3">
            <button (click)="showDeleteConfirm.set(false)" class="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-all text-xs uppercase">Cancelar</button>
            <button (click)="confirmDelete()" [disabled]="isDeleting()" class="flex-[1.2] bg-rose-600 text-white py-4 rounded-xl font-black hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg text-xs uppercase shadow-rose-100">
              <lucide-icon *ngIf="isDeleting()" name="loader-2" class="w-4 h-4 animate-spin"></lucide-icon>
              {{ isDeleting() ? 'Eliminar' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class LoanDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  loanService = inject(LoanService);
  authService = inject(AuthService);

  loan = signal<Loan | null>(null);
  showPaymentModal = signal(false);
  showDeleteConfirm = signal(false);
  isSaving = signal(false);
  isDeleting = signal(false);
  selectedInstallment = signal<any>(null);
  paymentAmount = signal<number>(0);
  paymentDate = signal<string>(new Date().toISOString().split('T')[0]);
  payments = signal<any[]>([]);
  forceCompletion = signal(false);
  adjustmentBalance = signal<number>(0);
  extraInstallmentsCreated = signal<number>(0);

  isLoanFullyPaid = computed(() => {
    const l = this.loan();
    if (!l) return true;
    return l.status === 'PAID' || (l.amountPaid || 0) >= (l.totalToPay || 0) - 0.01;
  });

  canCreateExtraInstallment = computed(() => {
    const l = this.loan();
    if (!l) return false;
    
    // Si ya se pagó el total, no se puede generar más
    if (this.isLoanFullyPaid()) return false;
    
    // Solo permitir si no hay cuotas pendientes (todas las cuotas actuales están pagadas)
    const schedule = this.installmentSchedule();
    if (schedule.length === 0) return false;
    
    const hasUnpaid = schedule.some(inst => !inst.isPaid);
    return !hasUnpaid;
  });

  createExtraInstallment() {
    if (this.canCreateExtraInstallment()) {
      this.extraInstallmentsCreated.update(n => n + 1);
    }
  }

  private parseBackendDate(date: any): Date | null {
    if (!date) return null;
    if (Array.isArray(date)) {
      // Usar Date.UTC para evitar desfases de zona horaria
      return new Date(Date.UTC(date[0], date[1] - 1, date[2], 12, 0, 0));
    }
    if (typeof date === 'string') {
      const parts = date.split('T')[0].split('-');
      if (parts.length === 3) {
        return new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0));
      }
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    // Si ya es un objeto Date o string ISO, forzamos a mediodía UTC para consistencia
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0));
  }

  progress = computed(() => {
    const insts = this.installmentSchedule();
    if (!insts.length) return 0;
    const paidCount = insts.filter(i => i.isPaid).length;
    return paidCount / insts.length;
  });

  installmentSchedule = computed(() => {
    const l = this.loan();
    if (!l || !l.startDate) return [];

    const paymentsList = (this.payments() || []).sort((a, b) => {
      const dateA = this.parseBackendDate(a.paymentDate)?.getTime() || 0;
      const dateB = this.parseBackendDate(b.paymentDate)?.getTime() || 0;
      return dateA - dateB;
    });

    const startDate = this.parseBackendDate(l.startDate);
    if (!startDate) return [];

    // Encontrar el número máximo de cuota registrado en los pagos
    let maxInstallmentFromPayments = l.totalInstallments || 0;
    paymentsList.forEach(p => {
      const match = (p.notes || '').toLowerCase().match(/cuota (\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxInstallmentFromPayments) {
          maxInstallmentFromPayments = num;
        }
      }
    });

    const limit = Math.max(l.totalInstallments || 0, maxInstallmentFromPayments) + this.extraInstallmentsCreated();
    const installmentsMap = new Map<number, any>();
    const baseAmount = (l.totalToPay || 0) / (l.totalInstallments || 1);

    // Inicializar cuotas
    for (let i = 1; i <= limit; i++) {
      const dueDate = new Date(startDate);
      const freq = l.paymentFrequency || l.frequency;
      if (freq === 'DAILY') {
        dueDate.setDate(startDate.getDate() + i);
      } else if (freq === 'WEEKLY') {
        dueDate.setDate(startDate.getDate() + (i * 7));
      } else if (freq === 'BIWEEKLY') {
        dueDate.setDate(startDate.getDate() + (i * 14));
      } else if (freq === 'MONTHLY') {
        dueDate.setMonth(startDate.getMonth() + i);
      }

      installmentsMap.set(i, {
        number: i,
        dueDate: dueDate,
        amount: baseAmount,
        paidAmount: 0,
        isForcedPaid: false,
        payments: []
      });
    }

    // Distribuir pagos en cascada empezando desde la cuota que indica su nota
    paymentsList.forEach(p => {
      let startIdx = 1;
      const match = (p.notes || '').toLowerCase().match(/cuota (\d+)/);
      if (match) {
        startIdx = parseInt(match[1], 10);
      }

      const isForced = (p.notes || '').toLowerCase().includes('completada');
      if (isForced && installmentsMap.has(startIdx)) {
         installmentsMap.get(startIdx).isForcedPaid = true;
      }

      let amountToDistribute = p.amount || 0;
      let currIdx = startIdx;

      while (amountToDistribute > 0 && currIdx <= limit) {
         let inst = installmentsMap.get(currIdx);
         if (inst) {
             let needed = inst.amount - inst.paidAmount;
             if (needed > 0) {
                // Este pago contribuye a esta cuota, así que lo guardamos para referencia de fecha
                inst.payments.push(p);

                if (amountToDistribute >= needed) {
                   inst.paidAmount += needed;
                   amountToDistribute -= needed;
                } else {
                   inst.paidAmount += amountToDistribute;
                   amountToDistribute = 0;
                }
             }
         }
         currIdx++;
      }

      // Si sobra dinero y ya llegamos a la última cuota, el excedente se suma allí
      if (amountToDistribute > 0 && limit > 0) {
         let lastInst = installmentsMap.get(limit);
         if (lastInst) {
             lastInst.payments.push(p);
             lastInst.paidAmount += amountToDistribute;
         }
      }
    });

    const result = [];
    for (let i = 1; i <= limit; i++) {
      const inst = installmentsMap.get(i);
      const isExtra = i > (l.totalInstallments || 0);

      // Si es una cuota extra, ajustamos su amount esperado
      if (isExtra) {
        if (inst.paidAmount > 0) {
          inst.amount = inst.paidAmount;
        } else {
          inst.amount = Math.min(baseAmount, Math.max(0, (l.totalToPay || 0) - (l.amountPaid || 0)));
        }
      }

      const isPaid = i <= (l.paidInstallments || 0) || 
                     inst.isForcedPaid || 
                     (inst.paidAmount >= inst.amount - 0.01 && inst.amount > 0) ||
                     ((l.amountPaid || 0) >= (l.totalToPay || 0) - 0.01);

      const lastPayment = inst.payments.length > 0 ? inst.payments[inst.payments.length - 1] : null;

      result.push({
        number: i,
        dueDate: inst.dueDate,
        amount: inst.amount,
        paidAmount: inst.paidAmount,
        isPaid: isPaid,
        realPaymentDate: lastPayment ? this.parseBackendDate(lastPayment.paymentDate) : null
      });
    }

    return result;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadLoan(id);
    }
  }

  loadLoan(id: string) {
    this.extraInstallmentsCreated.set(0);
    this.loanService.loadLoans().subscribe(loans => {
      const l = loans.find(x => x.id === id);
      if (l) {
        this.loan.set(l);
        this.loanService.getPayments(id).subscribe(p => {
          const sorted = (p || []).sort((a, b) => {
            const dateA = this.parseBackendDate(a.paymentDate)?.getTime() || 0;
            const dateB = this.parseBackendDate(b.paymentDate)?.getTime() || 0;
            return dateA - dateB;
          });
          this.payments.set(sorted);
        });
      } else {
        this.router.navigate(['/loans']);
      }
    });
  }

  editLoan() {
    if ((this.loan()?.paidInstallments || 0) > 0) return;
    this.router.navigate(['/loans/edit', this.loan()?.id]);
  }

  openPaymentModal(inst: any) {
    if (this.isLoanFullyPaid()) return;
    this.selectedInstallment.set(inst);
    this.forceCompletion.set(false);
    
    const total = this.loan()?.totalToPay || 0;
    const amountPaid = this.loan()?.amountPaid || 0;
    const totalInstallments = this.loan()?.totalInstallments || 1;
    const installmentAmount = total / totalInstallments;
    
    if (inst.number > totalInstallments) {
      // Es una cuota adicional
      const remainingBalance = Math.max(0, total - amountPaid);
      this.adjustmentBalance.set(0);
      this.paymentAmount.set(parseFloat(Math.min(installmentAmount, remainingBalance).toFixed(2)));
    } else {
      // Calcular monto faltante para completar esta cuota basándonos en amountPaid
      // Usamos el conteo del frontend que incluye las cuotas forzadas
      const completedInstallments = this.installmentSchedule().filter(i => i.isPaid).length;
      const expectedPaidForCompleted = completedInstallments * installmentAmount;
      
      // El balance acumulado puede ser positivo (pagó de más) o negativo (pagó de menos pero se completó la cuota)
      const currentBalance = amountPaid - expectedPaidForCompleted;
      this.adjustmentBalance.set(parseFloat(currentBalance.toFixed(2)));
      
      // El monto sugerido es la cuota base menos el balance que ya traemos
      let toPay = installmentAmount - currentBalance;
      this.paymentAmount.set(Math.max(0, parseFloat(toPay.toFixed(2))));
    }
    this.paymentDate.set(new Date().toISOString().split('T')[0]);
    this.showPaymentModal.set(true);
  }

  confirmPayment() {
    const l = this.loan();
    if (!l) return;
    if (this.paymentAmount() <= 0) return;
    this.isSaving.set(true);
    
    this.loanService.registerPayment({
      loanId: l.id,
      amount: this.paymentAmount(),
      note: this.forceCompletion() 
        ? `Pago parcial (S/ ${this.paymentAmount()}) - Cuota ${this.selectedInstallment()?.number} completada por ajuste.`
        : `Pago de cuota ${this.selectedInstallment()?.number}`,
      paymentDate: this.paymentDate()
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showPaymentModal.set(false);
        this.loadLoan(l.id);
      },
      error: () => this.isSaving.set(false)
    });
  }

  confirmDelete() {
    const l = this.loan();
    if (!l) return;
    this.isDeleting.set(true);
    this.loanService.deleteLoan(l.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteConfirm.set(false);
        this.router.navigate(['/loans']);
      },
      error: () => this.isDeleting.set(false)
    });
  }

  translateFrequency(freq: string | undefined): string {
    switch (freq?.toUpperCase()) {
      case 'DAILY': return 'Diario';
      case 'WEEKLY': return 'Semanal';
      case 'BIWEEKLY': return 'Quincenal';
      case 'MONTHLY': return 'Mensual';
      default: return freq || 'No definida';
    }
  }
}
