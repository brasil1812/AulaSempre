import { LogoMarkComponent } from '../../../core/logo-mark.component';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../../core/services/app-state.service';

@Component({
  selector: 'app-profile-choice',
  standalone: true,
  imports: [LogoMarkComponent],
  template: `
<div class="choice-page">
  <div class="choice-inner">
    <!-- Logo -->
    <div class="choice-logo">
      <app-logo-mark [size]="46" />
      <span class="logo-text">Aula<span>Sempre</span></span>
    </div>

    <h1 class="choice-title">Como deseja entrar?</h1>
    <p class="choice-desc">Escolha seu perfil para acessar a demonstração completa.</p>

    <div class="choice-cards">
      <button class="choice-card choice-card--inst" (click)="select('instituicao')">
        <div class="choice-card__body">
          <h2>Sou uma instituição</h2>
          <p>Escola ou faculdade — solicito substituições e gerencio professores.</p>
        </div>
      </button>

      <button class="choice-card choice-card--prof" (click)="select('professor')">
        <div class="choice-card__body">
          <h2>Sou professor</h2>
          <p>Recebo convites, aceito ou recuso, e acompanho minhas substituições.</p>
        </div>
      </button>
    </div>

    <div class="demo-badge">
      Demonstração — dados fictícios, sem cadastro
    </div>

    <button class="back-link" (click)="router.navigateByUrl('/')">Voltar para o início</button>
  </div>
</div>
  `,
  styles: [`
    .choice-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: var(--color-bg);
      padding: 24px; font-family: 'Public Sans', system-ui, sans-serif;
    }
    .choice-inner { width: 100%; max-width: 480px; text-align: center; }
    .choice-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 36px; }
    .logo-text { font-family: 'Source Serif 4', Georgia, serif; font-size: 22px; font-weight: 600; color: var(--color-primary); span { color: var(--color-warning); } }
    .choice-title { font-family: 'Source Serif 4', Georgia, serif; font-size: 28px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px; }
    .choice-desc { font-size: 15px; color: var(--color-text-secondary); margin-bottom: 32px; }
    .choice-cards { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
    .choice-card {
      display: flex; align-items: center; gap: 16px; padding: 20px 22px;
      border-radius: 6px; border: 1.5px solid var(--color-border);
      background: #fff; text-align: left; width: 100%;
      border-left-width: 5px;
      transition: border-color .2s, transform .2s;
      &:hover { transform: translateX(3px); }
      &:active { transform: translateX(1px); }
      &--inst { border-left-color: var(--color-primary); }
      &--prof { border-left-color: var(--color-success); }
      &--inst:hover { border-color: var(--color-primary); }
      &--prof:hover { border-color: var(--color-success); }
    }
    .choice-card__body {
      flex: 1;
      h2 { font-size: 15px; font-weight: 700; color: var(--color-primary); margin-bottom: 3px; }
      p { font-size: 13px; color: var(--color-text-secondary); line-height: 1.4; }
    }
    .demo-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--color-success-light); border: 1px solid var(--color-success-border);
      color: var(--color-success); font-size: 13px; padding: 7px 16px;
      border-radius: 4px; margin-bottom: 20px;
    }
    .back-link { font-size: 13px; color: var(--color-text-muted); &:hover { color: var(--color-text-secondary); } }
  `],
})
export class ProfileChoiceComponent implements OnInit {
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private appState: AppStateService,
  ) {}

  ngOnInit() {
    // Auto-select if ?perfil= param is set
    const perfil = this.route.snapshot.queryParamMap.get('perfil');
    if (perfil === 'professor' || perfil === 'instituicao') {
      this.select(perfil);
    }
  }

  select(role: 'professor' | 'instituicao') {
    this.appState.startDemo(role);
    this.router.navigateByUrl(role === 'professor' ? '/professor' : '/instituicao');
  }
}
