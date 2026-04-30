import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { 
  LucideAngularModule, 
  Search, 
  Plus, 
  Home, 
  ChevronRight, 
  MoreHorizontal, 
  Wallet, 
  Loader2, 
  CheckCircle2, 
  Calendar,
  X,
  User,
  Check,
  Building,
  TrendingUp,
  Clock,
  CircleDollarSign,
  RefreshCw,
  Edit2,
  Banknote,
  History
} from 'lucide-angular';
import { RentalService } from '../../../core/services/rental.service';
import { TenantService } from '../../../core/services/tenant.service';
import { AuthService } from '../../../core/services/auth.service';
import { Rental, RentalCreateRequest } from '../../../core/models/rental.model';
import { environment } from '../../../../environments/environment';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rental-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-10">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-[#7B61FF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#7B61FF]/10 shrink-0">
            <lucide-icon name="home" class="w-6 h-6"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Gestión de Alquileres</h1>
            <p class="text-xs text-slate-500 font-medium">Control de habitaciones e inquilinos.</p>
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
              placeholder="Buscar por habitación o inquilino..." 
              class="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-[#7B61FF]/10 focus:border-[#7B61FF] focus:bg-white transition-all outline-none text-[11px] shadow-sm"
            >
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
              routerLink="/rentals/new"
              class="bg-[#7B61FF] text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-[#6349E6] hover:shadow-lg transition-all text-xs"
            >
              <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
              Nuevo Contrato
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
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Recaudación Total</p>
            <p class="text-xl font-black text-slate-900">S/ {{ getTotalRecaudacion() | number:'1.0-0' }}</p>
          </div>
        </div>
        <div class="bg-white border border-slate-100 p-5 rounded-[1.5rem] shadow-sm flex items-center gap-4">
          <div class="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <lucide-icon name="building" class="w-6 h-6"></lucide-icon>
          </div>
          <div>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pendientes</p>
            <p class="text-xl font-black text-slate-900">{{ getPendingCount() }} Contratos</p>
          </div>
        </div>
        <div class="bg-white border border-slate-100 p-5 rounded-[1.5rem] shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <div class="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <lucide-icon name="check-circle-2" class="w-6 h-6"></lucide-icon>
          </div>
          <div>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ocupación</p>
            <p class="text-xl font-black text-slate-900">{{ rentalService.rentals().length }} Habitaciones</p>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden relative min-h-[400px]">
        <!-- Loading State -->
        <div *ngIf="rentalService.loading()" class="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <lucide-icon name="loader-2" class="w-10 h-10 text-[#7B61FF] animate-spin mb-4"></lucide-icon>
          <p class="text-xs font-black text-slate-900 uppercase tracking-widest">Cargando alquileres...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!rentalService.loading() && filteredRentals().length === 0" class="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
            <lucide-icon name="home" class="w-10 h-10"></lucide-icon>
          </div>
          <h3 class="text-xl font-black text-slate-900 tracking-tight">No hay alquileres</h3>
          <p class="text-xs text-slate-500 font-medium mt-2 max-w-xs mx-auto">No se encontraron contratos que coincidan con tu búsqueda o aún no has registrado ninguno.</p>
        </div>

        <div class="overflow-x-auto" *ngIf="filteredRentals().length > 0">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Habitación / Inquilino</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Progreso</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Vencimiento</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let rental of paginatedRentals()" class="hover:bg-slate-50/50 transition-colors group">
                <td class="p-6">
                  <div class="flex items-center gap-4">
                    <div [routerLink]="['/rentals', rental.id]" class="w-10 h-10 bg-[#7B61FF]/5 text-[#7B61FF] rounded-xl flex items-center justify-center font-black cursor-pointer hover:bg-[#7B61FF] hover:text-white transition-colors">
                      <lucide-icon name="building" class="w-5 h-5"></lucide-icon>
                    </div>
                    <div [routerLink]="['/rentals', rental.id]" class="cursor-pointer">
                      <p class="font-black text-slate-900 text-sm tracking-tight">{{ rental.roomNumber }}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">{{ rental.tenant.name }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-6">
                  <div class="w-40">
                    <div class="flex items-center justify-between text-[9px] font-black uppercase mb-1.5">
                      <span class="text-[#7B61FF]">{{ rental.paidMonths || 0 }}/{{ rental.totalMonths }} Meses</span>
                      <span class="text-slate-400">S/ {{ rental.amount || 0 | number:'1.0-0' }}</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-[#7B61FF] rounded-full transition-all duration-1000" [style.width.%]="((rental.paidMonths || 0) / (rental.totalMonths || 1)) * 100"></div>
                    </div>
                  </div>
                </td>
                <td class="p-6 text-xs font-bold text-slate-600">
                  {{ rental.startDate | date:'dd MMM' }}
                </td>
                <td class="p-6 text-center">
                  <span [class]="rental.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'"
                        class="px-3 py-1 rounded-full text-[8px] font-black uppercase border tracking-tighter">
                    {{ rental.status === 'PAID' ? 'PAGADO' : 'ACTIVO' }}
                  </span>
                </td>
                <td class="p-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      *ngIf="rental.status !== 'PAID'" 
                      (click)="openPaymentModal(rental)" 
                      class="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-[#7B61FF] transition-all shadow-sm"
                      title="Registrar Cobro"
                    >
                      <lucide-icon name="banknote" class="w-3.5 h-3.5"></lucide-icon>
                    </button>
                    <button 
                      *ngIf="authService.hasAuthority('RENTALS_UPDATE')"
                      [routerLink]="['/rentals/edit', rental.id]"
                      class="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-[#7B61FF]/10 hover:text-[#7B61FF] transition-all border border-slate-100"
                      title="Editar Contrato"
                    >
                      <lucide-icon name="edit-2" class="w-3.5 h-3.5"></lucide-icon>
                    </button>
                    <button 
                      [routerLink]="['/rentals', rental.id]" 
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

      <!-- Payment Modal (Optimized) -->
      <div *ngIf="showPaymentModal()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300" (click)="showPaymentModal.set(false)"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 relative z-10 animate-in zoom-in-95 duration-300 border border-white/20">
          <div class="mb-6 text-center">
            <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm">
              <lucide-icon name="wallet" class="w-8 h-8"></lucide-icon>
            </div>
            <h3 class="text-xl font-black text-slate-900 tracking-tight">Cobrar Cuota</h3>
            <p class="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wide truncate">{{ selectedRentalForPayment()?.tenant?.name }}</p>
          </div>
          
          <div class="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100 text-center">
            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto de la Cuota</p>
            <p class="text-3xl font-black text-slate-900 tracking-tighter">S/ {{ (selectedRentalForPayment()?.amount || 0) | number:'1.2-2' }}</p>
          </div>

          <div class="space-y-5">
            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Monto Recibido</label>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">S/</span>
                <input type="number" [(ngModel)]="paymentAmount" class="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-4 font-black text-slate-900 text-xl outline-none focus:border-indigo-600 focus:bg-white transition-all tracking-tight">
              </div>
            </div>
            
            <div class="flex gap-3 pt-2">
              <button (click)="showPaymentModal.set(false)" class="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-all text-xs">Cerrar</button>
              <button (click)="confirmPayment()" [disabled]="isSaving()" class="flex-[1.5] bg-indigo-600 text-white py-4 rounded-xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg text-xs uppercase shadow-indigo-100">
                <lucide-icon *ngIf="isSaving()" name="loader-2" class="w-4 h-4 animate-spin"></lucide-icon>
                {{ isSaving() ? 'Cobrando...' : 'Confirmar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Modal (Optimized) -->
      <div *ngIf="showCreateModal()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300" (click)="showCreateModal.set(false)"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 relative z-10 animate-in zoom-in-95 duration-300 border border-white/20 max-h-[95vh] overflow-y-auto custom-scrollbar">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                <lucide-icon name="home" class="w-6 h-6"></lucide-icon>
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-900 tracking-tight">{{ isEditing() ? 'Actualizar Contrato' : 'Nuevo Contrato' }}</h3>
                <p class="text-xs text-slate-500 font-medium mt-0.5">{{ isEditing() ? 'Modifica los términos del arrendamiento.' : 'Términos del arrendamiento.' }}</p>
              </div>
            </div>
            <button (click)="showCreateModal.set(false)" class="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-900 transition-all">
              <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
            </button>
          </div>
          
          <form (submit)="saveRental()" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="sm:col-span-2">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Inquilino</label>
                <button 
                  type="button" 
                  (click)="openTenantModal()"
                  class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-left flex items-center justify-between hover:border-indigo-400 hover:bg-white transition-all group"
                >
                  <span [class.text-slate-400]="!selectedTenantName()" class="truncate max-w-[80%]">
                    {{ selectedTenantName() || 'Seleccionar o registrar inquilino' }}
                  </span>
                  <lucide-icon name="chevron-right" class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-all"></lucide-icon>
                </button>
              </div>

              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Nº Habitación</label>
                <input type="text" [(ngModel)]="newRental.roomId" name="roomId" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-indigo-400 focus:bg-white transition-all" placeholder="Ej: 204">
              </div>

              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Renta (S/)</label>
                <input type="number" [(ngModel)]="newRental.monthlyRent" name="monthlyRent" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-indigo-400 focus:bg-white transition-all">
              </div>

              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Duración</label>
                <select [(ngModel)]="newRental.totalMonths" name="totalMonths" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none appearance-none">
                  <option [value]="6">6 Meses</option>
                  <option [value]="12">12 Meses</option>
                  <option [value]="24">24 Meses</option>
                </select>
              </div>

              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Fecha Inicio</label>
                <input type="date" [(ngModel)]="newRental.startDate" name="startDate" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-indigo-400 focus:bg-white transition-all">
              </div>
            </div>

            <div class="flex gap-4 pt-6 border-t border-slate-100">
              <button type="button" (click)="showCreateModal.set(false)" class="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-all text-xs">Cancelar</button>
              <button type="submit" [disabled]="isSaving() || !newRental.tenantId" class="flex-[1.5] bg-slate-900 text-white px-6 py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs uppercase shadow-lg">
                <lucide-icon *ngIf="isSaving()" name="loader-2" class="w-4 h-4 animate-spin"></lucide-icon>
                {{ isSaving() ? 'Guardando...' : (isEditing() ? 'Actualizar Contrato' : 'Finalizar Contrato') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tenant Modal (Optimized) -->
      <div *ngIf="showTenantModal()" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-lg transition-all duration-500" (click)="showTenantModal.set(false)"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative z-10 animate-in zoom-in-95 duration-300 border border-white/20">
          <div class="flex items-center gap-3 mb-8">
            <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <lucide-icon name="user" class="w-5 h-5"></lucide-icon>
            </div>
            <h3 class="text-xl font-black text-slate-900 tracking-tight">Nuevo Inquilino</h3>
          </div>
          
          <div class="space-y-5">
            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Nombre Completo</label>
              <input type="text" [(ngModel)]="tenantData.name" class="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-black outline-none border border-slate-100 focus:bg-white transition-all" [class.border-rose-500]="tenantErrors().name">
              <p *ngIf="tenantErrors().name" class="text-[8px] text-rose-500 font-bold mt-1 ml-1 uppercase">{{ tenantErrors().name }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Documento (DNI)</label>
                <input type="text" [(ngModel)]="tenantData.dni" class="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-black outline-none border border-slate-100 focus:bg-white transition-all" [class.border-rose-500]="tenantErrors().dni" maxlength="8">
                <p *ngIf="tenantErrors().dni" class="text-[8px] text-rose-500 font-bold mt-1 ml-1 uppercase">{{ tenantErrors().dni }}</p>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Teléfono</label>
                <input type="text" [(ngModel)]="tenantData.phone" class="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-black outline-none border border-slate-100 focus:bg-white transition-all" [class.border-rose-500]="tenantErrors().phone" maxlength="9">
                <p *ngIf="tenantErrors().phone" class="text-[8px] text-rose-500 font-bold mt-1 ml-1 uppercase">{{ tenantErrors().phone }}</p>
              </div>
            </div>

            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Dirección</label>
              <input type="text" [(ngModel)]="tenantData.address" class="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-black outline-none border border-slate-100 focus:bg-white transition-all">
            </div>
            
            <div class="flex gap-3 pt-4">
              <button (click)="showTenantModal.set(false)" class="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-all text-xs">Cerrar</button>
              <button (click)="saveQuickTenant()" class="flex-[1.5] bg-emerald-600 text-white py-4 rounded-xl font-black hover:bg-emerald-700 transition-all shadow-lg text-xs uppercase shadow-emerald-100">Guardar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Details Modal (Optimized) -->
      <div *ngIf="showDetailsModal()" class="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" (click)="showDetailsModal.set(false)"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 relative z-10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <lucide-icon name="history" class="w-6 h-6"></lucide-icon>
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-900">Plan de Pagos</h3>
                <p class="text-xs text-slate-500 font-medium">Inquilino: {{ selectedRental()?.tenant?.name }}</p>
              </div>
            </div>
            <button (click)="showDetailsModal.set(false)" class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900">
              <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            <div *ngFor="let month of getPaymentSchedule(selectedRental()!)" 
                 class="p-4 rounded-2xl border flex items-center justify-between transition-all"
                 [class.bg-emerald-50]="month.isPaid"
                 [class.border-emerald-100]="month.isPaid"
                 [class.bg-slate-50]="!month.isPaid"
                 [class.border-slate-100]="!month.isPaid"
            >
              <div class="flex items-center gap-4">
                <div [class]="month.isPaid ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 shadow-sm'" 
                     class="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs">
                  {{ month.month }}
                </div>
                <div>
                  <p class="text-[8px] font-black uppercase mb-0.5" [class]="month.isPaid ? 'text-emerald-700' : 'text-slate-400'">Mes {{ month.month }}</p>
                  <p class="font-black text-slate-900 text-xs tracking-tight">{{ month.dueDate | date:'dd MMM, yyyy' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <p class="font-black text-slate-900 text-sm">S/ {{ month.amount | number:'1.0-0' }}</p>
                <div *ngIf="month.isPaid" class="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg text-[8px] font-black uppercase flex items-center gap-1">
                  <lucide-icon name="check" class="w-3 h-3"></lucide-icon>
                  Pagado
                </div>
                <button 
                  *ngIf="!month.isPaid && authService.hasAuthority('RENTALS_UPDATE')"
                  (click)="openPaymentModal(selectedRental()!)"
                  class="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-black text-[9px] uppercase hover:bg-indigo-700 transition-all"
                >
                  Pagar
                </button>
              </div>
            </div>
          </div>
          <button (click)="showDetailsModal.set(false)" class="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs hover:bg-indigo-600 transition-all shadow-lg active:scale-95">Cerrar Plan</button>
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
export class RentalListComponent implements OnInit {
  rentalService = inject(RentalService);
  tenantService = inject(TenantService);
  authService = inject(AuthService);
  http = inject(HttpClient);

  searchTerm = signal('');
  showCreateModal = signal(false);
  showPaymentModal = signal(false);
  showTenantModal = signal(false);
  showDetailsModal = signal(false);
  isSaving = signal(false);
  isSavingTenant = signal(false);
  isRefreshing = signal(false);
  isEditing = signal(false);
  selectedRentalId = signal<string | null>(null);
  tenantErrors = signal<any>({});

  selectedRental = signal<Rental | null>(null);
  selectedRentalForPayment = signal<Rental | null>(null);
  selectedTenantName = signal<string>('');
  paymentAmount = 0;

  newRental: any = {
    tenantId: '',
    roomId: '',
    monthlyRent: 0,
    securityDeposit: 0,
    startDate: new Date().toISOString().split('T')[0],
    totalMonths: 6
  };

  tenantData: any = { id: null, name: '', phone: '', dni: '', address: '', email: '', roomNumber: '' };

  filteredRentals = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.rentalService.rentals().filter(r => 
      (r.roomNumber || '').toLowerCase().includes(term) ||
      (r.tenant?.name || '').toLowerCase().includes(term)
    );
  });

  currentPage = signal(1);
  pageSize = 10;

  paginatedRentals = computed(() => {
    const rentals = this.filteredRentals();
    const start = (this.currentPage() - 1) * this.pageSize;
    return rentals.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredRentals().length / this.pageSize);
  });

  constructor() {
    import('@angular/core').then(({ effect }) => {
      effect(() => {
        this.searchTerm();
        this.currentPage.set(1);
      }, { allowSignalWrites: true });
    });
  }

  ngOnInit() {
    this.rentalService.loadRentals().subscribe();
    this.tenantService.loadTenants().subscribe();
  }

  getTotalRecaudacion() {
    return this.rentalService.rentals().reduce((acc, r) => acc + (r.amountPaid || 0), 0);
  }

  getPendingCount() {
    return this.rentalService.rentals().filter(r => r.status !== 'PAID').length;
  }

  getPaymentSchedule(rental: Rental) {
    if (!rental) return [];
    const schedule = [];
    const start = new Date(rental.startDate);
    for (let i = 1; i <= rental.totalMonths; i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(start.getMonth() + i);
      schedule.push({
        month: i,
        dueDate: dueDate,
        amount: rental.amount,
        isPaid: i <= (rental.paidMonths || 0)
      });
    }
    return schedule;
  }

  openDetailsModal(rental: Rental) {
    this.selectedRental.set(rental);
    this.showDetailsModal.set(true);
  }

  openTenantModal() {
    this.showTenantModal.set(true);
  }

  refreshData() {
    this.isRefreshing.set(true);
    this.rentalService.loadRentals().subscribe({
      next: () => this.isRefreshing.set(false),
      error: () => this.isRefreshing.set(false)
    });
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.selectedRentalId.set(null);
    this.selectedTenantName.set('');
    this.newRental = {
      tenantId: '',
      roomId: '',
      monthlyRent: 0,
      securityDeposit: 0,
      startDate: new Date().toISOString().split('T')[0],
      totalMonths: 6
    };
    this.showCreateModal.set(true);
  }

  openEditModal(rental: Rental) {
    this.isEditing.set(true);
    this.selectedRentalId.set(rental.id);
    this.selectedTenantName.set(rental.tenant.name);
    this.newRental = {
      tenantId: rental.tenant.id,
      roomId: rental.roomNumber,
      monthlyRent: rental.amount,
      securityDeposit: rental.securityDeposit || 0,
      startDate: rental.startDate,
      totalMonths: rental.totalMonths
    };
    this.showCreateModal.set(true);
  }

  validateTenantForm() {
    const errs: any = {};
    const dniRegex = /^\d{8}$/;
    const phoneRegex = /^\d{9}$/;

    if (!this.tenantData.name) errs.name = "Requerido";
    if (!dniRegex.test(this.tenantData.dni)) errs.dni = "8 números";
    if (!phoneRegex.test(this.tenantData.phone)) errs.phone = "9 números";
    
    this.tenantErrors.set(errs);
    return Object.keys(errs).length === 0;
  }

  saveQuickTenant() {
    if (!this.validateTenantForm()) return;
    this.isSavingTenant.set(true);
    if (!this.tenantData.roomNumber) this.tenantData.roomNumber = this.newRental.roomId || 'PENDING';
    const request = this.tenantData.id 
      ? this.http.put<any>(`${environment.apiUrl}/tenants/${this.tenantData.id}`, this.tenantData)
      : this.tenantService.createTenant(this.tenantData);
    request.subscribe({
      next: (tenant: any) => {
        this.newRental.tenantId = tenant.id;
        this.selectedTenantName.set(tenant.name);
        this.tenantData.id = tenant.id;
        this.isSavingTenant.set(false);
        this.showTenantModal.set(false);
      },
      error: () => this.isSavingTenant.set(false)
    });
  }

  saveRental() {
    this.isSaving.set(true);
    const requestData: RentalCreateRequest = {
      tenantId: this.newRental.tenantId,
      roomId: this.newRental.roomId,
      monthlyRent: this.newRental.monthlyRent,
      securityDeposit: this.newRental.securityDeposit,
      startDate: this.newRental.startDate,
      totalMonths: this.newRental.totalMonths
    };
    
    const obs = this.isEditing() && this.selectedRentalId()
      ? this.rentalService.updateRental(this.selectedRentalId()!, requestData as any)
      : this.rentalService.createRental(requestData);

    obs.subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.isSaving.set(false);
        this.refreshData();
      },
      error: () => this.isSaving.set(false)
    });
  }

  openPaymentModal(rental: Rental) {
    this.selectedRentalForPayment.set(rental);
    this.paymentAmount = rental.amount;
    this.showPaymentModal.set(true);
  }

  confirmPayment() {
    const rental = this.selectedRentalForPayment();
    if (!rental) return;
    this.isSaving.set(true);
    
    this.rentalService.registerPayment({
      rentalId: rental.id,
      amount: this.paymentAmount,
      note: 'Cobro de mensualidad - Panel Admin'
    }).subscribe({
      next: () => {
        this.showPaymentModal.set(false);
        this.isSaving.set(false);
        this.rentalService.loadRentals().subscribe();
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
