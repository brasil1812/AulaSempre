import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="landing">

  <!-- Nav -->
  <nav class="landing-nav">
    <div class="landing-nav__inner">
      <div class="logo">
        <div class="logo__icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" fill="white"/>
            <path d="M6 9L8.5 11.5L12.5 7" stroke="#1B2A4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="logo__text">Aula<span class="logo__accent">Sempre</span></span>
      </div>
      <div class="landing-nav__actions">
        <button class="btn btn--ghost" (click)="go('/entrar')">Entrar</button>
        <button class="btn btn--primary" (click)="go('/demo')">Experimentar demonstração</button>
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero">
    <div class="hero__grid-bg" aria-hidden="true"></div>
    <div class="hero__inner">
      <div class="hero__badge">
        <span class="hero__badge-dot"></span>
        Plataforma de substituição para escolas privadas
      </div>
      <h1 class="hero__title">
        Imprevistos acontecem.<br>
        <span class="hero__title-light">As aulas podem continuar.</span>
      </h1>
      <p class="hero__desc">
        O AulaSempre conecta escolas e faculdades privadas a professores qualificados
        e disponíveis para substituições temporárias — em minutos, não em horas.
      </p>
      <div class="hero__actions">
        <button class="btn hero__btn-inst" (click)="go('/demo?perfil=instituicao')">Sou uma instituição</button>
        <button class="btn hero__btn-prof" (click)="go('/demo?perfil=professor')">Sou professor</button>
      </div>
    </div>
  </section>

  <!-- Como funciona -->
  <section class="section section--gray">
    <div class="section__inner">
      <div class="section__header">
        <h2 class="section__title">Como funciona</h2>
        <p class="section__desc">Em três etapas simples, a escola resolve uma ausência inesperada e o professor encontra uma oportunidade.</p>
      </div>
      <div class="steps-grid">
        <div class="step-card" *ngFor="let s of steps">
          <div class="step-card__num">{{s.num}}</div>
          <div class="step-card__icon">{{s.icon}}</div>
          <h3 class="step-card__title">{{s.title}}</h3>
          <p class="step-card__desc">{{s.desc}}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Benefícios -->
  <section class="section">
    <div class="section__inner">
      <div class="section__header">
        <h2 class="section__title">Para quem é o AulaSempre</h2>
      </div>
      <div class="benefits-grid">
        <!-- Instituição -->
        <div class="benefit-card benefit-card--blue">
          <div class="benefit-card__header">
            <div class="benefit-card__icon">🏫</div>
            <div>
              <h3 class="benefit-card__title">Para instituições</h3>
              <p class="benefit-card__sub">Escolas e faculdades privadas</p>
            </div>
          </div>
          <ul class="benefit-list">
            <li *ngFor="let b of institutionBenefits" class="benefit-list__item">
              <span class="benefit-list__check benefit-list__check--blue">✓</span>
              <span>{{b}}</span>
            </li>
          </ul>
          <button class="btn btn--primary btn--block" (click)="go('/demo?perfil=instituicao')">Sou uma instituição →</button>
        </div>

        <!-- Professor -->
        <div class="benefit-card benefit-card--green">
          <div class="benefit-card__header">
            <div class="benefit-card__icon benefit-card__icon--green">👩‍🏫</div>
            <div>
              <h3 class="benefit-card__title">Para professores</h3>
              <p class="benefit-card__sub">Licenciados disponíveis para substituições</p>
            </div>
          </div>
          <ul class="benefit-list">
            <li *ngFor="let b of teacherBenefits" class="benefit-list__item">
              <span class="benefit-list__check benefit-list__check--green">✓</span>
              <span>{{b}}</span>
            </li>
          </ul>
          <button class="btn btn--success btn--block" (click)="go('/demo?perfil=professor')">Sou professor →</button>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <div class="cta-section__inner">
      <h2 class="cta-section__title">Explore a demonstração completa</h2>
      <p class="cta-section__desc">Sem cadastro. Navegue pelo protótipo completo com dados de exemplo e veja o fluxo de ponta a ponta.</p>
      <button class="btn cta-section__btn" (click)="go('/demo')">Experimentar demonstração</button>
      <p class="cta-section__note">Dados fictícios. Nenhuma informação real é coletada.</p>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer__inner">
      <div class="logo">
        <div class="logo__icon">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" fill="white"/>
          </svg>
        </div>
        <span class="footer__logo-text">Aula<span class="footer__logo-accent">Sempre</span></span>
      </div>
      <p class="footer__copy">Protótipo acadêmico — versão de demonstração. Não há serviço real em operação.</p>
      <div class="footer__links">
        <button (click)="go('/demo?perfil=instituicao')">Sou instituição</button>
        <button (click)="go('/demo?perfil=professor')">Sou professor</button>
      </div>
    </div>
  </footer>

</div>
  `,
  styles: [`
    .landing { min-height: 100vh; background: #fff; font-family: 'Public Sans', system-ui, sans-serif; }

    /* Nav */
    .landing-nav {
      position: sticky; top: 0; z-index: 40;
      background: rgba(255,255,255,.95); backdrop-filter: blur(12px);
      border-bottom: 1px solid #DDD8CC;
    }
    .landing-nav__inner {
      max-width: 1100px; margin: 0 auto; padding: 0 24px;
      height: 64px; display: flex; align-items: center; justify-content: space-between;
    }
    .landing-nav__actions { display: flex; align-items: center; gap: 10px; }

    /* Logo */
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo__icon {
      width: 36px; height: 36px; background: #1B2A4A;
      border-radius: 4px; display: flex; align-items: center; justify-content: center;
    }
    .logo__text { font-family: 'Source Serif 4', Georgia, serif; font-size: 19px; font-weight: 600; color: #1B2A4A; }
    .logo__accent { color: #B97E24; }

    /* Hero */
    .hero {
      background: #1B2A4A;
      position: relative; overflow: hidden;
    }
    .hero__grid-bg {
      position: absolute; inset: 0; opacity: .05;
      background-image: linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px);
      background-size: 48px 48px;
    }
    .hero__inner {
      max-width: 1100px; margin: 0 auto; padding: 96px 24px;
      position: relative; z-index: 1;
    }
    .hero__badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: transparent; color: #D7B687;
      font-size: 13px; font-weight: 500; padding: 7px 16px;
      border-radius: 4px; border: 1px solid rgba(217,182,135,.4);
      margin-bottom: 28px;
    }
    .hero__badge-dot {
      width: 6px; height: 6px; background: #B97E24;
      border-radius: 50%; animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%,100% { opacity: 1; } 50% { opacity: .5; }
    }
    .hero__title {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: clamp(36px, 5vw, 58px); font-weight: 600;
      color: #fff; line-height: 1.15; margin-bottom: 20px;
    }
    .hero__title-light { color: #AEB9CF; }
    .hero__desc {
      font-size: 18px; color: #C7CEDC; max-width: 600px;
      line-height: 1.6; margin-bottom: 36px;
    }
    .hero__actions { display: flex; gap: 14px; flex-wrap: wrap; }
    .hero__btn-inst {
      background: #fff; color: #1B2A4A; font-weight: 700;
      padding: 14px 28px; border-radius: 4px; font-size: 15px;
      &:hover { background: #EEF1F6; }
    }
    .hero__btn-prof {
      background: transparent; color: #fff; font-weight: 700;
      border: 1.5px solid rgba(255,255,255,.4); padding: 14px 28px;
      border-radius: 4px; font-size: 15px;
      &:hover { background: rgba(255,255,255,.1); }
    }

    /* Sections */
    .section { padding: 80px 0; }
    .section--gray { background: #F7F5F0; }
    .section__inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .section__header { text-align: center; margin-bottom: 48px; }
    .section__title { font-family: 'Source Serif 4', Georgia, serif; font-size: 32px; font-weight: 600; color: #1B2A4A; margin-bottom: 10px; }
    .section__desc { color: #4C5873; max-width: 480px; margin: 0 auto; font-size: 15px; }

    /* Steps */
    .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
    .step-card {
      background: #fff; border: 1px solid #DDD8CC;
      border-radius: 6px; padding: 32px;
      transition: border-color .2s;
      &:hover { border-color: #C3BCAB; }
    }
    .step-card__num {
      width: 36px; height: 36px; background: #1B2A4A; color: #fff;
      border-radius: 4px; display: flex; align-items: center; justify-content: center;
      font-family: 'Source Serif 4', Georgia, serif; font-weight: 600; font-size: 16px; margin-bottom: 16px;
    }
    .step-card__icon { font-size: 32px; margin-bottom: 12px; }
    .step-card__title { font-size: 17px; font-weight: 700; color: #1B2A4A; margin-bottom: 8px; }
    .step-card__desc { font-size: 14px; color: #4C5873; line-height: 1.6; }

    /* Benefits */
    .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    .benefit-card {
      border-radius: 6px; padding: 32px;
      &--blue { background: #EEF1F6; border: 1px solid #C7CEDC; }
      &--green { background: #EAF1EE; border: 1px solid #A9C4BB; }
    }
    .benefit-card__header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
    .benefit-card__icon {
      width: 48px; height: 48px; background: #1B2A4A;
      border-radius: 4px; display: flex; align-items: center; justify-content: center;
      font-size: 22px; flex-shrink: 0;
      &--green { background: #2F5D50; }
    }
    .benefit-card__title { font-size: 18px; font-weight: 700; color: #1B2A4A; }
    .benefit-card__sub { font-size: 13px; color: #4C5873; margin-top: 2px; }
    .benefit-list { list-style: none; margin-bottom: 24px; display: flex; flex-direction: column; gap: 10px; }
    .benefit-list__item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: #33405E; }
    .benefit-list__check { font-weight: 700; margin-top: 1px;
      &--blue { color: #1B2A4A; }
      &--green { color: #2F5D50; }
    }

    /* CTA */
    .cta-section { background: #2F5D50; padding: 80px 0; }
    .cta-section__inner { max-width: 680px; margin: 0 auto; padding: 0 24px; text-align: center; }
    .cta-section__title { font-family: 'Source Serif 4', Georgia, serif; font-size: 32px; font-weight: 600; color: #fff; margin-bottom: 14px; }
    .cta-section__desc { font-size: 17px; color: #CFE0D9; margin-bottom: 32px; line-height: 1.6; }
    .cta-section__btn {
      background: #fff; color: #2F5D50; font-weight: 700;
      font-size: 16px; padding: 16px 36px; border-radius: 4px;
      &:hover { background: #EAF1EE; }
    }
    .cta-section__note { font-size: 12px; color: #A9C4BB; margin-top: 14px; }

    /* Footer */
    .footer { background: #1B2A4A; padding: 40px 0; }
    .footer__inner {
      max-width: 1100px; margin: 0 auto; padding: 0 24px;
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;
    }
    .footer__logo-text { font-family: 'Source Serif 4', Georgia, serif; font-size: 16px; font-weight: 600; color: #fff; }
    .footer__logo-accent { color: #D7B687; }
    .footer__copy { font-size: 13px; color: #8E9AB8; }
    .footer__links {
      display: flex; gap: 24px;
      button { font-size: 13px; color: #8E9AB8; &:hover { color: #fff; } transition: color .15s; }
    }
  `],
})
export class LandingPageComponent {
  constructor(private router: Router) {}

  go(path: string) { this.router.navigateByUrl(path); }

  steps = [
    { num: '1', icon: '📋', title: 'Solicite a substituição', desc: 'Informe disciplina, data, horário e nível de ensino. O sistema notifica professores disponíveis na sua região.' },
    { num: '2', icon: '🔍', title: 'Encontre o professor ideal', desc: 'Veja perfis verificados, avaliações de outras escolas, experiência e compatibilidade com a sua necessidade.' },
    { num: '3', icon: '✅', title: 'Confirme e acompanhe', desc: 'Envie o convite, receba a confirmação e acompanhe tudo pelo painel. Professor e escola recebem todos os detalhes.' },
  ];

  institutionBenefits = [
    'Professores disponíveis na sua cidade',
    'Perfis verificados com avaliações reais',
    'Fluxo rápido — solicitação em menos de 3 minutos',
    'Histórico e avaliações de todas as substituições',
    'Sem cancelamento de aulas por falta de professor',
  ];

  teacherBenefits = [
    'Receba convites para substituições próximas a você',
    'Escolha aceitar ou recusar cada convite',
    'Acumule avaliações e fortaleça seu perfil',
    'Flexibilidade de horário e modalidade',
    'Renda extra sem compromisso fixo',
  ];
}
