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
  ArrowUpRight
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
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Detalle del Préstamo</h1>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">{{ loan()?.clientName || loan()?.client?.name }} • Ref. {{ loan()?.id?.substring(0,8) }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
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
                      <p class="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-tight">Estado de Cartera • {{ loan()?.status === 'PAID' ? 'Finalizado' : 'En curso' }}</p>
                    </div>
                    
                    <div class="flex flex-wrap gap-3">
                      <div class="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/20">
                        <lucide-icon name="wallet" class="w-4 h-4 text-[#7B61FF]"></lucide-icon>
                        Capital: S/ {{ loan()?.amount | number:'1.0-0' }}
                      </div>
                      <div [class]="loan()?.status === 'PAID' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'"
                            class="px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all">
                        <div class="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        {{ loan()?.status === 'PAID' ? 'Totalmente Pagado' : 'Pendiente de Cobro' }}
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
                        <p class="text-[8px] font-black uppercase tracking-widest" [class]="inst.isPaid ? 'text-emerald-600' : 'text-slate-400'">Cuota nº {{ inst.number }}</p>
                        <span *ngIf="!inst.isPaid" class="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border border-amber-200/60 leading-none">Pendiente</span>
                        <span *ngIf="inst.isPaid" class="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border border-emerald-200/60 leading-none">Pagado</span>
                      </div>
                      <p class="font-black text-slate-900 text-sm tracking-tight">{{ inst.dueDate | date:'dd MMMM, yyyy' }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-6">
                    <div class="text-right">
                      <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Importe</p>
                      <p class="font-black text-slate-900">S/ {{ inst.amount | number:'1.2-2' }}</p>
                    </div>
                    
                    <div *ngIf="inst.isPaid" class="bg-emerald-100 text-emerald-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 border border-emerald-200/50">
                      <lucide-icon name="check-circle-2" class="w-3.5 h-3.5"></lucide-icon>
                      Pagado
                    </div>
                    
                    <button 
                      *ngIf="!inst.isPaid && authService.hasAuthority('PRESTAMOS_UPDATE')"
                      (click)="openPaymentModal(inst)"
                      class="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-slate-900 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                    >
                      Pagar
                    </button>
                  </div>
                </div>
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
                  <p class="font-black text-slate-900 text-sm">{{ loan()?.startDate | date:'dd/MM/yyyy' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <lucide-icon name="clock" class="w-5 h-5"></lucide-icon>
                </div>
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximo Vencimiento</p>
                  <p class="font-black text-slate-900 text-sm">{{ loan()?.dueDate | date:'dd/MM/yyyy' }}</p>
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
          
          <div class="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100 text-center">
            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Sugerido</p>
            <p class="text-3xl font-black text-slate-900 tracking-tighter">S/ {{ selectedInstallment()?.amount | number:'1.2-2' }}</p>
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

            <!-- Alerta de abono parcial -->
            <div *ngIf="paymentAmount() < selectedInstallment()?.amount && paymentAmount() > 0" class="bg-amber-50 border border-amber-100 p-4 rounded-xl space-y-1">
              <p class="text-[9px] font-black text-amber-600 uppercase tracking-tight flex items-center gap-1">
                <lucide-icon name="info" class="w-3 h-3"></lucide-icon>
                Abono Parcial
              </p>
              <p class="text-[10px] text-amber-700 font-medium leading-normal">
                El cliente pagará un monto menor al total de la cuota. El pago se registrará, pero no se marcará como pagada hasta completar el total.
              </p>
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

  progress = computed(() => {
    const l = this.loan();
    if (!l || !l.totalInstallments) return 0;
    return (l.paidInstallments || 0) / l.totalInstallments;
  });

  installmentSchedule = computed(() => {
    const l = this.loan();
    if (!l || !l.startDate) return [];
    const schedule = [];
    
    // Convertir de forma segura para evitar problemas de zona horaria (UTC vs Local)
    const parts = l.startDate.split('T')[0].split('-');
    const start = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
    const amountPerInstallment = l.totalToPay / l.totalInstallments;
    
    for (let i = 1; i <= l.totalInstallments; i++) {
      const dueDate = new Date(start);
      // Calcular la fecha basándose en la frecuencia
      const freq = l.paymentFrequency || l.frequency;
      if (freq === 'DAILY') dueDate.setDate(start.getDate() + i);
      else if (freq === 'WEEKLY') dueDate.setDate(start.getDate() + (i * 7));
      else if (freq === 'BIWEEKLY') dueDate.setDate(start.getDate() + (i * 14));
      else dueDate.setMonth(start.getMonth() + i);

      schedule.push({
        number: i,
        dueDate: dueDate,
        amount: amountPerInstallment,
        isPaid: i <= (l.paidInstallments || 0)
      });
    }
    return schedule;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadLoan(id);
    }
  }

  loadLoan(id: string) {
    this.loanService.loadLoans().subscribe(loans => {
      const l = loans.find(x => x.id === id);
      if (l) {
        this.loan.set(l);
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
    this.selectedInstallment.set(inst);
    // Calcular monto faltante para completar esta cuota basándonos en amountPaid
    const total = this.loan()?.totalToPay || 0;
    const totalInstallments = this.loan()?.totalInstallments || 1;
    const installmentAmount = total / totalInstallments;
    
    const completedInstallments = this.loan()?.paidInstallments || 0;
    const expectedPaidForCompleted = completedInstallments * installmentAmount;
    const accumulatedForNext = (this.loan()?.amountPaid || 0) - expectedPaidForCompleted;
    
    // Si ya hay un abono parcial previo, le restamos lo que ya tiene
    let toPay = installmentAmount;
    if (accumulatedForNext > 0 && inst.number === completedInstallments + 1) {
      toPay = installmentAmount - accumulatedForNext;
    }

    // Asegurarnos de redondear a 2 decimales para evitar problemas de precisión
    this.paymentAmount.set(Math.max(0, parseFloat(toPay.toFixed(2))));
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
      note: `Pago de cuota ${this.selectedInstallment()?.number}`
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
