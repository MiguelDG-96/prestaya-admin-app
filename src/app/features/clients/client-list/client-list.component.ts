import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule, 
  Search, 
  Plus, 
  User, 
  Phone, 
  Mail, 
  MoreHorizontal, 
  Trash2,
  MapPin,
  Loader2,
  IdCard,
  RefreshCw,
  Edit2
} from 'lucide-angular';
import { ClientService } from '../../../core/services/client.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClientCreateRequest, Client } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-10">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-[#7B61FF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#7B61FF]/10 shrink-0">
            <lucide-icon name="user" class="w-6 h-6"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Gestión de Clientes</h1>
            <p class="text-xs text-slate-500 font-medium">Administra tu base de datos y perfiles.</p>
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
              placeholder="Buscar por nombre, DNI o ID..." 
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
              *ngIf="authService.hasAuthority('CLIENTS_CREATE')"
              (click)="openCreateModal()"
              class="bg-[#7B61FF] text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-[#6349E6] hover:shadow-lg transition-all text-xs"
            >
              <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
              Nuevo Cliente
            </button>
          </div>
        </div>
      </div>

      <!-- Clients Table -->
      <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden relative min-h-[400px]">
        <div class="overflow-x-auto" *ngIf="filteredClients().length > 0">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">DNI / Documento</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th class="p-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let client of paginatedClients()" class="hover:bg-slate-50/30 transition-colors group">
                <td class="p-6">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-[#7B61FF]/5 text-[#7B61FF] rounded-xl flex items-center justify-center font-black">
                      {{ client.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-black text-slate-900 text-sm">{{ client.name }}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{{ client.address || 'Sin dirección' }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-6 text-xs font-bold text-slate-600">
                  <div class="flex items-center gap-2">
                    <lucide-icon name="id-card" class="w-3.5 h-3.5 text-slate-400"></lucide-icon>
                    {{ client.dni }}
                  </div>
                </td>
                <td class="p-6">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 text-[10px] text-slate-600 font-black uppercase">
                      <lucide-icon name="phone" class="w-3 h-3 text-slate-400"></lucide-icon>
                      {{ client.phone }}
                    </div>
                    <div class="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                      <lucide-icon name="mail" class="w-3 h-3 text-slate-400"></lucide-icon>
                      {{ client.email }}
                    </div>
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
                      *ngIf="authService.hasAuthority('CLIENTS_UPDATE')"
                      (click)="openEditModal(client)"
                      class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-[#7B61FF]/10 hover:text-[#7B61FF] transition-all border border-slate-100"
                      title="Editar Perfil"
                    >
                      <lucide-icon name="edit-2" class="w-3.5 h-3.5"></lucide-icon>
                    </button>
                    <button 
                      *ngIf="authService.hasAuthority('CLIENTS_DELETE')"
                      (click)="deleteClient(client.id)"
                      class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
                      title="Eliminar Cliente"
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
        <div *ngIf="filteredClients().length === 0" class="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
            <lucide-icon name="user" class="w-10 h-10"></lucide-icon>
          </div>
          <h3 class="text-xl font-black text-slate-900 tracking-tight">No hay clientes</h3>
          <p class="text-xs text-slate-500 font-medium mt-2 max-w-xs mx-auto">No se encontraron registros que coincidan con tu búsqueda o aún no has registrado ninguno.</p>
        </div>
      </div>

      <!-- Create Modal -->
      <div *ngIf="showCreateModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="showCreateModal.set(false)"></div>
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
          
          
          <h3 class="text-2xl font-black text-slate-900 mb-2">{{ isEditing() ? 'Actualizar Cliente' : 'Nuevo Cliente' }}</h3>
          <p class="text-slate-500 mb-8">{{ isEditing() ? 'Modifica los datos del cliente seleccionado.' : 'Completa los datos para registrar un nuevo cliente en el sistema.' }}</p>
          
          <form (submit)="saveClient()" class="space-y-5">
            <div class="grid grid-cols-2 gap-5">
              <div class="col-span-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nombre Completo</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <lucide-icon name="user" class="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors"></lucide-icon>
                  </div>
                  <input type="text" [(ngModel)]="newClient.name" name="name" required class="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none text-xs">
                </div>
              </div>
              
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">DNI / Documento</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <lucide-icon name="id-card" class="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors"></lucide-icon>
                  </div>
                  <input type="text" [(ngModel)]="newClient.dni" (blur)="onDniChange()" name="dni" required class="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-12 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none text-xs" [class.ring-4]="errors().dni" [class.ring-rose-500/10]="errors().dni" [class.border-rose-500]="errors().dni" maxlength="8">
                  <button 
                    type="button"
                    (click)="consultDni()"
                    [disabled]="newClient.dni.length !== 8 || isConsulting()"
                    class="absolute inset-y-2 right-2 px-3 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <lucide-icon *ngIf="!isConsulting()" name="search" class="w-3.5 h-3.5"></lucide-icon>
                    <lucide-icon *ngIf="isConsulting()" name="loader-2" class="w-3.5 h-3.5 animate-spin"></lucide-icon>
                  </button>
                </div>
                <p *ngIf="errors().dni" class="text-[10px] text-rose-500 font-bold mt-1 ml-1">{{ errors().dni }}</p>
              </div>

              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Teléfono</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <lucide-icon name="phone" class="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors"></lucide-icon>
                  </div>
                  <input type="text" [(ngModel)]="newClient.phone" name="phone" required class="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none text-xs" [class.ring-4]="errors().phone" [class.ring-rose-500/10]="errors().phone" [class.border-rose-500]="errors().phone" maxlength="9">
                </div>
                <p *ngIf="errors().phone" class="text-[10px] text-rose-500 font-bold mt-1 ml-1">{{ errors().phone }}</p>
              </div>

              <div class="col-span-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Correo Electrónico</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <lucide-icon name="mail" class="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors"></lucide-icon>
                  </div>
                  <input type="email" [(ngModel)]="newClient.email" (blur)="onEmailChange()" name="email" required class="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none text-xs" [class.ring-4]="errors().email" [class.ring-rose-500/10]="errors().email" [class.border-rose-500]="errors().email">
                </div>
                <p *ngIf="errors().email" class="text-[10px] text-rose-500 font-bold mt-1 ml-1">{{ errors().email }}</p>
              </div>

              <div class="col-span-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Dirección de Domicilio</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <lucide-icon name="map-pin" class="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors"></lucide-icon>
                  </div>
                  <input type="text" [(ngModel)]="newClient.address" name="address" required class="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none text-xs">
                </div>
              </div>
            </div>
            
            <div class="flex gap-4 pt-4">
              <button 
                type="button"
                (click)="showCreateModal.set(false)"
                class="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                [disabled]="isSaving()"
                class="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
              >
                <lucide-icon *ngIf="isSaving()" name="loader-2" class="w-5 h-5 animate-spin"></lucide-icon>
                {{ isSaving() ? 'Guardando...' : (isEditing() ? 'Actualizar Cliente' : 'Registrar Cliente') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ClientListComponent implements OnInit {
  clientService = inject(ClientService);
  authService = inject(AuthService);
  
  searchTerm = signal('');
  showCreateModal = signal(false);
  isSaving = signal(false);
  isConsulting = signal(false);
  isRefreshing = signal(false);
  isEditing = signal(false);
  selectedClientId = signal<string | null>(null);

  filteredClients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.clientService.clients().filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.dni.toLowerCase().includes(term)
    );
  });
  
  errors = signal<any>({});
  
  newClient: any = {
    name: '',
    dni: '',
    phone: '',
    email: '',
    address: ''
  };

  currentPage = signal(1);
  pageSize = 10;

  paginatedClients = computed(() => {
    const clients = this.filteredClients();
    const start = (this.currentPage() - 1) * this.pageSize;
    return clients.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredClients().length / this.pageSize);
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
    this.clientService.loadClients().subscribe();
  }

  refreshData() {
    this.isRefreshing.set(true);
    this.clientService.loadClients().subscribe({
      next: () => this.isRefreshing.set(false),
      error: () => this.isRefreshing.set(false)
    });
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.selectedClientId.set(null);
    this.resetForm();
    this.showCreateModal.set(true);
  }

  consultDni() {
    if (this.newClient.dni.length !== 8) return;
    
    this.isConsulting.set(true);
    this.clientService.consultDni(this.newClient.dni).subscribe({
      next: (response) => {
        const data = response.data || response;
        if (data && (data.nombreCompleto || data.nombres)) {
          this.newClient.name = data.nombreCompleto || `${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`.trim().replaceAll(/\s+/g, ' ');
          if (data.direccion) this.newClient.address = data.direccion;
          this.errors.set({ ...this.errors(), dni: null });
        }
        this.isConsulting.set(false);
      },
      error: () => {
        this.isConsulting.set(false);
      }
    });
  }

  openEditModal(client: Client) {
    this.isEditing.set(true);
    this.selectedClientId.set(client.id);
    this.newClient = { ...client };
    this.errors.set({});
    this.showCreateModal.set(true);
  }

  validateForm() {
    const errs: any = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dniRegex = /^\d{8}$/;
    const phoneRegex = /^\d{9}$/;

    if (!this.newClient.name) errs.name = "El nombre es requerido";
    if (!dniRegex.test(this.newClient.dni)) errs.dni = "DNI debe tener 8 números";
    if (!phoneRegex.test(this.newClient.phone)) errs.phone = "Celular debe tener 9 números";
    if (!emailRegex.test(this.newClient.email)) errs.email = "Correo electrónico inválido";
    
    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  onDniChange() {
    const dni = this.newClient.dni;
    if (dni && dni.length === 8) {
      this.clientService.checkDni(dni).subscribe(isTaken => {
        if (isTaken && (!this.isEditing() || dni !== this.clientService.clients().find(c => c.id === this.selectedClientId())?.dni)) {
          this.errors.set({ ...this.errors(), dni: 'Este DNI ya está registrado' });
        } else if (this.errors().dni === 'Este DNI ya está registrado') {
          const { dni, ...rest } = this.errors();
          this.errors.set(rest);
        }
      });
    }
  }

  onEmailChange() {
    const email = this.newClient.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && emailRegex.test(email)) {
      this.clientService.checkEmail(email).subscribe(isTaken => {
        if (isTaken && (!this.isEditing() || email !== this.clientService.clients().find(c => c.id === this.selectedClientId())?.email)) {
          this.errors.set({ ...this.errors(), email: 'Este correo ya está registrado' });
        } else if (this.errors().email === 'Este correo ya está registrado') {
          const { email, ...rest } = this.errors();
          this.errors.set(rest);
        }
      });
    }
  }

  saveClient() {
    if (!this.validateForm()) return;

    this.isSaving.set(true);
    
    const obs = this.isEditing() && this.selectedClientId()
      ? this.clientService.updateClient(this.selectedClientId()!, this.newClient)
      : this.clientService.createClient(this.newClient);

    obs.subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.isSaving.set(false);
        this.resetForm();
        this.refreshData(); // Reload data after save/update
      },
      error: () => this.isSaving.set(false)
    });
  }

  deleteClient(id: string) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.clientService.deleteClient(id).subscribe();
    }
  }

  private resetForm() {
    this.newClient = { name: '', dni: '', phone: '', email: '', address: '' };
    this.errors.set({});
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
}
