import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { 
  LucideAngularModule, 
  ShieldCheck, 
  Plus, 
  Save, 
  Settings, 
  CheckCircle2, 
  XCircle,
  ChevronRight
} from 'lucide-angular';
import { environment } from '../../../../environments/environment';
import { Rol, Modulo, DetalleRolModulo } from '../../../core/models/rbac.model';

@Component({
  selector: 'app-rbac',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <lucide-icon name="shield-check" class="w-8 h-8 text-indigo-600"></lucide-icon>
            Roles y Permisos
          </h1>
          <p class="text-slate-500 font-medium mt-1">Gestiona los accesos por módulo para cada rol del sistema.</p>
        </div>
        <button 
          (click)="showNewRoleModal.set(true)"
          class="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100"
        >
          <lucide-icon name="plus" class="w-5 h-5"></lucide-icon>
          Nuevo Rol
        </button>
      </div>

      <!-- New Role Modal -->
      <div *ngIf="showNewRoleModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" (click)="showNewRoleModal.set(false)"></div>
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-in zoom-in-95 duration-200">
          <h3 class="text-2xl font-black text-slate-900 mb-2">Crear Nuevo Rol</h3>
          <p class="text-slate-500 mb-6">Ingresa un nombre descriptivo para el nuevo rol del sistema.</p>
          
          <div class="space-y-4">
            <div>
              <label class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Nombre del Rol</label>
              <input 
                #roleInput
                type="text" 
                placeholder="Ej. SUPERVISOR"
                class="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all uppercase"
              >
            </div>
            
            <div class="flex gap-3 pt-2">
              <button 
                (click)="showNewRoleModal.set(false)"
                class="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button 
                (click)="createNewRole(roleInput.value)"
                class="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Crear Rol
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Roles List -->
        <div class="lg:col-span-1 space-y-3">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Seleccionar Rol</p>
          <button 
            *ngFor="let rol of roles()"
            (click)="selectRol(rol)"
            [class.bg-indigo-50]="selectedRol()?.id === rol.id"
            [class.text-indigo-700]="selectedRol()?.id === rol.id"
            [class.border-indigo-200]="selectedRol()?.id === rol.id"
            [class.ring-2]="selectedRol()?.id === rol.id"
            [class.ring-indigo-100]="selectedRol()?.id === rol.id"
            class="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-300 transition-all group"
          >
            <span class="font-bold">{{ rol.nombre }}</span>
            <lucide-icon name="chevron-right" class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" [class.opacity-100]="selectedRol()?.id === rol.id"></lucide-icon>
          </button>
        </div>

        <!-- Permissions Matrix -->
        <div class="lg:col-span-3">
          <div *ngIf="selectedRol(); else emptyState" class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h2 class="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div class="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                Permisos: {{ selectedRol()?.nombre }}
              </h2>
              <button 
                (click)="savePermissions()"
                class="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-100"
              >
                <lucide-icon name="save" class="w-4 h-4"></lucide-icon>
                Guardar Cambios
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-white">
                    <th class="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Módulo</th>
                    <th class="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Ver</th>
                    <th class="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Crear</th>
                    <th class="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Editar</th>
                    <th class="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Borrar</th>
                    <th class="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Menú</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr *ngFor="let det of permisos()" class="hover:bg-slate-50/50 transition-colors">
                    <td class="p-6">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                          <lucide-icon name="settings" class="w-4 h-4"></lucide-icon>
                        </div>
                        <span class="font-bold text-slate-900">{{ det.modulo.label }}</span>
                      </div>
                    </td>
                    <td class="p-6 text-center">
                      <button 
                        [disabled]="selectedRol()?.nombre === 'SUPER_ADMIN'"
                        (click)="togglePerm(det, 'pView')" 
                        class="transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <lucide-icon [name]="det.pView ? 'check-circle-2' : 'x-circle'" [class.text-emerald-500]="det.pView" [class.text-slate-300]="!det.pView" class="w-6 h-6 mx-auto"></lucide-icon>
                      </button>
                    </td>
                    <td class="p-6 text-center">
                      <button 
                        [disabled]="selectedRol()?.nombre === 'SUPER_ADMIN'"
                        (click)="togglePerm(det, 'pCreate')" 
                        class="transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <lucide-icon [name]="det.pCreate ? 'check-circle-2' : 'x-circle'" [class.text-emerald-500]="det.pCreate" [class.text-slate-300]="!det.pCreate" class="w-6 h-6 mx-auto"></lucide-icon>
                      </button>
                    </td>
                    <td class="p-6 text-center">
                      <button 
                        [disabled]="selectedRol()?.nombre === 'SUPER_ADMIN'"
                        (click)="togglePerm(det, 'pUpdate')" 
                        class="transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <lucide-icon [name]="det.pUpdate ? 'check-circle-2' : 'x-circle'" [class.text-emerald-500]="det.pUpdate" [class.text-slate-300]="!det.pUpdate" class="w-6 h-6 mx-auto"></lucide-icon>
                      </button>
                    </td>
                    <td class="p-6 text-center">
                      <button 
                        [disabled]="selectedRol()?.nombre === 'SUPER_ADMIN'"
                        (click)="togglePerm(det, 'pDelete')" 
                        class="transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <lucide-icon [name]="det.pDelete ? 'check-circle-2' : 'x-circle'" [class.text-emerald-500]="det.pDelete" [class.text-slate-300]="!det.pDelete" class="w-6 h-6 mx-auto"></lucide-icon>
                      </button>
                    </td>
                    <td class="p-6 text-center">
                      <button 
                        [disabled]="selectedRol()?.nombre === 'SUPER_ADMIN'"
                        (click)="togglePerm(det, 'pMenu')" 
                        class="transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <lucide-icon [name]="det.pMenu ? 'check-circle-2' : 'x-circle'" [class.text-emerald-500]="det.pMenu" [class.text-slate-300]="!det.pMenu" class="w-6 h-6 mx-auto"></lucide-icon>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <ng-template #emptyState>
            <div class="h-full min-h-[400px] bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center">
              <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                <lucide-icon name="shield-check" class="w-10 h-10"></lucide-icon>
              </div>
              <h3 class="text-xl font-black text-slate-900 tracking-tight">Selecciona un rol</h3>
              <p class="text-slate-500 font-medium mt-2 max-w-xs">Elige un rol de la lista de la izquierda para configurar sus permisos de acceso.</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class RbacComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  roles = signal<Rol[]>([]);
  modulos = signal<Modulo[]>([]);
  permisos = signal<DetalleRolModulo[]>([]);
  selectedRol = signal<Rol | null>(null);
  showNewRoleModal = signal<boolean>(false);

  ngOnInit() {
    this.loadRoles();
    this.loadModulos();
  }

  loadRoles() {
    this.http.get<Rol[]>(`${this.apiUrl}/roles-management/roles`).subscribe(data => {
      this.roles.set(data);
    });
  }

  createNewRole(nombre: string) {
    if (!nombre || nombre.trim() === '') return;

    this.http.post<Rol>(`${this.apiUrl}/roles-management/roles`, { nombre: nombre.toUpperCase() }).subscribe({
      next: (rol) => {
        this.showNewRoleModal.set(false);
        this.loadRoles();
        this.selectRol(rol);
        alert('Rol creado exitosamente');
      },
      error: () => alert('Error al crear el rol')
    });
  }

  loadModulos() {
    this.http.get<Modulo[]>(`${this.apiUrl}/roles-management/modulos`).subscribe(data => {
      this.modulos.set(data);
    });
  }

  selectRol(rol: Rol) {
    this.selectedRol.set(rol);
    this.http.get<DetalleRolModulo[]>(`${this.apiUrl}/roles-management/permisos/${rol.id}`).subscribe(data => {
      const isFullAdmin = rol.nombre === 'SUPER_ADMIN' || rol.nombre === 'ADMIN';
      
      const mergedPerms = this.modulos().map(m => {
        const existing = data.find(d => d.modulo.id === m.id);
        if (existing) {
          // Si es SUPER_ADMIN, forzamos a true aunque en la BD diga otra cosa por seguridad
          if (rol.nombre === 'SUPER_ADMIN') {
            existing.pView = existing.pCreate = existing.pUpdate = existing.pDelete = existing.pMenu = true;
          }
          return existing;
        }
        
        return {
          rol: rol,
          modulo: m,
          pView: isFullAdmin,
          pCreate: isFullAdmin,
          pUpdate: isFullAdmin,
          pDelete: isFullAdmin,
          pMenu: isFullAdmin
        } as DetalleRolModulo;
      });
      this.permisos.set(mergedPerms);
    });
  }

  togglePerm(det: DetalleRolModulo, field: string) {
    const fieldName = field as keyof DetalleRolModulo;
    (det[fieldName] as any) = !det[fieldName];
    // Force signal update to refresh UI
    this.permisos.set([...this.permisos()]);
  }

  savePermissions() {
    this.http.put(`${this.apiUrl}/roles-management/permisos`, this.permisos()).subscribe({
      next: () => {
        alert('Permisos actualizados con éxito');
      },
      error: () => {
        alert('Error al guardar los cambios');
      }
    });
  }
}
