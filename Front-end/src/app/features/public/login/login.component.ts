import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppStateService } from '../../../core/services/app-state.service';
import { errorMessage } from '../../../core/services/api.service';

type View = 'login' | 'register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
<div class="login-page">

  <!-- Left panel -->
  <div class="login-left">
    <img
      src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&h=1200&fit=crop&auto=format&q=80"
      alt="Sala de aula"
      class="login-left__photo"
    />
    <div class="login-left__overlay"></div>
    <div class="login-left__top">
      <div class="logo">
        <div class="logo__icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" fill="white"/>
            <path d="M6 9L8.5 11.5L12.5 7" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="logo__text logo__text--white">Aula<span class="logo__accent--light">Sempre</span></span>
      </div>
    </div>
    <div class="login-left__bottom">
      <p class="login-left__quote">Bom ter você<br>por aqui.</p>
      <p class="login-left__sub">Entre para acompanhar suas oportunidades ou organizar as substituições da sua escola.</p>
    </div>
  </div>

  <!-- Right panel -->
  <div class="login-right">

    <!-- Mobile logo -->
    <div class="login-mobile-logo">
      <div class="logo">
        <div class="logo__icon"><svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" fill="white"/></svg></div>
        <span class="logo__text">Aula<span class="logo__accent">Sempre</span></span>
      </div>
    </div>

    <div class="login-form-wrap">

      <!-- ─── Login View ─────────────────────────────────────── -->
      @if (view() === 'login') {
        <h1 class="login-title">Entre na sua conta</h1>
        <p class="login-sub">Escola ou professor — use o mesmo formulário.</p>

        <form [formGroup]="loginForm" (ngSubmit)="handleLogin()" novalidate class="login-form">
          <!-- Email -->
          <div class="field">
            <label class="form-label" for="email">E-mail</label>
            <input id="email" type="email" formControlName="email"
              placeholder="voce@exemplo.com"
              [class.is-error]="showError('email')"
              class="form-input" />
            @if (showError('email')) {
              <p class="form-error">{{ emailError }}</p>
            }
          </div>

          <!-- Password -->
          <div class="field">
            <div class="field__row">
              <label class="form-label" for="password">Senha</label>
            </div>
            <div class="input-wrap">
              <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password"
                placeholder="••••••••"
                [class.is-error]="showError('password')"
                class="form-input" />
              <button type="button" class="eye-btn" (click)="showPassword.set(!showPassword())"
                [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'">
                @if (showPassword()) {
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="10" cy="10" r="3"/></svg>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l14 14M10 4c5.5 0 9 6 9 6s-.9 1.65-2.42 3.13M6.62 6.6C4.48 7.98 3 10 3 10s3.5 6 9 6a9.2 9.2 0 0 0 3.38-.63"/></svg>
                }
              </button>
              @if (errorMessage()) {
                <p class="form-error">{{errorMessage()}}</p>
              }
            </div>
            @if (showError('password')) {
              <p class="form-error">{{ passwordError }}</p>
            }
          </div>

          <!-- Remember -->
          <label class="remember-label">
            <input type="checkbox" formControlName="remember" class="sr-only" />
            <div class="custom-checkbox" [class.checked]="loginForm.get('remember')?.value">
              @if (loginForm.get('remember')?.value) {
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 5-5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              }
            </div>
            <span>Manter conectado</span>
          </label>

          <button type="submit" class="btn btn--primary btn--block btn--lg" [disabled]="loading()">
            @if (loading()) { <span class="spinner"></span> Entrando… }
            @else { Entrar }
          </button>
        </form>

        <div class="demo-notice">
          <strong>Acesso:</strong> use uma conta cadastrada para acessar os dados reais da plataforma.
        </div>

        <p class="login-switch">
          Ainda não tem uma conta?
          <button type="button" (click)="view.set('register')">Cadastre-se</button>
        </p>
      }

      <!-- ─── Register View ───────────────────────────────────── -->
      @if (view() === 'register') {
        <button type="button" class="back-btn" (click)="view.set('login')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M9.707 4.293a1 1 0 010 1.414L7.414 8l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          Voltar ao login
        </button>
        <h1 class="login-title">Crie sua conta</h1>
        <p class="login-sub">Preencha seus dados para criar uma conta real.</p>

        <form [formGroup]="registerForm" (ngSubmit)="handleRegister()" class="login-form">
          <div class="field"><label class="form-label">Nome</label><input class="form-input" formControlName="name" placeholder="Seu nome ou nome da escola" /></div>
          <div class="field"><label class="form-label">E-mail</label><input class="form-input" type="email" formControlName="email" placeholder="voce@exemplo.com" /></div>
          <div class="field"><label class="form-label">Senha</label><input class="form-input" type="password" formControlName="password" placeholder="Mínimo de 6 caracteres" /></div>
          <div class="field"><label class="form-label">Cidade</label><input class="form-input" formControlName="city" placeholder="São Paulo" /></div>
          <div class="field"><label class="form-label">Estado</label><input class="form-input" formControlName="state" maxlength="2" placeholder="SP" /></div>
          <div class="field"><label class="form-label">Telefone</label><input class="form-input" formControlName="phone" placeholder="(11) 99999-9999" /></div>
          <div class="profile-cards">
            <button type="button" class="profile-card" (click)="selectRegisterRole('PROFESSOR')">👩‍🏫 Sou professor</button>
            <button type="button" class="profile-card" (click)="selectRegisterRole('ESCOLA')">🏫 Sou uma escola</button>
          </div>
          @if (registerError()) { <p class="form-error">{{registerError()}}</p> }
          <button type="submit" class="btn btn--primary btn--block btn--lg" [disabled]="registerLoading()">{{registerLoading() ? 'Cadastrando…' : 'Criar conta'}}</button>
        </form>
        <div class="demo-notice">
          Seu cadastro será salvo e você poderá completar seu perfil após entrar.
        </div>
      }

      <div class="back-home">
        <button (click)="go('/')">← Voltar para o início</button>
      </div>

    </div>
  </div>
</div>
  `,
  styles: [`
    .login-page { display: flex; min-height: 100vh; }

    /* Left */
    .login-left {
      display: none;
      position: relative; flex-direction: column; justify-content: space-between;
      padding: 40px; width: 44%; flex-shrink: 0; overflow: hidden;
      background: #1E293B;
    }
    @media(min-width: 768px) { .login-left { display: flex; } }
    .login-left__photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .4; }
    .login-left__overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(15,23,42,.6), rgba(15,23,42,.3), rgba(15,23,42,.7)); }
    .login-left__top, .login-left__bottom { position: relative; z-index: 1; }
    .login-left__quote { font-size: clamp(22px, 2.5vw, 30px); font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 10px; }
    .login-left__sub { font-size: 14px; color: #CBD5E1; line-height: 1.6; max-width: 300px; }

    /* Right */
    .login-right { flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
    .login-mobile-logo { padding: 28px 24px 0; display: block; }
    @media(min-width: 768px) { .login-mobile-logo { display: none; } }
    .login-form-wrap {
      flex: 1; display: flex; flex-direction: column; justify-content: center;
      padding: 40px 24px; max-width: 400px; width: 100%; margin: 0 auto;
    }

    /* Logo */
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo__icon { width: 34px; height: 34px; background: #2563EB; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
    .logo__text { font-size: 17px; font-weight: 700; color: #0F172A; }
    .logo__text--white { color: #fff; }
    .logo__accent { color: #2563EB; }
    .logo__accent--light { color: #93C5FD; }

    /* Form */
    .login-title { font-size: 24px; font-weight: 700; color: #0F172A; margin-bottom: 6px; }
    .login-sub { font-size: 14px; color: #64748B; margin-bottom: 28px; }
    .login-form { display: flex; flex-direction: column; gap: 18px; }
    .field { display: flex; flex-direction: column; }
    .field__row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .forgot-link { font-size: 12px; color: #2563EB; &:hover { text-decoration: underline; } }
    .input-wrap { position: relative; }
    .eye-btn {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      color: #94A3B8; padding: 4px;
      &:hover { color: #475569; }
    }

    .remember-label {
      display: flex; align-items: center; gap: 10px; cursor: pointer;
      font-size: 14px; color: #475569;
    }
    .custom-checkbox {
      width: 16px; height: 16px; border-radius: 4px;
      border: 2px solid #CBD5E1; background: #fff; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: all .15s;
      &.checked { border-color: #2563EB; background: #2563EB; }
    }

    .demo-notice {
      margin-top: 16px; background: #FFFBEB; border: 1px solid #FDE68A;
      border-radius: 10px; padding: 12px 14px; font-size: 12px; color: #92400E; line-height: 1.5;
    }
    .login-switch { margin-top: 20px; text-align: center; font-size: 14px; color: #64748B;
      button { color: #2563EB; font-weight: 600; &:hover { text-decoration: underline; } }
    }

    /* Register */
    .back-btn {
      display: flex; align-items: center; gap: 6px; font-size: 13px;
      color: #64748B; margin-bottom: 20px; &:hover { color: #334155; }
    }
    .profile-cards { display: flex; flex-direction: column; gap: 12px; margin-bottom: 4px; }
    .profile-card {
      width: 100%; display: flex; align-items: center; gap: 14px;
      background: #fff; border: 2px solid #E2E8F0; border-radius: 16px;
      padding: 18px; text-align: left; transition: all .15s;
      &:hover { border-color: #60A5FA; }
    }
    .profile-card__icon {
      width: 48px; height: 48px; background: #EFF6FF; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;
    }
    .profile-card__name { font-size: 14px; font-weight: 600; color: #0F172A; margin-bottom: 2px; }
    .profile-card__desc { font-size: 12px; color: #64748B; line-height: 1.4; }
    .profile-card__arrow { margin-left: auto; color: #CBD5E1; flex-shrink: 0; }

    .back-home {
      margin-top: 28px; text-align: center;
      button { font-size: 12px; color: #94A3B8; &:hover { color: #475569; } }
    }
  `],
})
export class LoginComponent {
  view = signal<View>('login');
  showPassword = signal(false);
  loading = signal(false);
  submitted = signal(false);
  errorMessage = signal('');

  loginForm: FormGroup;
  registerForm: FormGroup;
  registerLoading = signal(false);
  registerError = signal('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private appState: AppStateService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false],
    });
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['PROFESSOR', Validators.required],
      city: ['', Validators.required],
      state: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      phone: [''],
    });
  }

  go(path: string) { this.router.navigateByUrl(path); }

  get emailError(): string {
    const c = this.loginForm.get('email');
    if (c?.errors?.['required']) return 'Informe seu e-mail';
    if (c?.errors?.['email']) return 'Confira o formato do e-mail';
    return '';
  }

  get passwordError(): string {
    const c = this.loginForm.get('password');
    if (c?.errors?.['required']) return 'Informe sua senha';
    if (c?.errors?.['minlength']) return 'A senha precisa ter pelo menos 6 caracteres';
    return '';
  }

  showError(field: string): boolean {
    const c = this.loginForm.get(field);
    return !!(c?.invalid && (c?.dirty || this.submitted()));
  }

  async handleLogin() {
    this.submitted.set(true);
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const role = await this.appState.login(
        this.loginForm.value.email,
        this.loginForm.value.password,
        this.loginForm.value.remember,
      );
      this.router.navigateByUrl(role === 'professor' ? '/professor' : '/instituicao');
    } catch (error) {
      console.error('Falha no login.', error);
      this.errorMessage.set(errorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  register(role: 'professor' | 'instituicao') {
    this.selectRegisterRole(role === 'professor' ? 'PROFESSOR' : 'ESCOLA');
  }

  selectRegisterRole(role: 'PROFESSOR' | 'ESCOLA') {
    this.registerForm.patchValue({ role });
  }

  async handleRegister() {
    this.registerError.set('');
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.registerLoading.set(true);
    const value = this.registerForm.getRawValue();
    try {
      await this.appState.register({
        nome: value.name, email: value.email, senha: value.password,
        tipo_usuario: value.role, cidade: value.city,
        estado: value.state.toUpperCase(), telefone: value.phone || undefined,
      });
      const role = await this.appState.login(value.email, value.password);
      await this.router.navigateByUrl(role === 'professor' ? '/professor' : '/instituicao');
    } catch (error) {
      console.error('Falha no cadastro.', error);
      this.registerError.set(errorMessage(error));
    } finally {
      this.registerLoading.set(false);
    }
  }
}
