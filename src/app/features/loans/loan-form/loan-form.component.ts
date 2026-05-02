import { Component, inject, signal, OnInit, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule, 
  ArrowLeft, 
  User, 
  Wallet, 
  Percent, 
  Layers, 
  Calendar, 
  Clock,
  Loader2,
  ChevronDown,
  Info,
  ShieldCheck,
  TrendingUp,
  Plus,
  X,
  UserPlus,
  Search
} from 'lucide-angular';
import { LoanService } from '../../../core/services/loan.service';
import { ClientService } from '../../../core/services/client.service';
import { LoanCreateRequest } from '../../../core/models/loan.model';

@Component({
  selector: 'app-loan-form',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-10">
      <!-- Header -->
      <div class="flex items-center gap-6 px-2">
        <button 
          [routerLink]="isEditing() ? ['/loans', loanId()] : ['/loans']"
          class="w-10 h-10 bg-white text-slate-400 rounded-xl flex items-center justify-center hover:text-emerald-600 transition-all border border-slate-100 shadow-sm"
        >
          <lucide-icon name="arrow-left" class="w-5 h-5"></lucide-icon>
        </button>
        <div>
          <h1 class="text-xl font-black text-slate-900 tracking-tight">{{ isEditing() ? 'Editar Préstamo' : 'Nuevo Préstamo' }}</h1>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ isEditing() ? 'Modificar condiciones' : 'Configurar nuevo crédito' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <form (submit)="save()" class="space-y-6">
            <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <!-- Client Selection -->
              <div class="space-y-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                      <lucide-icon name="user" class="w-4 h-4"></lucide-icon>
                    </div>
                    <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Información del Cliente</h3>
                  </div>
                  <button 
                    *ngIf="!isEditing()"
                    type="button"
                    (click)="showAddClientModal.set(true)"
                    class="text-[10px] font-black text-[#7B61FF] hover:text-[#6349E6] flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <lucide-icon name="plus" class="w-3 h-3"></lucide-icon>
                    NUEVO CLIENTE
                  </button>
                </div>
                
                <div class="relative group" (click)="$event.stopPropagation()">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Seleccionar Cliente</label>
                  
                  <!-- Custom Select Trigger -->
                  <div class="relative">
                    <button 
                      type="button"
                      (click)="toggleClientDropdown()"
                      [disabled]="isEditing()"
                      class="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 font-bold text-slate-900 text-left flex items-center justify-between hover:bg-white focus:ring-4 focus:ring-[#7B61FF]/10 focus:border-[#7B61FF] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-xs"
                    >
                      <span [class.text-slate-400]="!selectedClientName()">
                        {{ selectedClientName() || 'Buscar y seleccionar cliente...' }}
                      </span>
                      <lucide-icon name="chevron-down" class="w-4 h-4 text-slate-400 transition-transform duration-300" [class.rotate-180]="showClientDropdown()"></lucide-icon>
                    </button>

                    <!-- Custom Dropdown Panel -->
                    <div 
                      *ngIf="showClientDropdown()" 
                      class="absolute z-50 left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    >
                      <div class="p-4 border-b border-slate-50">
                        <div class="relative group">
                          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <lucide-icon name="search" class="w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors"></lucide-icon>
                          </div>
                          <input 
                            type="text" 
                            [ngModel]="clientSearchTerm()" 
                            (ngModelChange)="clientSearchTerm.set($event)"
                            name="clientSearch"
                            (click)="$event.stopPropagation()"
                            placeholder="Buscar por nombre o DNI..." 
                            class="w-full bg-slate-50 border border-transparent rounded-xl pl-11 pr-4 py-3 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600/10 transition-all outline-none text-xs"
                          >
                        </div>
                      </div>
                      
                      <div class="max-h-64 overflow-y-auto p-2 scrollbar-hide">
                        <div 
                          *ngFor="let client of filteredClientsForSelect()" 
                          (click)="selectClient(client)"
                          class="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors group"
                        >
                          <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            {{ client.name.charAt(0).toUpperCase() }}
                          </div>
                          <div>
                            <p class="font-black text-slate-900 text-sm">{{ client.name }}</p>
                            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">DNI: {{ client.dni }}</p>
                          </div>
                        </div>
                        
                        <div *ngIf="filteredClientsForSelect().length === 0" class="p-8 text-center">
                          <p class="text-xs text-slate-500 font-medium">No se encontraron clientes.</p>
                          <button 
                            type="button"
                            (click)="showAddClientModal.set(true); showClientDropdown.set(false)"
                            class="mt-4 text-xs font-black text-emerald-600 hover:underline"
                          >
                            + Registrar Nuevo Cliente
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Loan Terms -->
              <div class="space-y-4">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <lucide-icon name="wallet" class="w-4 h-4"></lucide-icon>
                  </div>
                  <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Condiciones del Crédito</h3>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="group">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Monto Capital (S/)</label>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <span class="font-black text-slate-400">S/</span>
                      </div>
                      <input 
                        type="number" 
                        [(ngModel)]="loan.amount" 
                        name="amount" 
                        required
                        class="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-5 py-3 font-bold text-slate-900 outline-none focus:border-[#7B61FF] focus:bg-white transition-all text-xs"
                      >
                    </div>
                  </div>
                  <div class="group">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Interés Mensual (%)</label>
                    <div class="relative group">
                      <div class="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                        <span class="font-black text-slate-400">%</span>
                      </div>
                      <input 
                        type="number" 
                        [(ngModel)]="loan.interestRate" 
                        name="interestRate" 
                        required
                        class="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 font-bold text-slate-900 outline-none focus:border-[#7B61FF] focus:bg-white transition-all text-xs"
                      >
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="group">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Número de Cuotas</label>
                    <input 
                      type="number" 
                      [(ngModel)]="loan.totalInstallments" 
                      name="totalInstallments" 
                      required
                      class="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 font-bold text-slate-900 outline-none focus:border-[#7B61FF] focus:bg-white transition-all text-xs"
                    >
                  </div>
                  <div class="group col-span-1 md:col-span-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Frecuencia de Pago</label>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button 
                        type="button"
                        *ngFor="let freq of paymentFrequencies"
                        (click)="loan.paymentFrequency = freq.value"
                        [class.bg-[#7B61FF]]="loan.paymentFrequency === freq.value"
                        [class.text-white]="loan.paymentFrequency === freq.value"
                        [class.border-[#7B61FF]]="loan.paymentFrequency === freq.value"
                        [class.bg-white]="loan.paymentFrequency !== freq.value"
                        [class.text-slate-500]="loan.paymentFrequency !== freq.value"
                        [class.border-slate-100]="loan.paymentFrequency !== freq.value"
                        class="px-4 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all hover:border-[#7B61FF] active:scale-[0.98]"
                      >
                        {{ freq.label }}
                      </button>
                    </div>
                  </div>
                </div>

                <div class="group">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Fecha del Primer Pago</label>
                  <input 
                    type="date" 
                    [(ngModel)]="loan.startDate" 
                    name="startDate" 
                    required
                    class="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 font-bold text-slate-900 outline-none focus:border-[#7B61FF] focus:bg-white transition-all text-xs"
                  >
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex gap-4 mt-6">
              <button 
                type="button"
                (click)="cancel()"
                class="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-[10px] hover:bg-slate-200 transition-all uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                [disabled]="isSaving() || !selectedId()"
                class="flex-[2] bg-[#7B61FF] text-white py-3 rounded-xl font-black text-[10px] hover:bg-[#6349E6] transition-all shadow-lg shadow-[#7B61FF]/30 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                <lucide-icon *ngIf="isSaving()" name="loader-2" class="w-3.5 h-3.5 animate-spin"></lucide-icon>
                {{ isSaving() ? 'Procesando...' : (isEditing() ? 'Actualizar Préstamo' : 'Crear Préstamo') }}
              </button>
            </div>
          </form>
        </div>

        <!-- Quick Add Client Modal -->
        <div *ngIf="showAddClientModal()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300" (click)="showAddClientModal.set(false)"></div>
          <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 relative z-10 animate-in zoom-in-95 duration-300 border border-white/20">
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                  <lucide-icon name="user-plus" class="w-6 h-6"></lucide-icon>
                </div>
                <div>
                  <h3 class="text-xl font-black text-slate-900 tracking-tight">Rápido: Nuevo Cliente</h3>
                  <p class="text-xs text-slate-500 font-medium mt-0.5">Registra y selecciona al cliente de inmediato.</p>
                </div>
              </div>
              <button (click)="showAddClientModal.set(false)" class="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-900 transition-all">
                <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
              </button>
            </div>
            
            <form (submit)="quickSaveClient()" class="space-y-6">
              <div class="grid grid-cols-2 gap-5">
                <div class="col-span-2">
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">DNI (Consulta Automática)</label>
                  <div class="relative group">
                    <input type="text" [(ngModel)]="newQuickClient.dni" name="quickDni" required class="w-full bg-slate-50 border border-slate-100 rounded-xl pl-4 pr-12 py-3 text-sm font-black outline-none focus:border-emerald-600 focus:bg-white transition-all" maxlength="8">
                    <button 
                      type="button"
                      (click)="consultQuickDni()"
                      [disabled]="newQuickClient.dni.length !== 8 || isConsulting()"
                      class="absolute inset-y-1 right-1 px-3 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <lucide-icon *ngIf="!isConsulting()" name="search" class="w-3.5 h-3.5"></lucide-icon>
                      <lucide-icon *ngIf="isConsulting()" name="loader-2" class="w-3.5 h-3.5 animate-spin"></lucide-icon>
                    </button>
                  </div>
                </div>
                <div class="col-span-2">
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nombre Completo</label>
                  <input type="text" [(ngModel)]="newQuickClient.name" name="quickName" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-emerald-600 focus:bg-white transition-all">
                </div>
                <div>
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Teléfono</label>
                  <input type="text" [(ngModel)]="newQuickClient.phone" name="quickPhone" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-emerald-600 focus:bg-white transition-all">
                </div>
                <div>
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Email</label>
                  <input type="email" [(ngModel)]="newQuickClient.email" name="quickEmail" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-emerald-600 focus:bg-white transition-all">
                </div>
                <div class="col-span-2">
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Dirección</label>
                  <input type="text" [(ngModel)]="newQuickClient.address" name="quickAddress" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-emerald-600 focus:bg-white transition-all">
                </div>
              </div>
              
              <div class="flex gap-4 pt-4">
                <button type="button" (click)="showAddClientModal.set(false)" class="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-all text-xs">Cancelar</button>
                <button type="submit" [disabled]="isSavingClient()" class="flex-[1.5] bg-emerald-600 text-white py-4 rounded-xl font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg text-xs uppercase">
                  <lucide-icon *ngIf="isSavingClient()" name="loader-2" class="w-4 h-4 animate-spin"></lucide-icon>
                  {{ isSavingClient() ? 'Guardando...' : 'Registrar y Seleccionar' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Sidebar Summary -->
        <div class="space-y-6">
          <div class="bg-[#7B61FF] p-8 rounded-[2.5rem] text-white shadow-xl shadow-[#7B61FF]/20 relative overflow-hidden group">
            <lucide-icon name="trending-up" class="w-24 h-24 absolute -right-6 -bottom-6 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-700"></lucide-icon>
            <h3 class="text-sm font-black uppercase tracking-widest mb-6 opacity-80">Proyección del Crédito</h3>
            <div class="space-y-6 relative z-10">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Total a Pagar</p>
                <p class="text-3xl font-black tracking-tighter">S/ {{ calculateTotal() | number:'1.0-0' }}</p>
                <p class="text-[10px] opacity-60 mt-1">Capital + {{ loan.interestRate }}% de interés.</p>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Cuota Aproximada</p>
                <p class="text-3xl font-black tracking-tighter">S/ {{ calculateInstallment() | number:'1.2-2' }}</p>
                <p class="text-[10px] opacity-60 mt-1">Repartido en {{ loan.totalInstallments }} cuotas.</p>
              </div>
            </div>
          </div>

          <div class="bg-amber-50 border border-amber-100 p-6 rounded-3xl space-y-3">
            <div class="flex items-center gap-3 text-amber-600">
              <lucide-icon name="shield-check" class="w-5 h-5"></lucide-icon>
              <p class="text-xs font-black uppercase tracking-tight">Validación</p>
            </div>
            <p class="text-[10px] text-amber-700 font-medium leading-relaxed">
              Al crear el préstamo se generará automáticamente el cronograma de pagos según la frecuencia seleccionada. Verifique que la fecha de inicio sea correcta.
            </p>
          </div>

          <!-- Simulation Card -->
          <div *ngIf="loan.amount > 0 && loan.totalInstallments > 0" class="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-900">Simulación</h4>
              <button 
                type="button"
                (click)="showSimulationModal.set(true)"
                class="text-[9px] font-black text-emerald-600 hover:underline"
              >
                VER DETALLES
              </button>
            </div>
            
            <div class="space-y-3">
              <div class="flex items-center justify-between text-[10px]">
                <span class="text-slate-400 font-bold uppercase tracking-tighter">Interés ({{ loan.interestRate }}%)</span>
                <span class="text-slate-900 font-black">S/ {{ (loan.amount * (loan.interestRate / 100)) | number:'1.0-0' }}</span>
              </div>
              <div class="flex items-center justify-between text-[10px]">
                <span class="text-slate-400 font-bold uppercase tracking-tighter">Cuota ({{ loan.totalInstallments }}x)</span>
                <span class="text-emerald-600 font-black">S/ {{ calculateInstallment() | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Installments Simulation Modal (Flutter Style) -->
    <div *ngIf="showSimulationModal()" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300" (click)="showSimulationModal.set(false)"></div>
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-8 relative z-10 animate-in zoom-in-95 duration-300 border border-white/20">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-100">
              <lucide-icon name="calendar" class="w-6 h-6"></lucide-icon>
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-900 tracking-tight">Simulación de Cuotas</h3>
              <p class="text-xs text-slate-500 font-medium mt-0.5">Cronograma de pagos proyectado.</p>
            </div>
          </div>
          <button (click)="showSimulationModal.set(false)" class="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-900 transition-all">
            <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
          </button>
        </div>

        <!-- Summary Card -->
        <div class="grid grid-cols-3 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
          <div class="text-center">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capital</p>
            <p class="text-lg font-black text-slate-900">S/ {{ loan.amount | number:'1.0-0' }}</p>
          </div>
          <div class="text-center">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Interés ({{ loan.interestRate }}%)</p>
            <p class="text-lg font-black text-slate-900">S/ {{ (loan.amount * (loan.interestRate / 100)) | number:'1.0-0' }}</p>
          </div>
          <div class="text-center border-l border-slate-200">
            <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total</p>
            <p class="text-xl font-black text-emerald-600">S/ {{ calculateTotal() | number:'1.0-0' }}</p>
          </div>
        </div>

        <!-- Table Header -->
        <div class="grid grid-cols-6 px-4 py-3 bg-slate-900 rounded-xl mb-4 text-white">
          <span class="text-[10px] font-black uppercase">N°</span>
          <span class="col-span-3 text-[10px] font-black uppercase">Fecha Sugerida</span>
          <span class="col-span-2 text-[10px] font-black uppercase text-right">Monto Cuota</span>
        </div>

        <!-- Installment List -->
        <div class="space-y-1 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
          <div *ngFor="let item of generateSimulation()" class="grid grid-cols-6 items-center px-4 py-4 rounded-xl hover:bg-slate-50 border-b border-slate-50 transition-colors group">
            <span class="text-xs font-black text-slate-400 group-hover:text-slate-900">{{ item.number }}</span>
            <span class="col-span-3 text-xs font-bold text-slate-700">{{ item.date | date:'EEEE, dd/MM/yyyy' | titlecase }}</span>
            <span class="col-span-2 text-sm font-black text-slate-900 text-right">S/ {{ item.amount | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="mt-8">
          <button 
            (click)="showSimulationModal.set(false)"
            class="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all uppercase tracking-widest"
          >
            Cerrar Simulación
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class LoanFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loanService = inject(LoanService);
  clientService = inject(ClientService);

  isEditing = signal(false);
  isSaving = signal(false);
  loanId = signal<string | null>(null);
  showAddClientModal = signal(false);
  showSimulationModal = signal(false);
  showClientDropdown = signal(false);
  clientSearchTerm = signal('');
  isSavingClient = signal(false);
  isConsulting = signal(false);

  paymentFrequencies = [
    { value: 'DAILY', label: 'Diario' },
    { value: 'WEEKLY', label: 'Semanal' },
    { value: 'BIWEEKLY', label: 'Quincenal' },
    { value: 'MONTHLY', label: 'Mensual' }
  ];

  selectedId = signal('');

  selectedClientName = computed(() => {
    const client = this.clientService.clients().find(c => c.id === this.selectedId());
    return client ? client.name : '';
  });

  filteredClientsForSelect = computed(() => {
    const term = this.clientSearchTerm().toLowerCase();
    return this.clientService.clients().filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.dni.includes(term)
    );
  });

  newQuickClient = {
    name: '',
    dni: '',
    phone: '',
    email: '',
    address: ''
  };

  loan: any = {
    clientId: '',
    amount: 0,
    interestRate: 20,
    totalInstallments: 1,
    paymentFrequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0]
  };

  ngOnInit() {
    this.clientService.loadClients().subscribe();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.loanId.set(id);
      this.loadLoan(id);
    }
  }

  loadLoan(id: string) {
    this.loanService.loadLoans().subscribe(loans => {
      const l = loans.find(x => x.id === id);
      if (l) {
        this.loan = {
          clientId: l.clientId,
          amount: l.amount,
          interestRate: (l.interestRate || 0) * 100,
          totalInstallments: l.totalInstallments,
          paymentFrequency: l.paymentFrequency || l.frequency,
          startDate: l.startDate
        };
        this.selectedId.set(l.clientId);
      } else {
        this.router.navigate(['/loans']);
      }
    });
  }

  calculateTotal() {
    const amount = this.loan.amount || 0;
    const interest = this.loan.interestRate || 0;
    return amount + (amount * (interest / 100));
  }

  calculateInstallment() {
    const total = this.calculateTotal();
    const inst = this.loan.totalInstallments || 1;
    return total / inst;
  }

  generateSimulation() {
    const installments = [];
    const amountPerInstallment = this.calculateInstallment();
    // Usar mediodía para evitar problemas de zona horaria al manipular fechas
    let currentDate = new Date(this.loan.startDate + 'T12:00:00');

    for (let i = 1; i <= this.loan.totalInstallments; i++) {
      // En Flutter, la primera cuota es un ciclo después de la fecha de inicio
      switch (this.loan.paymentFrequency) {
        case 'DAILY': currentDate.setDate(currentDate.getDate() + 1); break;
        case 'WEEKLY': currentDate.setDate(currentDate.getDate() + 7); break;
        case 'BIWEEKLY': currentDate.setDate(currentDate.getDate() + 14); break;
        case 'MONTHLY': currentDate.setMonth(currentDate.getMonth() + 1); break;
      }
      
      installments.push({
        number: i,
        date: new Date(currentDate),
        amount: amountPerInstallment
      });
    }
    return installments;
  }

  save() {
    this.isSaving.set(true);
    const request: LoanCreateRequest = {
      clientId: this.loan.clientId,
      amount: this.loan.amount,
      interestRate: this.loan.interestRate,
      totalInstallments: this.loan.totalInstallments,
      paymentFrequency: this.loan.paymentFrequency,
      startDate: this.loan.startDate
    };

    const obs = this.isEditing() 
      ? this.loanService.updateLoan(this.loanId()!, request as any)
      : this.loanService.createLoan(request);

    obs.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.router.navigate(['/loans', this.isEditing() ? this.loanId() : res.id]);
      },
      error: () => this.isSaving.set(false)
    });
  }

  consultQuickDni() {
    if (this.newQuickClient.dni.length !== 8) return;
    this.isConsulting.set(true);
    this.clientService.consultDni(this.newQuickClient.dni).subscribe({
      next: (response) => {
        const data = response.data || response;
        if (data && (data.nombreCompleto || data.nombres)) {
          this.newQuickClient.name = data.nombreCompleto || `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`.trim().replaceAll(/\s+/g, ' ');
          if (data.direccion) this.newQuickClient.address = data.direccion;
        }
        this.isConsulting.set(false);
      },
      error: () => this.isConsulting.set(false)
    });
  }

  quickSaveClient() {
    this.isSavingClient.set(true);
    this.clientService.createClient(this.newQuickClient).subscribe({
      next: (client) => {
        this.loan.clientId = client.id;
        this.selectedId.set(client.id);
        this.showAddClientModal.set(false);
        this.isSavingClient.set(false);
        this.newQuickClient = { name: '', dni: '', phone: '', email: '', address: '' };
      },
      error: () => this.isSavingClient.set(false)
    });
  }

  toggleClientDropdown() {
    if (this.isEditing()) return;
    this.showClientDropdown.update(v => !v);
  }

  selectClient(client: any) {
    this.loan.clientId = client.id;
    this.selectedId.set(client.id);
    this.showClientDropdown.set(false);
    this.clientSearchTerm.set('');
  }

  @HostListener('document:click')
  closeDropdown() {
    this.showClientDropdown.set(false);
  }

  cancel() {
    this.router.navigate(['/loans']);
  }
}
