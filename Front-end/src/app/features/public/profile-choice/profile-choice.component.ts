import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppStateService } from '../../../core/services/app-state.service';

@Component({
  selector: 'app-profile-choice',
  standalone: true,
  template: `
<div class="choice-page">
  <div class="choice-inner">
    <!-- Logo -->
    <div class="choice-logo">
      <div class="logo-icon">
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
          <path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" fill="white"/>
          <path d="M6 9L8.5 11.5L12.5 7" stroke="#1B2A4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="logo-text">Aula<span>Sempre</span></span>
    </div>

    <h1 class="choice-title">Como deseja entrar?</h1>
    <p class="choice-desc">Escolha seu perfil para acessar a demonstração completa.</p>

    <div class="choice-cards">
      <button class="choice-card choice-card--inst" (click)="select('instituicao')">
        <div class="choice-card__icon">🏫</div>
        <div class="choice-card__body">
          <h2>Sou uma instituição</h2>
          <p>Escola ou faculdade — solicito substituições e gerencio professores.</p>
        </div>
        <div class="choice-card__arrow">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        </div>
      </button>

      <button class="choice-card choice-card--prof" (click)="select('professor')">
        <div class="choice-card__icon">👩‍🏫</div>
        <div class="choice-card__body">
          <h2>Sou professor</h2>
          <p>Recebo convites, aceito ou recuso, e acompanho minhas substituições.</p>
        </div>
        <div class="choice-card__arrow">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
        </div>
      </button>
    </div>

    <div class="demo-badge">
      <span>🔬</span>
      Demonstração — dados fictícios, sem cadastro
    </div>

    <button class="back-link" (click)="router.navigateByUrl('/')">← Voltar para o início</button>
  </div>
</div>
  `,
  styles: [`
    .choice-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #F7F5F0;
      padding: 24px; font-family: 'Public Sans', system-ui, sans-serif;
    }
    .choice-inner { width: 100%; max-width: 480px; text-align: center; }
    .choice-logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 36px; }
    .logo-icon {
      width: 46px; height: 46px; background: #1B2A4A; border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
    }
    .logo-text { font-family: 'Source Serif 4', Georgia, serif; font-size: 22px; font-weight: 600; color: #1B2A4A; span { color: #B97E24; } }
    .choice-title { font-family: 'Source Serif 4', Georgia, serif; font-size: 28px; font-weight: 600; color: #1B2A4A; margin-bottom: 8px; }
    .choice-desc { font-size: 15px; color: #4C5873; margin-bottom: 32px; }
    .choice-cards { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
    .choice-card {
      display: flex; align-items: center; gap: 16px; padding: 20px 22px;
      border-radius: 6px; border: 1.5px solid #DDD8CC;
      background: #fff; text-align: left; width: 100%;
      transition: border-color .2s;
      &--inst:hover { border-color: #1B2A4A; }
      &--prof:hover { border-color: #2F5D50; }
    }
    .choice-card__icon {
      font-size: 32px; width: 56px; height: 56px; flex-shrink: 0;
      border-radius: 4px; display: flex; align-items: center; justify-content: center;
      background: #EEF1F6;
    }
    .choice-card--prof .choice-card__icon { background: #EAF1EE; }
    .choice-card__body {
      flex: 1;
      h2 { font-size: 15px; font-weight: 700; color: #1B2A4A; margin-bottom: 3px; }
      p { font-size: 13px; color: #4C5873; line-height: 1.4; }
    }
    .choice-card__arrow { color: #C7CEDC; }
    .demo-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: #EAF1EE; border: 1px solid #A9C4BB;
      color: #2F5D50; font-size: 13px; padding: 7px 16px;
      border-radius: 4px; margin-bottom: 20px;
    }
    .back-link { font-size: 13px; color: #8A93A8; &:hover { color: #4C5873; } }
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
