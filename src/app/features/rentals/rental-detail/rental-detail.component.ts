import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { 
  LucideAngularModule, 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Building, 
  TrendingUp, 
  CheckCircle2, 
  Wallet, 
  Clock, 
  Calendar,
  MoreHorizontal,
  ChevronRight,
  Info,
  X,
  Loader2
} from 'lucide-angular';
import { RentalService } from '../../../core/services/rental.service';
import { AuthService } from '../../../core/services/auth.service';
import { Rental } from '../../../core/models/rental.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rental-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-20 px-4 max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-6">
        <div class="flex items-center gap-5">
          <button 
            routerLink="/rentals"
            class="w-12 h-12 bg-white text-slate-400 rounded-2xl flex items-center justify-center hover:bg-[#7B61FF]/10 hover:text-[#7B61FF] transition-all border border-slate-100 shadow-sm active:scale-90"
          >
            <lucide-icon name="arrow-left" class="w-6 h-6"></lucide-icon>
          </button>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Detalle del Alquiler</h1>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">Gestión de Propiedad • Inmueble {{ rental()?.roomNumber }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button 
            *ngIf="authService.hasAuthority('RENTALS_UPDATE')"
            (click)="editRental()"
            class="w-12 h-12 bg-white text-[#7B61FF] rounded-2xl flex items-center justify-center hover:bg-[#7B61FF] hover:text-white transition-all border border-[#7B61FF]/10 shadow-sm active:scale-90"
            title="Editar contrato"
          >
            <lucide-icon name="edit-2" class="w-5 h-5"></lucide-icon>
          </button>
          <button 
            *ngIf="authService.hasAuthority('RENTALS_DELETE')"
            (click)="showDeleteConfirm.set(true)"
            class="w-12 h-12 bg-white text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm active:scale-90"
            title="Eliminar contrato"
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
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inquilino Titular</p>
                      <h2 class="text-2xl font-black text-slate-900 tracking-tight">{{ rental()?.tenant?.name }}</h2>
                      <p class="text-[11px] text-slate-500 font-bold mt-1 uppercase tracking-tight">
                        ID: {{ rental()?.tenant?.dni }} <span class="mx-2 text-slate-300">|</span> CEL: {{ rental()?.tenant?.phone }}
                      </p>
                    </div>
                    
                    <div class="flex flex-wrap gap-3">
                      <div class="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/20">
                        <lucide-icon name="building" class="w-4 h-4 text-[#7B61FF]"></lucide-icon>
                        Habitación {{ rental()?.roomNumber }}
                      </div>
                      <div [class]="rental()?.status === 'PAID' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'"
                            class="px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all">
                        <div class="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        {{ rental()?.status === 'PAID' ? 'Cobro al día' : 'Pago Pendiente' }}
                      </div>
                    </div>
                  </div>

                  <div class="text-left md:text-right">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Renta Mensual</p>
                    <div class="flex items-start md:justify-end gap-1">
                      <span class="text-sm font-black text-slate-400 mt-2">S/</span>
                      <p class="text-5xl font-black text-slate-900 tracking-tighter leading-none">{{ rental()?.amount | number:'1.0-0' }}</p>
                    </div>
                  </div>
                </div>

                <div class="mt-12 pt-10 border-t border-slate-200/50 grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div class="space-y-1">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contrato</p>
                    <p class="text-base font-black text-slate-900 tracking-tight">{{ rental()?.totalMonths }} meses</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ejecutado</p>
                    <p class="text-base font-black text-emerald-600 tracking-tight">{{ rental()?.paidMonths }} cuotas</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Depósito</p>
                    <p class="text-base font-black text-slate-900 tracking-tight">S/ {{ rental()?.securityDeposit | number:'1.0-0' }}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recaudado</p>
                    <p class="text-base font-black text-[#7B61FF] tracking-tight">S/ {{ rental()?.amountPaid | number:'1.0-0' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Schedule -->
          <div class="space-y-6">
            <div class="flex items-center justify-between px-2">
              <div>
                <h3 class="text-lg font-black text-slate-900 tracking-tight">Cronograma de Pagos</h3>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Control de cuotas mensuales</p>
              </div>
              <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#7B61FF] border border-slate-100 shadow-sm">
                <lucide-icon name="calendar" class="w-5 h-5"></lucide-icon>
              </div>
            </div>
            
            <div class="space-y-3">
              <div *ngFor="let month of paymentSchedule()" 
                    class="group p-5 rounded-[2rem] border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    [class.bg-white]="month.isPaid"
                    [class.border-slate-100]="month.isPaid"
                    [class.bg-white/50]="!month.isPaid"
                    [class.border-dashed]="!month.isPaid"
                    [class.border-slate-200]="!month.isPaid"
                    [class.hover:bg-white]="!month.isPaid"
                    [class.hover:border-[#7B61FF]/30]="!month.isPaid"
                    [class.hover:shadow-xl]="true"
                    [class.hover:shadow-slate-100]="true"
              >
                <div class="flex items-center gap-5">
                  <div [class]="month.isPaid ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-100'" 
                        class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg transition-transform group-hover:scale-105">
                    {{ month.month }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <p class="text-[8px] font-black uppercase tracking-[0.1em]" [class]="month.isPaid ? 'text-emerald-600' : 'text-slate-400'">
                        {{ month.isPaid ? 'Mensualidad Cancelada' : 'Mensualidad Pendiente' }}
                      </p>
                      <div *ngIf="!month.isPaid" class="w-1 h-1 rounded-full bg-amber-400"></div>
                    </div>
                    <p class="font-black text-slate-900 text-sm tracking-tight">{{ month.dueDate | date:'dd MMMM, yyyy' }}</p>
                  </div>
                </div>
                
                <div class="flex items-center justify-between md:justify-end gap-8">
                  <div class="text-right">
                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Importe</p>
                    <p class="font-black text-slate-900">S/ {{ month.amount | number:'1.2-2' }}</p>
                  </div>
                  
                  <div *ngIf="month.isPaid" class="bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase flex items-center gap-2 border border-emerald-100 shadow-sm">
                    <lucide-icon name="check-circle-2" class="w-4 h-4"></lucide-icon>
                    Confirmado
                  </div>
                  
                  <button 
                    *ngIf="!month.isPaid && authService.hasAuthority('RENTALS_UPDATE')"
                    (click)="openPaymentModal(month)"
                    class="bg-[#7B61FF] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-[#7B61FF]/20 active:scale-95"
                  >
                    Cobrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Actions/Stats -->
        <div class="space-y-8">
          <!-- Dates Card -->
          <div class="bg-white/60 backdrop-blur-md p-8 rounded-[3rem] border border-white shadow-xl shadow-[#7B61FF]/5">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Cronología</h3>
            <div class="space-y-8">
              <div class="flex items-center gap-5">
                <div class="w-12 h-12 bg-white text-[#7B61FF] rounded-2xl flex items-center justify-center border border-[#7B61FF]/10 shadow-sm">
                  <lucide-icon name="calendar" class="w-5 h-5"></lucide-icon>
                </div>
                <div>
                  <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Inicio Contrato</p>
                  <p class="font-black text-slate-900 text-sm tracking-tight">{{ rental()?.startDate | date:'dd/MM/yyyy' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-5">
                <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
                  <lucide-icon name="clock" class="w-5 h-5"></lucide-icon>
                </div>
                <div>
                  <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Próximo Cobro</p>
                  <p class="font-black text-slate-900 text-sm tracking-tight">{{ rental()?.dueDate | date:'dd/MM/yyyy' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- History/Payments Info -->
          <div class="bg-gradient-to-br from-[#7B61FF] to-[#6349E6] p-10 rounded-[3rem] text-white shadow-2xl shadow-[#7B61FF]/20 relative overflow-hidden group">
            <lucide-icon name="trending-up" class="w-32 h-32 absolute -right-8 -bottom-8 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-1000"></lucide-icon>
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] mb-8 opacity-60">Proyección</h3>
            <div class="space-y-8 relative z-10">
              <div>
                <p class="text-[9px] font-black uppercase tracking-widest mb-1.5 opacity-50">Total Contrato</p>
                <div class="flex items-baseline gap-1">
                  <span class="text-xs opacity-60">S/</span>
                  <p class="text-3xl font-black tracking-tighter">{{ (rental()?.amount || 0) * (rental()?.totalMonths || 0) | number:'1.0-0' }}</p>
                </div>
              </div>
              <div>
                <p class="text-[9px] font-black uppercase tracking-widest mb-1.5 opacity-50">Balance Pendiente</p>
                <div class="flex items-baseline gap-1">
                  <span class="text-xs opacity-60">S/</span>
                  <p class="text-3xl font-black tracking-tighter">{{ ((rental()?.amount || 0) * (rental()?.totalMonths || 0)) - (rental()?.amountPaid || 0) | number:'1.0-0' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Warning for editing if payments exist -->
          <div *ngIf="(rental()?.paidMonths || 0) > 0" class="bg-white/40 backdrop-blur-md border border-white p-6 rounded-[2rem] flex items-start gap-4 shadow-xl shadow-slate-100/50">
            <div class="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <lucide-icon name="info" class="w-5 h-5"></lucide-icon>
            </div>
            <div>
              <p class="text-[10px] font-black text-amber-900 uppercase tracking-tight mb-1">Restricción Activa</p>
              <p class="text-[10px] text-slate-500 font-medium leading-relaxed">Contrato con pagos registrados. Para modificaciones estructurales, cree una nueva adenda.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Modal -->
      <div *ngIf="showPaymentModal()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="showPaymentModal.set(false)"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 relative z-10 animate-in zoom-in-95 duration-300">
          <div class="mb-6 text-center">
            <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm">
              <lucide-icon name="wallet" class="w-8 h-8"></lucide-icon>
            </div>
            <h3 class="text-xl font-black text-slate-900 tracking-tight">Registrar Cobro</h3>
            <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">Mes {{ selectedMonth()?.month }} - {{ rental()?.tenant?.name }}</p>
          </div>
          
          <div class="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100 text-center">
            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto de la Cuota</p>
            <p class="text-3xl font-black text-slate-900 tracking-tighter">S/ {{ selectedMonth()?.amount | number:'1.2-2' }}</p>
          </div>

          <div class="space-y-5">
            <div class="flex gap-3">
              <button (click)="showPaymentModal.set(false)" class="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-all text-xs">Cancelar</button>
              <button (click)="confirmPayment()" [disabled]="isSaving()" class="flex-[1.5] bg-indigo-600 text-white py-4 rounded-xl font-black hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg text-xs uppercase shadow-indigo-100">
                <lucide-icon *ngIf="isSaving()" name="loader-2" class="w-4 h-4 animate-spin"></lucide-icon>
                {{ isSaving() ? 'Cobrando...' : 'Confirmar Cobro' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="showDeleteConfirm()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="showDeleteConfirm.set(false)"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 relative z-10 animate-in zoom-in-95 duration-300">
          <div class="mb-6 text-center">
            <div class="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-sm">
              <lucide-icon name="trash-2" class="w-8 h-8"></lucide-icon>
            </div>
            <h3 class="text-xl font-black text-slate-900 tracking-tight">¿Eliminar Contrato?</h3>
            <p class="text-xs text-slate-500 font-medium mt-2">Esta acción eliminará permanentemente el contrato y sus registros. No se puede deshacer.</p>
          </div>
          
          <div class="flex gap-3">
            <button (click)="showDeleteConfirm.set(false)" class="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-all text-xs uppercase">No, volver</button>
            <button (click)="confirmDelete()" [disabled]="isDeleting()" class="flex-[1.2] bg-rose-600 text-white py-4 rounded-xl font-black hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg text-xs uppercase shadow-rose-100">
              <lucide-icon *ngIf="isDeleting()" name="loader-2" class="w-4 h-4 animate-spin"></lucide-icon>
              {{ isDeleting() ? 'Eliminando...' : 'Sí, eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class RentalDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  rentalService = inject(RentalService);
  authService = inject(AuthService);

  rental = signal<Rental | null>(null);
  showPaymentModal = signal(false);
  showDeleteConfirm = signal(false);
  isSaving = signal(false);
  isDeleting = signal(false);
  selectedMonth = signal<any>(null);

  paymentSchedule = computed(() => {
    const r = this.rental();
    if (!r) return [];
    const schedule = [];
    const start = new Date(r.startDate);
    for (let i = 1; i <= r.totalMonths; i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(start.getMonth() + i - 1); // Month 1 is the start month roughly
      schedule.push({
        month: i,
        dueDate: dueDate,
        amount: r.amount,
        isPaid: i <= (r.paidMonths || 0)
      });
    }
    return schedule;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRental(id);
    }
  }

  loadRental(id: string) {
    // In a real app we'd have getRentalById, but here we can find it from the signal if already loaded
    // or reload rentals and find it. For now, let's just find it or reload.
    const found = this.rentalService.rentals().find(r => r.id === id);
    if (found) {
      this.rental.set(found);
    } else {
      this.rentalService.loadRentals().subscribe(rentals => {
        const r = rentals.find(x => x.id === id);
        if (r) this.rental.set(r);
        else this.router.navigate(['/rentals']);
      });
    }
  }

  editRental() {
    if ((this.rental()?.paidMonths || 0) > 0) {
      // In Flutter they show a warning, let's just not allow it or navigate to edit anyway but disable fields
      return;
    }
    this.router.navigate(['/rentals/edit', this.rental()?.id]);
  }

  openPaymentModal(month: any) {
    this.selectedMonth.set(month);
    this.showPaymentModal.set(true);
  }

  confirmPayment() {
    const r = this.rental();
    if (!r) return;
    this.isSaving.set(true);
    this.rentalService.registerPayment({
      rentalId: r.id,
      amount: r.amount,
      note: `Pago de mes ${this.selectedMonth()?.month}`
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showPaymentModal.set(false);
        this.loadRental(r.id);
      },
      error: () => this.isSaving.set(false)
    });
  }

  confirmDelete() {
    const r = this.rental();
    if (!r) return;
    this.isDeleting.set(true);
    this.rentalService.deleteRental(r.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteConfirm.set(false);
        this.router.navigate(['/rentals']);
      },
      error: () => this.isDeleting.set(false)
    });
  }
}
