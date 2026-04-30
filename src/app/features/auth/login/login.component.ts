import { Component, inject, signal, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Lock, Mail, Eye, EyeOff, CircleDollarSign, ArrowRight, Loader2, AlertCircle, Check } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#06050C] to-[#0E0C1F] flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans">
      <!-- Premium Animated Background (Liquid Style) -->
      <div class="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#7B61FF] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.15] animate-blob"></div>
      <div class="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#6349E6] rounded-full mix-blend-screen filter blur-[130px] opacity-[0.1] animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-[#7B61FF] rounded-full mix-blend-screen filter blur-[140px] opacity-[0.12] animate-blob animation-delay-4000"></div>

      <!-- Noise Texture -->
      <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none"></div>
      
      <div class="w-full max-w-[1100px] bg-white/[0.03] backdrop-blur-[40px] rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden group relative z-10 flex flex-col lg:flex-row items-stretch">
        <!-- Shine Effect -->
        <div class="absolute -inset-x-full top-0 h-[200%] w-[200%] bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1500ms] pointer-events-none"></div>

        <!-- Left Side: Login Form -->
        <div class="w-full lg:w-[460px] p-10 lg:p-14 shrink-0 relative z-20">
          <!-- Logo Section -->
          <div class="flex flex-col items-center mb-10 text-center">
            <div class="w-20 h-20 bg-white/5 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-6 shadow-2xl p-4 border border-white/10 transform hover:scale-110 transition-all duration-500">
              <img src="/img/logo/logo-prestaya-angular.png" alt="Logo PrestaYa" class="w-full h-full object-contain filter brightness-110">
            </div>
            <h2 class="text-3xl font-black text-white tracking-tight">Bienvenido</h2>
            <p class="text-[9px] text-white/40 font-black uppercase tracking-[0.4em] mt-2">PRESTAYA ADMIN</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="space-y-2">
              <label class="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">CORREO ELECTRÓNICO</label>
              <div class="relative group/input">
                <div class="absolute inset-y-0 left-0 pl-5 flex items-center text-white/20 group-focus-within/input:text-[#7B61FF] transition-colors">
                  <lucide-icon name="mail" class="w-4.5 h-4.5"></lucide-icon>
                </div>
                <input type="email" formControlName="email" placeholder="ejemplo@prestaya.com" class="block w-full pl-12 pr-5 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white font-bold focus:ring-4 focus:ring-[#7B61FF]/10 focus:border-[#7B61FF]/50 focus:bg-white/[0.05] transition-all outline-none text-xs placeholder:text-white/10 shadow-inner">
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">CONTRASEÑA DE ACCESO</label>
              <div class="relative group/input">
                <div class="absolute inset-y-0 left-0 pl-5 flex items-center text-white/20 group-focus-within/input:text-[#7B61FF] transition-colors">
                  <lucide-icon name="lock" class="w-4.5 h-4.5"></lucide-icon>
                </div>
                <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" class="block w-full pl-12 pr-12 py-4 bg-white/[0.03] border border-white/5 rounded-2xl text-white font-bold focus:ring-4 focus:ring-[#7B61FF]/10 focus:border-[#7B61FF]/50 focus:bg-white/[0.05] transition-all outline-none text-xs placeholder:text-white/10 shadow-inner">
                <button type="button" (click)="togglePassword()" class="absolute inset-y-0 right-0 pr-5 flex items-center text-white/20 hover:text-[#7B61FF] transition-colors">
                  <lucide-icon [name]="showPassword() ? 'eye-off' : 'eye'" class="w-4.5 h-4.5"></lucide-icon>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between px-2">
              <label class="flex items-center gap-3 cursor-pointer group/check">
                <div class="relative flex items-center">
                  <input type="checkbox" formControlName="rememberMe" class="peer h-5 w-5 appearance-none rounded-lg border-2 border-white/10 bg-white/5 transition-all checked:bg-[#7B61FF] checked:border-[#7B61FF] focus:outline-none">
                  <lucide-icon name="check" class="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"></lucide-icon>
                </div>
                <span class="text-[9px] font-black text-white/30 group-hover/check:text-white/60 uppercase tracking-widest transition-colors">Recordar sesión</span>
              </label>
              <a href="#" class="text-[9px] font-black text-[#7B61FF] hover:text-[#6349E6] uppercase tracking-widest transition-colors">Recuperar clave</a>
            </div>

            <button type="submit" [disabled]="loginForm.invalid || isLoading()" class="w-full relative group/btn overflow-hidden rounded-2xl transition-all active:scale-95">
              <div class="absolute inset-0 bg-gradient-to-r from-[#7B61FF] to-[#6349E6] transition-all duration-500 group-hover/btn:scale-105"></div>
              <div class="relative py-4 px-6 font-black text-[10px] text-white uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_20px_40px_-12px_rgba(123,97,255,0.4)]">
                <span *ngIf="!isLoading()">Entrar al Portal</span>
                <lucide-icon *ngIf="!isLoading()" name="arrow-right" class="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"></lucide-icon>
                <lucide-icon *ngIf="isLoading()" name="loader-2" class="w-5 h-5 animate-spin"></lucide-icon>
              </div>
            </button>
          </form>
        </div>

        <!-- Right Side: Banner Image (Joined in same div) -->
        <div class="hidden lg:flex flex-1 items-center justify-center bg-white/[0.02] border-l border-white/5 relative overflow-hidden">
          <!-- Internal Glow for Banner side -->
          <div class="absolute inset-0 bg-gradient-to-br from-[#7B61FF]/10 to-transparent pointer-events-none"></div>
          
          <img 
            src="/img/login-banner/banner.png" 
            alt="PrestaYa Banner" 
            class="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000"
          >
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(60px, -80px) scale(1.2); }
      66% { transform: translate(-50px, 50px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob {
      animation: blob 12s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    .animation-delay-4000 {
      animation-delay: 4s;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      75% { transform: translateX(6px); }
    }
    .animate-shake {
      animation: shake 0.4s ease-in-out;
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  showPassword = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  ngOnInit() {
    const savedEmail = localStorage.getItem('remember_email');
    const savedPassword = localStorage.getItem('remember_password');
    if (savedEmail) {
      this.loginForm.patchValue({
        email: savedEmail,
        password: savedPassword || '',
        rememberMe: true
      });
    }
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        if (rememberMe) {
          localStorage.setItem('remember_email', email!);
          localStorage.setItem('remember_password', password!);
        } else {
          localStorage.removeItem('remember_email');
          localStorage.removeItem('remember_password');
        }

        this.ngZone.run(() => {
          this.router.navigate(['/dashboard']);
        });
      },
      error: (err) => {
        this.error.set('Credenciales inválidas o error de conexión');
        this.isLoading.set(false);
      }
    });
  }
}
