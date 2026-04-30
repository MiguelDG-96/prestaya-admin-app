import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Plus, 
  Search, 
  Loader2,
  Trash2,
  Lock
} from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Rol } from '../../../core/models/rbac.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-10">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-[#7B61FF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#7B61FF]/10 shrink-0">
            <lucide-icon name="user" class="w-6 h-6"></lucide-icon>
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Usuarios del Sistema</h1>
            <p class="text-xs text-slate-500 font-medium">Gestiona el personal y sus roles.</p>
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
              placeholder="Buscar por nombre o correo..." 
              class="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-[#7B61FF]/10 focus:border-[#7B61FF] focus:bg-white transition-all outline-none text-[11px] shadow-sm"
            >
          </div>
          <button 
            *ngIf="authService.hasAuthority('USERS_CREATE')"
            (click)="showCreateModal.set(true)"
            class="bg-[#7B61FF] text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-[#6349E6] hover:shadow-lg transition-all text-xs"
          >
            <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
            Nuevo Usuario
          </button>
        </div>
      </div>

      <!-- Users Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="paginatedUsers().length > 0">
        <div *ngFor="let user of paginatedUsers()" class="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-[#7B61FF]/5 transition-all group relative overflow-hidden">
          <div class="absolute top-0 right-0 p-4">
            <span class="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-[#7B61FF]/5 text-[#7B61FF] border border-[#7B61FF]/10">
              {{ user.rol?.nombre || 'USER' }}
            </span>
          </div>

          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm overflow-hidden group-hover:border-[#7B61FF]/20 transition-all">
              <img *ngIf="user.photoUrl" [src]="getFullPhotoUrl(user.photoUrl)" class="w-full h-full object-cover">
              <lucide-icon *ngIf="!user.photoUrl" name="user" class="w-8 h-8"></lucide-icon>
            </div>
            <div>
              <h3 class="font-black text-slate-900 leading-tight tracking-tight">{{ user.name }}</h3>
              <p class="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wide">{{ user.cargo || 'Personal' }}</p>
            </div>
          </div>

          <div class="space-y-3 pt-4 border-t border-slate-50">
            <div class="flex items-center gap-3 text-[11px] text-slate-600 font-bold">
              <div class="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-[#7B61FF]/10 group-hover:text-[#7B61FF] transition-colors">
                <lucide-icon name="mail" class="w-4 h-4"></lucide-icon>
              </div>
              {{ user.email }}
            </div>
            <div class="flex items-center gap-3 text-[11px] text-slate-600 font-bold">
              <div class="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-[#7B61FF]/10 group-hover:text-[#7B61FF] transition-colors">
                <lucide-icon name="phone" class="w-4 h-4"></lucide-icon>
              </div>
              {{ user.phone || 'No registrado' }}
            </div>
          </div>

          <div class="mt-6 flex gap-2">
            <button class="flex-1 bg-slate-50 text-slate-600 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7B61FF]/10 hover:text-[#7B61FF] transition-all border border-slate-100">
              Perfil
            </button>
            <button class="w-12 h-12 bg-slate-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-50 transition-all border border-slate-100">
              <lucide-icon name="trash-2" class="w-5 h-5"></lucide-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div class="bg-white rounded-3xl border border-slate-100 p-6 flex items-center justify-between shadow-sm" *ngIf="totalPages() > 1">
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

      <!-- Empty State -->
      <div *ngIf="paginatedUsers().length === 0" class="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-[2rem] border border-slate-100">
        <div class="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
          <lucide-icon name="user" class="w-10 h-10"></lucide-icon>
        </div>
        <h3 class="text-xl font-black text-slate-900 tracking-tight">No hay usuarios</h3>
        <p class="text-xs text-slate-500 font-medium mt-2 max-w-xs mx-auto">No se encontraron registros que coincidan con tu búsqueda.</p>
      </div>

      <!-- Create Modal -->
      <div *ngIf="showCreateModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="showCreateModal.set(false)"></div>
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-in zoom-in-95 duration-200">
          <h3 class="text-2xl font-black text-slate-900 mb-2">Nuevo Usuario</h3>
          <p class="text-slate-500 mb-8">Crea una nueva cuenta de acceso para el sistema.</p>
          
          <form (submit)="saveUser()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nombre Completo</label>
                <input type="text" [(ngModel)]="newUser.name" name="name" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/20 focus:bg-white transition-all text-sm">
              </div>
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">DNI / Documento</label>
                <input type="text" [(ngModel)]="newUser.dni" name="dni" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/20 focus:bg-white transition-all text-sm">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Correo Electrónico</label>
                <input type="email" [(ngModel)]="newUser.email" name="email" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/20 focus:bg-white transition-all text-sm">
              </div>
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Teléfono</label>
                <input type="text" [(ngModel)]="newUser.phone" name="phone" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/20 focus:bg-white transition-all text-sm">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Rol de Acceso</label>
                <select [(ngModel)]="newUser.rolId" name="rolId" required class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/20 focus:bg-white transition-all appearance-none text-sm">
                  <option value="0">Selecciona un rol</option>
                  <option *ngFor="let rol of roles()" [value]="rol.id">{{ rol.nombre }}</option>
                </select>
              </div>
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Cargo / Puesto</label>
                <input type="text" [(ngModel)]="newUser.cargo" name="cargo" placeholder="Ej. Analista" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/20 focus:bg-white transition-all text-sm">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Salario Mensual</label>
                <input type="number" [(ngModel)]="newUser.salario" name="salario" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/20 focus:bg-white transition-all text-sm">
              </div>
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tipo de Contrato</label>
                <select [(ngModel)]="newUser.tipoContrato" name="tipoContrato" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/20 focus:bg-white transition-all appearance-none text-sm">
                  <option value="">Seleccionar...</option>
                  <option value="INDEFINIDO">Indefinido</option>
                  <option value="PLAZO_FIJO">Plazo Fijo</option>
                  <option value="RECIBO_HONORARIOS">Por Honorarios</option>
                </select>
              </div>
            </div>

            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Contraseña</label>
              <div class="relative">
                <lucide-icon name="lock" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></lucide-icon>
                <input type="password" [(ngModel)]="newUser.password" name="password" required class="w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7B61FF]/20 focus:bg-white transition-all text-sm">
              </div>
            </div>

            <div class="flex gap-4 pt-4">
              <button type="button" (click)="showCreateModal.set(false)" class="flex-1 px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm">Cancelar</button>
              <button type="submit" [disabled]="isSaving()" class="flex-1 bg-[#7B61FF] text-white px-6 py-3.5 rounded-xl font-bold hover:bg-[#6349E6] transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#7B61FF]/10">
                <lucide-icon *ngIf="isSaving()" name="loader-2" class="w-5 h-5 animate-spin"></lucide-icon>
                {{ isSaving() ? 'Procesando...' : 'Crear Usuario' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  authService = inject(AuthService);
  http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  users = signal<any[]>([]);
  roles = signal<Rol[]>([]);
  showCreateModal = signal(false);
  isSaving = signal(false);

  newUser = {
    name: '',
    email: '',
    password: '',
    phone: '',
    rolId: 0,
    dni: '',
    cargo: '',
    salario: 0,
    fechaContratacion: new Date().toISOString().split('T')[0],
    tipoContrato: ''
  };

  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = 9; // Grid layout looks better with multiples of 3

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.users().filter(u => 
      u.name.toLowerCase().includes(term) || 
      u.email.toLowerCase().includes(term)
    );
  });

  paginatedUsers = computed(() => {
    const users = this.filteredUsers();
    const start = (this.currentPage() - 1) * this.pageSize;
    return users.slice(start, start + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredUsers().length / this.pageSize);
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
    this.loadUsers();
    this.loadRoles();
  }

  getFullPhotoUrl(photoUrl: string | undefined): string {
    return this.authService.getFullPhotoUrl(photoUrl);
  }

  loadUsers() {
    this.http.get<any[]>(`${this.apiUrl}/users`).subscribe(data => this.users.set(data));
  }

  loadRoles() {
    this.http.get<Rol[]>(`${this.apiUrl}/roles-management/roles`).subscribe(data => this.roles.set(data));
  }

  saveUser() {
    this.isSaving.set(true);
    this.http.post(`${this.apiUrl}/users`, this.newUser).subscribe({
      next: () => {
        this.showCreateModal.set(false);
        this.isSaving.set(false);
        this.loadUsers();
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
