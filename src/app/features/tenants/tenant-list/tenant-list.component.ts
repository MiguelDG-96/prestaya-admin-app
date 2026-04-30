import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule, 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal,
  Loader2,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Trash2
} from 'lucide-angular';
import { TenantService } from '../../../core/services/tenant.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-10">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-[#7B61FF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#7B61FF]/10 shrink-0">
            <lucide-icon name="users" class="w-6 h-6"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Gestión de Inquilinos</h1>
            <p class="text-xs text-slate-500 font-medium">Directorio centralizado de inquilinos.</p>
          </div>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative min-w-[280px] group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <lucide-icon name="search" class="w-4 h-4 text-slate-400 group-focus-within:text-[#7B61FF] transition-colors"></lucide-icon>
            </div>
            <input 
              type="text" 
              [(ngModel)]="searchTerm"
              placeholder="Buscar por nombre o DNI..." 
              class="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-[#7B61FF]/10 focus:border-[#7B61FF] focus:bg-white transition-all outline-none text-[11px] shadow-sm"
            >
          </div>
          <button 
            (click)="showCreateModal.set(true)"
            class="bg-[#7B61FF] text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-[#6349E6] hover:shadow-lg transition-all text-xs"
          >
            <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
            Nuevo Inquilino
          </button>
        </div>
      </div>

      <!-- Tenants Table -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden relative min-h-[400px]">
        <div class="overflow-x-auto" *ngIf="filteredTenants().length > 0">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Inquilino</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identificación</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let tenant of paginatedTenants()" class="hover:bg-slate-50/50 transition-colors group">
                <td class="p-6">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-[#7B61FF]/5 text-[#7B61FF] rounded-xl flex items-center justify-center font-black">
                      {{ tenant.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-black text-slate-900 text-sm tracking-tight">{{ tenant.name }}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{{ tenant.address || 'Sin dirección' }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-6 text-xs font-bold text-slate-600">
                  <div class="flex items-center gap-2">
                    <lucide-icon name="id-card" class="w-3.5 h-3.5 text-slate-400"></lucide-icon>
                    {{ tenant.dni }}
                  </div>
                </td>
                <td class="p-6">
                  <div class="flex items-center gap-2 text-[10px] text-slate-600 font-black uppercase">
                    <lucide-icon name="phone" class="w-3 h-3 text-slate-400"></lucide-icon>
                    {{ tenant.phone }}
                  </div>
                </td>
                <td class="p-6 text-center">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter bg-emerald-50 text-emerald-600 border border-emerald-100">
                    ACTIVO
                  </span>
                </td>
                <td class="p-6 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button 
                      (click)="deleteTenant(tenant.id)"
                      class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
                      title="Eliminar Registro"
                    >
                      <lucide-icon name="trash-2" class="w-3.5 h-3.5"></lucide-icon>
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

        <!-- Empty State -->
        <div *ngIf="filteredTenants().length === 0" class="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
            <lucide-icon name="users" class="w-10 h-10"></lucide-icon>
          </div>
          <h3 class="text-xl font-black text-slate-900 tracking-tight">No hay inquilinos</h3>
          <p class="text-xs text-slate-500 font-medium mt-2 max-w-xs mx-auto">No se encontraron registros que coincidan con tu búsqueda.</p>
        </div>
      </div>

      <!-- Create Modal -->
      <div *ngIf="showCreateModal()" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-all duration-300" (click)="showCreateModal.set(false)"></div>
        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 relative z-10 animate-in zoom-in-95 duration-300 border border-white/20">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                <lucide-icon name="users" class="w-6 h-6"></lucide-icon>
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-900 tracking-tight">Nuevo Inquilino</h3>
                <p class="text-xs text-slate-500 font-medium mt-0.5">Registro de datos básicos.</p>
              </div>
            </div>
            <button (click)="showCreateModal.set(false)" class="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-900 transition-all">
              <lucide-icon name="x" class="w-5 h-5"></lucide-icon>
            </button>
          </div>
          
          <form (submit)="saveTenant()" class="space-y-6">
            <div class="grid grid-cols-2 gap-5">
              <div class="col-span-2">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nombre Completo</label>
                <input type="text" [(ngModel)]="newTenant.name" name="name" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-indigo-600 focus:bg-white transition-all">
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">DNI</label>
                <div class="relative group">
                  <input type="text" [(ngModel)]="newTenant.dni" name="dni" required class="w-full bg-slate-50 border border-slate-100 rounded-xl pl-4 pr-12 py-3 text-sm font-black outline-none focus:border-indigo-600 focus:bg-white transition-all" maxlength="8">
                  <button 
                    type="button"
                    (click)="consultDni()"
                    [disabled]="newTenant.dni.length !== 8 || isConsulting()"
                    class="absolute inset-y-1 right-1 px-3 flex items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <lucide-icon *ngIf="!isConsulting()" name="search" class="w-3.5 h-3.5"></lucide-icon>
                    <lucide-icon *ngIf="isConsulting()" name="loader-2" class="w-3.5 h-3.5 animate-spin"></lucide-icon>
                  </button>
                </div>
              </div>
              <div>
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Teléfono</label>
                <input type="text" [(ngModel)]="newTenant.phone" name="phone" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-indigo-600 focus:bg-white transition-all">
              </div>
              <div class="col-span-2">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Dirección</label>
                <input type="text" [(ngModel)]="newTenant.address" name="address" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-indigo-600 focus:bg-white transition-all">
              </div>
            </div>
            
            <div class="flex gap-4 pt-4">
              <button type="button" (click)="showCreateModal.set(false)" class="flex-1 py-4 font-black text-slate-400 hover:text-slate-900 transition-all text-xs">Cancelar</button>
              <button type="submit" [disabled]="isSaving()" class="flex-[1.5] bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg text-xs uppercase">
                <lucide-icon *ngIf="isSaving()" name="loader-2" class="w-4 h-4 animate-spin"></lucide-icon>
                {{ isSaving() ? 'Guardando...' : 'Registrar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    input::-webkit-search-decoration,
    input::-webkit-search-cancel-button,
    input::-webkit-search-results-button,
    input::-webkit-search-results-decoration { display: none; }
  `]
})
export class TenantListComponent implements OnInit {
  tenantService = inject(TenantService);
  clientService = inject(ClientService);
  authService = inject(AuthService);
 
  showCreateModal = signal(false);
  searchTerm = signal('');
  isSaving = signal(false);
  isConsulting = signal(false);

  filteredTenants = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.tenantService.tenants().filter(t => 
      t.name.toLowerCase().includes(term) || 
      t.dni.toLowerCase().includes(term)
    );
  });

  newTenant: any = {
    name: '',
    phone: '',
    dni: '',
    address: '',
    roomNumber: '',
    email: ''
  };

  currentPage = signal(1);
  pageSize = 10;

  paginatedTenants = computed(() => {
    const tenants = this.filteredTenants();
    const start = (this.currentPage() - 1) * this.pageSize;
    return tenants.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredTenants().length / this.pageSize);
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
    this.tenantService.loadTenants().subscribe();
  }

  consultDni() {
    if (this.newTenant.dni.length !== 8) return;
    
    this.isConsulting.set(true);
    this.clientService.consultDni(this.newTenant.dni).subscribe({
      next: (response) => {
        const data = response.data || response;
        if (data && (data.nombreCompleto || data.nombres)) {
          this.newTenant.name = data.nombreCompleto || `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`.trim().replaceAll(/\s+/g, ' ');
          if (data.direccion) this.newTenant.address = data.direccion;
        }
        this.isConsulting.set(false);
      },
      error: () => {
        this.isConsulting.set(false);
      }
    });
  }

  saveTenant() {
    this.isSaving.set(true);
    this.tenantService.createTenant(this.newTenant).subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.isSaving.set(false);
        this.resetForm();
      },
      error: () => this.isSaving.set(false)
    });
  }

  deleteTenant(id: string) {
    if (confirm('¿Estás seguro de eliminar este inquilino?')) {
      this.tenantService.deleteTenant(id).subscribe();
    }
  }

  private resetForm() {
    this.newTenant = {
      name: '',
      phone: '',
      dni: '',
      address: '',
      roomNumber: '',
      email: ''
    };
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
