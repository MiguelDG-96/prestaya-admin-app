import { Component, inject, signal, OnInit, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule, 
  ArrowLeft, 
  Save, 
  Home, 
  User, 
  Calendar, 
  CircleDollarSign, 
  Clock,
  Loader2,
  X,
  Plus,
  UserPlus,
  Search,
  ChevronRight,
  ShieldCheck
} from 'lucide-angular';
import { ClientService } from '../../../core/services/client.service';
import { RentalService } from '../../../core/services/rental.service';
import { TenantService } from '../../../core/services/tenant.service';
import { RentalCreateRequest } from '../../../core/models/rental.model';

@Component({
  selector: 'app-rental-form',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-10">
      <!-- Header -->
      <div class="flex items-center gap-6 px-2">
        <button 
          [routerLink]="isEditing() ? ['/rentals', rentalId()] : ['/rentals']"
          class="w-10 h-10 bg-white text-slate-400 rounded-xl flex items-center justify-center hover:text-indigo-600 transition-all border border-slate-100 shadow-sm"
        >
          <lucide-icon name="arrow-left" class="w-5 h-5"></lucide-icon>
        </button>
        <div>
          <h1 class="text-xl font-black text-slate-900 tracking-tight">{{ isEditing() ? 'Editar Alquiler' : 'Nuevo Alquiler' }}</h1>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ isEditing() ? 'Actualizar términos' : 'Definir nuevo contrato' }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <form (submit)="save()" class="space-y-6">
            <div class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <!-- Tenant Selection -->
              <div class="space-y-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                      <lucide-icon name="user" class="w-4 h-4"></lucide-icon>
                    </div>
                    <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Información del Inquilino</h3>
                  </div>
                  <button 
                    *ngIf="!isEditing()"
                    type="button"
                    (click)="showAddTenantModal.set(true)"
                    class="text-[10px] font-black text-[#7B61FF] hover:text-[#6349E6] flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <lucide-icon name="plus" class="w-3 h-3"></lucide-icon>
                    NUEVO INQUILINO
                  </button>
                </div>
                
                <div class="grid grid-cols-1 gap-4">
                  <div class="relative group">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Seleccionar Inquilino</label>
                    <div class="relative group" (click)="$event.stopPropagation()">
                      <!-- Custom Select Trigger -->
                      <div class="relative">
                        <button 
                          type="button"
                          (click)="toggleTenantDropdown()"
                          [disabled]="isEditing()"
                          class="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 font-bold text-slate-900 text-left flex items-center justify-between hover:bg-white focus:ring-4 focus:ring-[#7B61FF]/10 focus:border-[#7B61FF] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-xs"
                        >
                          <span [class.text-slate-400]="!selectedTenantName()">
                            {{ selectedTenantName() || 'Buscar e inquilino...' }}
                          </span>
                          <lucide-icon name="chevron-down" class="w-4 h-4 text-slate-400 transition-transform duration-300" [class.rotate-180]="showTenantDropdown()"></lucide-icon>
                        </button>

                        <!-- Custom Dropdown Panel -->
                        <div 
                          *ngIf="showTenantDropdown()" 
                          class="absolute z-50 left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        >
                          <div class="p-4 border-b border-slate-50">
                            <div class="relative group">
                              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <lucide-icon name="search" class="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors"></lucide-icon>
                              </div>
                              <input 
                                type="text" 
                                [ngModel]="tenantSearchTerm()" 
                                (ngModelChange)="tenantSearchTerm.set($event)"
                                name="tenantSearch"
                                (click)="$event.stopPropagation()"
                                placeholder="Buscar por nombre o DNI..." 
                                class="w-full bg-slate-50 border border-transparent rounded-xl pl-11 pr-4 py-3 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-600/10 transition-all outline-none text-xs"
                              >
                            </div>
                          </div>
                          
                          <div class="max-h-64 overflow-y-auto p-2 scrollbar-hide">
                            <div 
                              *ngFor="let tenant of filteredTenantsForSelect()" 
                              (click)="selectTenant(tenant)"
                              class="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors group"
                            >
                              <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {{ tenant.name.charAt(0).toUpperCase() }}
                              </div>
                              <div>
                                <p class="font-black text-slate-900 text-sm">{{ tenant.name }}</p>
                                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">DNI: {{ tenant.dni }}</p>
                              </div>
                            </div>
                            
                            <div *ngIf="filteredTenantsForSelect().length === 0" class="p-8 text-center">
                              <p class="text-xs text-slate-500 font-medium">No se encontraron inquilinos.</p>
                              <button 
                                type="button"
                                (click)="showAddTenantModal.set(true); showTenantDropdown.set(false)"
                                class="mt-4 text-xs font-black text-indigo-600 hover:underline"
                              >
                                + Registrar Nuevo Inquilino
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Property & Rent -->
              <div class="space-y-4">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <lucide-icon name="home" class="w-4 h-4"></lucide-icon>
                  </div>
                  <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Detalles del Inmueble</h3>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="group">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nº Habitación / Local</label>
                    <input 
                      type="text" 
                      [(ngModel)]="rental.roomId" 
                      name="roomId" 
                      required
                      placeholder="Ej: 301, Local A"
                      class="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 font-bold text-slate-900 outline-none focus:border-[#7B61FF] focus:bg-white transition-all text-xs"
                    >
                  </div>
                  <div class="group">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Renta Mensual (S/)</label>
                    <div class="relative group">
                      <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <span class="font-black text-slate-400">S/</span>
                      </div>
                      <input 
                        type="number" 
                        [(ngModel)]="rental.monthlyRent" 
                        name="monthlyRent" 
                        required
                        class="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-5 py-3 font-bold text-slate-900 outline-none focus:border-[#7B61FF] focus:bg-white transition-all text-xs"
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contract Terms -->
              <div class="space-y-4">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <lucide-icon name="clock" class="w-4 h-4"></lucide-icon>
                  </div>
                  <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Términos del Contrato</h3>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="group">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Duración del Contrato</label>
                    <select 
                      [(ngModel)]="rental.totalMonths" 
                      name="totalMonths"
                      class="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 font-bold text-slate-900 outline-none focus:border-[#7B61FF] focus:bg-white transition-all appearance-none text-xs"
                    >
                      <option [value]="6">6 Meses</option>
                      <option [value]="12">12 Meses</option>
                      <option [value]="24">24 Meses</option>
                      <option [value]="36">36 Meses</option>
                    </select>
                  </div>
                  <div class="group">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Fecha de Inicio</label>
                    <input 
                      type="date" 
                      [(ngModel)]="rental.startDate" 
                      name="startDate" 
                      required
                      class="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 font-bold text-slate-900 outline-none focus:border-[#7B61FF] focus:bg-white transition-all font-sans text-xs"
                    >
                  </div>
                </div>

                <div class="group pt-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Depósito de Garantía (Opcional)</label>
                  <div class="relative">
                    <span class="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">S/</span>
                    <input 
                      type="number" 
                      [(ngModel)]="rental.securityDeposit" 
                      name="securityDeposit" 
                      class="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-5 py-3 font-bold text-slate-900 outline-none focus:border-[#7B61FF] focus:bg-white transition-all text-xs"
                    >
                  </div>
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
                {{ isSaving() ? 'Procesando...' : (isEditing() ? 'Actualizar Alquiler' : 'Registrar Alquiler') }}
              </button>
            </div>
          </form>
        </div>

        <!-- Quick Add Tenant Modal -->
        <div *ngIf="showAddTenantModal()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300" (click)="showAddTenantModal.set(false)"></div>
          <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 relative z-10 animate-in zoom-in-95 duration-300 border border-white/20">
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-100">
                  <lucide-icon name="user-plus" class="w-6 h-6"></lucide-icon>
                </div>
                <div>
                  <h3 class="text-xl font-black text-slate-900 tracking-tight">Rápido: Nuevo Inquilino</h3>
                  <p class="text-xs text-slate-500 font-medium mt-0.5">Registra y selecciona al inquilino de inmediato.</p>
                </div>
              </div>
              <button (click)="showAddTenantModal.set(false)" class="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-900 transition-all">
                <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
              </button>
            </div>
            
            <form (submit)="quickSaveTenant()" class="space-y-6">
              <div class="grid grid-cols-2 gap-5">
                <div class="col-span-2">
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">DNI (Consulta Automática)</label>
                  <div class="relative group">
                    <input type="text" [(ngModel)]="newQuickTenant.dni" name="quickDni" required class="w-full bg-slate-50 border border-slate-100 rounded-xl pl-4 pr-12 py-3 text-sm font-black outline-none focus:border-indigo-600 focus:bg-white transition-all" maxlength="8">
                    <button 
                      type="button"
                      (click)="consultQuickDni()"
                      [disabled]="newQuickTenant.dni.length !== 8 || isConsulting()"
                      class="absolute inset-y-1 right-1 px-3 flex items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <lucide-icon *ngIf="!isConsulting()" name="search" class="w-3.5 h-3.5"></lucide-icon>
                      <lucide-icon *ngIf="isConsulting()" name="loader-2" class="w-3.5 h-3.5 animate-spin"></lucide-icon>
                    </button>
                  </div>
                </div>
                <div class="col-span-2">
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nombre Completo</label>
                  <input type="text" [(ngModel)]="newQuickTenant.name" name="quickName" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-indigo-600 focus:bg-white transition-all">
                </div>
                <div>
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Teléfono</label>
                  <input type="text" [(ngModel)]="newQuickTenant.phone" name="quickPhone" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-indigo-600 focus:bg-white transition-all">
                </div>
                <div class="col-span-2">
                  <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Dirección</label>
                  <input type="text" [(ngModel)]="newQuickTenant.address" name="quickAddress" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-indigo-600 focus:bg-white transition-all">
                </div>
              </div>
              
              <div class="flex gap-4 pt-4">
                <button type="button" (click)="showAddTenantModal.set(false)" class="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-all text-xs">Cancelar</button>
                <button type="submit" [disabled]="isSavingTenant()" class="flex-[1.5] bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg text-xs uppercase">
                  <lucide-icon *ngIf="isSavingTenant()" name="loader-2" class="w-4 h-4 animate-spin"></lucide-icon>
                  {{ isSavingTenant() ? 'Guardando...' : 'Registrar y Seleccionar' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Sidebar Info -->
        <div class="space-y-6">
          <div class="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <lucide-icon name="shield-check" class="w-24 h-24 absolute -right-6 -bottom-6 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-700"></lucide-icon>
            <h3 class="text-sm font-black uppercase tracking-widest mb-6 opacity-80">Resumen del Contrato</h3>
            <div class="space-y-6 relative z-10">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Total a Recaudar</p>
                <p class="text-3xl font-black tracking-tighter">S/ {{ (rental.monthlyRent || 0) * (rental.totalMonths || 0) | number:'1.0-0' }}</p>
                <p class="text-[10px] opacity-60 mt-1">En {{ rental.totalMonths }} meses de arrendamiento.</p>
              </div>
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Depósito Total</p>
                <p class="text-3xl font-black tracking-tighter">S/ {{ (rental.securityDeposit || 0) | number:'1.0-0' }}</p>
              </div>
            </div>
          </div>

          <div class="bg-amber-50 border border-amber-100 p-6 rounded-3xl space-y-3">
            <div class="flex items-center gap-3 text-amber-600">
              <lucide-icon name="info" class="w-5 h-5"></lucide-icon>
              <p class="text-xs font-black uppercase tracking-tight">Recordatorio</p>
            </div>
            <p class="text-[10px] text-amber-700 font-medium leading-relaxed">
              Asegúrese de verificar los datos del inquilino antes de finalizar. Una vez que se registren pagos, los términos principales del contrato no podrán ser editados por seguridad e integridad contable.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class RentalFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rentalService = inject(RentalService);
  tenantService = inject(TenantService);
  clientService = inject(ClientService);

  rentalId = signal<string | null>(null);
  isEditing = signal(false);
  isSaving = signal(false);
  showAddTenantModal = signal(false);
  showTenantDropdown = signal(false);
  tenantSearchTerm = signal('');
  isSavingTenant = signal(false);
  isConsulting = signal(false);
  selectedId = signal('');

  selectedTenantName = computed(() => {
    const tenant = this.tenantService.tenants().find(t => t.id === this.selectedId());
    return tenant ? tenant.name : '';
  });

  filteredTenantsForSelect = computed(() => {
    const term = this.tenantSearchTerm().toLowerCase();
    return this.tenantService.tenants().filter(t => 
      t.name.toLowerCase().includes(term) || 
      t.dni.includes(term)
    );
  });

  newQuickTenant = {
    name: '',
    dni: '',
    phone: '',
    address: '',
    roomNumber: '',
    email: ''
  };

  rental: any = {
    tenantId: '',
    roomId: '',
    monthlyRent: 0,
    securityDeposit: 0,
    startDate: new Date().toISOString().split('T')[0],
    totalMonths: 12
  };

  ngOnInit() {
    this.tenantService.loadTenants().subscribe();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.rentalId.set(id);
      this.loadRental(id);
    }
  }

  loadRental(id: string) {
    this.rentalService.loadRentals().subscribe(rentals => {
      const r = rentals.find(x => x.id === id);
      if (r) {
        this.rental = {
          tenantId: r.tenant.id,
          roomId: r.roomNumber,
          monthlyRent: r.amount,
          securityDeposit: r.securityDeposit || 0,
          startDate: r.startDate,
          totalMonths: r.totalMonths
        };
        this.selectedId.set(r.tenant.id);
      } else {
        this.router.navigate(['/rentals']);
      }
    });
  }

  save() {
    this.isSaving.set(true);
    const request: RentalCreateRequest = {
      tenantId: this.rental.tenantId,
      roomId: this.rental.roomId,
      monthlyRent: this.rental.monthlyRent,
      securityDeposit: this.rental.securityDeposit,
      startDate: this.rental.startDate,
      totalMonths: this.rental.totalMonths
    };

    const obs = this.isEditing() 
      ? this.rentalService.updateRental(this.rentalId()!, request as any)
      : this.rentalService.createRental(request);

    obs.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.router.navigate(['/rentals', this.isEditing() ? this.rentalId() : res.id]);
      },
      error: () => this.isSaving.set(false)
    });
  }

  consultQuickDni() {
    if (this.newQuickTenant.dni.length !== 8) return;
    this.isConsulting.set(true);
    this.clientService.consultDni(this.newQuickTenant.dni).subscribe({
      next: (response) => {
        const data = response.data || response;
        if (data && (data.nombreCompleto || data.nombres)) {
          this.newQuickTenant.name = data.nombreCompleto || `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`.trim().replaceAll(/\s+/g, ' ');
          if (data.direccion) this.newQuickTenant.address = data.direccion;
        }
        this.isConsulting.set(false);
      },
      error: () => this.isConsulting.set(false)
    });
  }

  quickSaveTenant() {
    this.isSavingTenant.set(true);
    this.tenantService.createTenant(this.newQuickTenant).subscribe({
      next: (tenant) => {
        this.rental.tenantId = tenant.id;
        this.selectedId.set(tenant.id);
        this.showAddTenantModal.set(false);
        this.isSavingTenant.set(false);
        this.newQuickTenant = { name: '', dni: '', phone: '', address: '', roomNumber: '', email: '' };
      },
      error: () => this.isSavingTenant.set(false)
    });
  }

  toggleTenantDropdown() {
    if (this.isEditing()) return;
    this.showTenantDropdown.update(v => !v);
  }

  selectTenant(tenant: any) {
    this.rental.tenantId = tenant.id;
    this.selectedId.set(tenant.id);
    this.showTenantDropdown.set(false);
    this.tenantSearchTerm.set('');
  }

  @HostListener('document:click')
  closeDropdown() {
    this.showTenantDropdown.set(false);
  }

  cancel() {
    this.router.navigate(['/rentals']);
  }
}
