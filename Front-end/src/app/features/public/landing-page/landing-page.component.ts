import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LogoMarkComponent } from '../../../core/logo-mark.component';
import { InViewDirective } from '../../../core/in-view.directive';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, LogoMarkComponent, InViewDirective],
  template: `
<div class="landing">

  <!-- Menu -->
  <nav class="landing-nav">
    <div class="landing-nav__inner">
      <div class="logo">
        <app-logo-mark [size]="34" />
        <span class="logo__text">Aula<span class="logo__accent">Sempre</span></span>
      </div>
      <div class="landing-nav__actions">
        <button class="text-link" (click)="go('/entrar')">Entrar</button>
        <button class="solid-btn solid-btn--sm" (click)="go('/demo')">Ver demonstração</button>
      </div>
    </div>
  </nav>

  <!-- Abertura: texto à esquerda, a substituição acontecendo à direita -->
  <section class="hero">
    <div class="hero__inner">
      <div class="hero__text">
        <h1 class="hero__title">Imprevistos acontecem. As aulas podem continuar.</h1>
        <p class="hero__desc">
          O AulaSempre conecta escolas e faculdades privadas a professores qualificados
          e disponíveis para substituições temporárias, em minutos e não em horas.
        </p>
        <div class="hero__actions">
          <button class="solid-btn" (click)="go('/demo?perfil=instituicao')">Sou uma instituição</button>
          <button class="text-link text-link--lg" (click)="go('/demo?perfil=professor')">Sou professor</button>
        </div>
      </div>

      <!-- Exemplo ao vivo: uma ausência virando uma substituição confirmada -->
      <div class="board" aria-hidden="true">
        <div class="board__meta"><span>Quinta-feira</span><span>3ª aula, 10h20</span></div>
        <p class="board__class">Matemática, 7º ano B</p>
        <ol class="board__steps">
          <li [class.on]="step() >= 0">
            <i class="board__dot"></i>
            <div><b>Ausência registrada</b><small>Prof. Carlos avisou às 7h40</small></div>
          </li>
          <li [class.on]="step() >= 1">
            <i class="board__dot"></i>
            <div><b>Convites enviados</b><small>3 professores disponíveis na região</small></div>
          </li>
          <li [class.on]="step() >= 2">
            <i class="board__dot"></i>
            <div><b>Professora aceitou</b><small>Marina Lopes, licenciada em Matemática</small></div>
          </li>
        </ol>
        <div class="board__stamp" [class.show]="step() >= 3">Confirmada</div>
      </div>
    </div>
  </section>

  <!-- Como funciona: é uma sequência, então os números fazem sentido -->
  <section class="section">
    <div class="section__inner how">
      <div class="how__head">
        <h2 class="section__title">Como funciona</h2>
        <p class="section__desc">Em três etapas, a escola resolve uma ausência inesperada e o professor encontra uma oportunidade.</p>
      </div>
      <ol class="how__list">
        <li class="how__item" appInView *ngFor="let s of steps">
          <span class="how__num">{{s.num}}</span>
          <div class="how__body">
            <h3 class="how__title">{{s.title}}</h3>
            <p class="how__desc">{{s.desc}}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>

  <!-- Para quem é -->
  <section class="section section--paper">
    <div class="section__inner">
      <h2 class="section__title section__title--left">Para quem é o AulaSempre</h2>
      <div class="who">
        <article class="who__col">
          <h3 class="who__title">Para instituições</h3>
          <p class="who__sub">Escolas e faculdades privadas</p>
          <ul class="who__list">
            <li *ngFor="let b of institutionBenefits" class="who__item">
              <span class="who__check tick"></span><span>{{b}}</span>
            </li>
          </ul>
          <button class="text-link text-link--lg" (click)="go('/demo?perfil=instituicao')">Sou uma instituição</button>
        </article>

        <article class="who__col who__col--teacher">
          <h3 class="who__title">Para professores</h3>
          <p class="who__sub">Licenciados disponíveis para substituições</p>
          <ul class="who__list">
            <li *ngFor="let b of teacherBenefits" class="who__item">
              <span class="who__check tick"></span><span>{{b}}</span>
            </li>
          </ul>
          <button class="text-link text-link--lg text-link--green" (click)="go('/demo?perfil=professor')">Sou professor</button>
        </article>
      </div>
    </div>
  </section>

  <!-- Chamada final -->
  <section class="cta-section">
    <div class="cta-section__inner">
      <h2 class="cta-section__title">Veja o fluxo completo funcionando</h2>
      <p class="cta-section__desc">Sem cadastro. Navegue pela demonstração com dados de exemplo, da solicitação à confirmação.</p>
      <button class="cta-section__btn" (click)="go('/demo')">Abrir a demonstração</button>
      <p class="cta-section__note">Dados fictícios. Nenhuma informação real é coletada.</p>
    </div>
  </section>

  <!-- Rodapé -->
  <footer class="footer">
    <div class="footer__inner">
      <div class="logo">
        <app-logo-mark [size]="30" [onDark]="true" />
        <span class="footer__logo-text">Aula<span class="footer__logo-accent">Sempre</span></span>
      </div>
      <p class="footer__copy">Protótipo acadêmico, versão de demonstração. Não há serviço real em operação.</p>
      <div class="footer__links">
        <button (click)="go('/demo?perfil=instituicao')">Sou instituição</button>
        <button (click)="go('/demo?perfil=professor')">Sou professor</button>
      </div>
    </div>
  </footer>

</div>
  `,
  styles: [`
    .landing { min-height: 100vh; background: var(--color-surface); font-family: var(--font-body); }

    /* ── Botões e links desta página ───────────────────────── */
    .solid-btn {
      position: relative; overflow: hidden;
      background: var(--color-primary); color: #fff;
      font-size: 15px; font-weight: 600; padding: 14px 26px; border-radius: 4px;
      box-shadow: inset 0 -3px 0 transparent;
      transition: box-shadow .25s ease, transform .25s ease;
      &:hover { box-shadow: inset 0 -3px 0 var(--color-warning); transform: translateY(-1px); }
      &:active { transform: translateY(1px); }
      &--sm { font-size: 13px; padding: 9px 16px; }
    }
    .text-link {
      font-size: 14px; font-weight: 600; color: var(--color-primary); padding: 4px 0;
      background: linear-gradient(var(--color-warning), var(--color-warning)) 0 100% / 0 2px no-repeat;
      transition: background-size .3s ease;
      &:hover { background-size: 100% 2px; }
      &--lg { font-size: 15px; }
      &--green { color: var(--color-success); }
    }

    /* ── Menu ──────────────────────────────────────────────── */
    .landing-nav {
      position: sticky; top: 0; z-index: 40;
      background: rgba(247,245,240,.92); backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--color-border);
    }
    .landing-nav__inner {
      max-width: 1100px; margin: 0 auto; padding: 0 24px;
      height: 64px; display: flex; align-items: center; justify-content: space-between;
    }
    .landing-nav__actions { display: flex; align-items: center; gap: 22px; }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo__text { font-family: var(--font-display); font-size: 19px; font-weight: 600; color: var(--color-primary); }
    .logo__accent { color: var(--color-warning); }

    /* ── Abertura: caderno com margem dourada ──────────────── */
    .hero {
      position: relative; overflow: hidden;
      background:
        linear-gradient(90deg, transparent 47px, rgba(185,126,36,.55) 47px, rgba(185,126,36,.55) 49px, transparent 49px),
        repeating-linear-gradient(180deg, transparent 0 35px, rgba(27,42,74,.07) 35px 36px),
        var(--color-bg);
    }
    .hero__inner {
      max-width: 1100px; margin: 0 auto; padding: 88px 24px 96px;
      display: grid; grid-template-columns: 1.15fr .85fr; gap: 56px; align-items: center;
    }
    .hero__title {
      font-family: var(--font-display);
      font-size: clamp(38px, 5.4vw, 64px); font-weight: 600; line-height: 1.08;
      color: var(--color-primary); margin-bottom: 22px; text-wrap: balance;
      animation: heroIn .7s cubic-bezier(.2,.7,.2,1) both;
    }
    .hero__desc {
      font-size: 18px; color: var(--color-text-secondary); max-width: 520px; line-height: 1.65; margin-bottom: 34px;
      animation: heroIn .7s .12s cubic-bezier(.2,.7,.2,1) both;
    }
    .hero__actions {
      display: flex; align-items: center; gap: 28px; flex-wrap: wrap;
      animation: heroIn .7s .24s cubic-bezier(.2,.7,.2,1) both;
    }
    @keyframes heroIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

    /* ── Exemplo ao vivo (folha de substituição) ───────────── */
    .board {
      position: relative; background: #fff;
      border: 1px solid var(--color-border-hover); border-radius: 3px;
      padding: 26px 26px 76px 64px;
      box-shadow: 8px 8px 0 var(--color-primary-light);
      transform: rotate(1.2deg);
      animation: boardIn .8s .3s cubic-bezier(.2,.7,.2,1) both;
    }
    .board::before {
      content: ''; position: absolute; top: 0; bottom: 0; left: 40px; width: 2px; background: var(--color-warning-border);
    }
    @keyframes boardIn { from { opacity: 0; transform: translateY(18px) rotate(2.4deg); } to { opacity: 1; transform: rotate(1.2deg); } }
    .board__meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--color-text-muted); margin-bottom: 6px; }
    .board__class { font-family: var(--font-display); font-size: 22px; font-weight: 600; color: var(--color-primary); margin-bottom: 22px; }
    .board__steps { list-style: none; display: flex; flex-direction: column; gap: 22px; }
    .board__steps li {
      position: relative; display: flex; gap: 14px; opacity: .38; transition: opacity .5s ease;
      b { display: block; font-size: 14px; color: var(--color-primary); }
      small { font-size: 12px; color: var(--color-text-secondary); }
    }
    .board__steps li.on { opacity: 1; }
    .board__dot {
      flex-shrink: 0; width: 12px; height: 12px; margin-top: 3px; border-radius: 50%;
      border: 2px solid var(--color-primary-muted); background: #fff;
      transition: background .4s ease, border-color .4s ease;
    }
    .board__steps li.on .board__dot { background: var(--color-primary); border-color: var(--color-primary); }
    .board__steps li:not(:last-child)::after {
      content: ''; position: absolute; left: 5px; top: 18px; width: 2px; height: calc(100% + 4px);
      background: var(--color-border); transition: background .5s ease;
    }
    .board__steps li:has(+ li.on)::after { background: var(--color-primary); }
    .board__stamp {
      position: absolute; right: 22px; bottom: 22px;
      font-family: var(--font-display); font-size: 20px; font-weight: 700; letter-spacing: .02em;
      color: var(--color-success); border: 2.5px solid var(--color-success); border-radius: 4px;
      padding: 4px 14px; background: rgba(255,255,255,.9);
      opacity: 0; transform: rotate(-8deg) scale(1.5);
      transition: opacity .15s ease, transform .35s cubic-bezier(.3,1.5,.5,1);
    }
    .board__stamp.show { opacity: 1; transform: rotate(-8deg) scale(1); }

    /* ── Seções ────────────────────────────────────────────── */
    .section { padding: 96px 0; }
    .section--paper { background: var(--color-bg); border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
    .section__inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .section__title { font-family: var(--font-display); font-size: 34px; font-weight: 600; color: var(--color-primary); margin-bottom: 12px; line-height: 1.15; }
    .section__title--left { margin-bottom: 40px; }
    .section__desc { color: var(--color-text-secondary); font-size: 16px; line-height: 1.6; max-width: 340px; }

    /* Como funciona */
    .how { display: grid; grid-template-columns: 300px 1fr; gap: 72px; align-items: start; }
    .how__head { position: sticky; top: 110px; }
    .how__list { list-style: none; }
    .how__item {
      position: relative; display: flex; gap: 28px; padding: 32px 0;
      border-top: 1px solid var(--color-border);
    }
    .how__item:last-child { border-bottom: 1px solid var(--color-border); }
    .how__item::before {
      content: ''; position: absolute; left: 0; right: 0; top: -1px; height: 2px;
      background: var(--color-primary); transform: scaleX(0); transform-origin: left;
      transition: transform .9s cubic-bezier(.2,.7,.2,1);
    }
    .how__item.in-view::before { transform: scaleX(1); }
    .how__num {
      font-family: var(--font-display); font-size: 56px; line-height: .9; font-weight: 600;
      color: var(--color-primary-muted); min-width: 44px; transition: color .3s ease;
    }
    .how__body { transition: transform .3s ease; }
    .how__item:hover .how__num { color: var(--color-warning); }
    .how__item:hover .how__body { transform: translateX(6px); }
    .how__title { font-size: 20px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px; }
    .how__desc { font-size: 15px; color: var(--color-text-secondary); line-height: 1.65; max-width: 520px; }

    /* Para quem é */
    .who { display: grid; grid-template-columns: 1fr 1fr; }
    .who__col { padding: 0 48px 0 0; }
    .who__col--teacher { padding: 0 0 0 48px; border-left: 1px solid var(--color-border-hover); }
    .who__title { font-size: 22px; color: var(--color-primary); }
    .who__col--teacher .who__title { color: var(--color-success); }
    .who__sub { font-size: 14px; color: var(--color-text-secondary); margin: 4px 0 24px; }
    .who__list { list-style: none; display: flex; flex-direction: column; gap: 4px; margin-bottom: 28px; }
    .who__item {
      display: flex; align-items: flex-start; gap: 12px; font-size: 15px; color: var(--color-text-body);
      padding: 8px 10px; margin-left: -10px; border-radius: 4px; transition: background .2s ease;
      &:hover { background: rgba(27,42,74,.05); }
      &:hover .who__check { transform: rotate(-45deg) scale(1.25); }
    }
    .who__check { margin-top: 7px; flex-shrink: 0; color: var(--color-primary); transition: transform .25s cubic-bezier(.3,1.5,.5,1); }
    .who__col--teacher .who__check { color: var(--color-success); }
    .who__col--teacher .who__item:hover { background: rgba(47,93,80,.07); }

    /* Chamada final */
    .cta-section { background: var(--color-success); padding: 88px 0; }
    .cta-section__inner { max-width: 640px; margin: 0 auto; padding: 0 24px; text-align: center; }
    .cta-section__title { font-family: var(--font-display); font-size: 34px; font-weight: 600; color: #fff; margin-bottom: 14px; line-height: 1.15; }
    .cta-section__desc { font-size: 17px; color: #CFE0D9; margin-bottom: 32px; line-height: 1.6; }
    .cta-section__btn {
      background: #fff; color: var(--color-success); font-weight: 700; font-size: 16px;
      padding: 15px 34px; border-radius: 4px; box-shadow: inset 0 -3px 0 transparent;
      transition: box-shadow .25s ease, transform .25s ease;
      &:hover { box-shadow: inset 0 -3px 0 var(--color-warning); transform: translateY(-1px); }
      &:active { transform: translateY(1px); }
    }
    .cta-section__note { font-size: 12px; color: var(--color-success-border); margin-top: 16px; }

    /* Rodapé */
    .footer { background: var(--color-primary); padding: 40px 0; }
    .footer__inner {
      max-width: 1100px; margin: 0 auto; padding: 0 24px;
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;
    }
    .footer__logo-text { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: #fff; }
    .footer__logo-accent { color: #D7B687; }
    .footer__copy { font-size: 13px; color: #8E9AB8; }
    .footer__links { display: flex; gap: 24px; }
    .footer__links button { font-size: 13px; color: #8E9AB8; transition: color .15s; }
    .footer__links button:hover { color: #fff; }

    /* ── Telas pequenas ────────────────────────────────────── */
    @media (max-width: 860px) {
      .hero { background:
        repeating-linear-gradient(180deg, transparent 0 35px, rgba(27,42,74,.07) 35px 36px), var(--color-bg); }
      .hero__inner { grid-template-columns: 1fr; padding: 56px 24px 64px; gap: 44px; }
      .board { transform: none; animation-name: heroIn; }
      .how { grid-template-columns: 1fr; gap: 32px; }
      .how__head { position: static; }
      .who { grid-template-columns: 1fr; gap: 40px; }
      .who__col, .who__col--teacher { padding: 0; border-left: 0; }
      .who__col--teacher { padding-top: 40px; border-top: 1px solid var(--color-border-hover); }
      .section { padding: 64px 0; }
      .landing-nav__actions { gap: 14px; }
      .solid-btn--sm { white-space: nowrap; padding: 9px 12px; }
      .logo__text { font-size: 17px; white-space: nowrap; }
    }
  `],
})
export class LandingPageComponent implements OnInit, OnDestroy {
  constructor(private router: Router) {}

  /** Etapa do exemplo no topo: 0 ausência, 1 convites, 2 aceite, 3 carimbo de confirmada */
  step = signal(0);
  private timer?: ReturnType<typeof setTimeout>;
  private readonly waits = [1500, 1600, 1600, 4200];

  ngOnInit() {
    const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { this.step.set(3); return; }
    this.schedule();
  }

  ngOnDestroy() { clearTimeout(this.timer); }

  private schedule() {
    this.timer = setTimeout(() => {
      this.step.update(s => (s + 1) % this.waits.length);
      this.schedule();
    }, this.waits[this.step()]);
  }

  go(path: string) { this.router.navigateByUrl(path); }

  steps = [
    { num: '1', title: 'Solicite a substituição', desc: 'Informe disciplina, data, horário e nível de ensino. O sistema avisa os professores disponíveis na sua região.' },
    { num: '2', title: 'Encontre o professor ideal', desc: 'Veja perfis verificados, avaliações de outras escolas, experiência e compatibilidade com a sua necessidade.' },
    { num: '3', title: 'Confirme e acompanhe', desc: 'Envie o convite, receba a confirmação e acompanhe tudo pelo painel. Professor e escola recebem todos os detalhes.' },
  ];

  institutionBenefits = [
    'Professores disponíveis na sua cidade',
    'Perfis verificados com avaliações reais',
    'Solicitação em menos de 3 minutos',
    'Histórico e avaliações de todas as substituições',
    'Nenhuma aula cancelada por falta de professor',
  ];

  teacherBenefits = [
    'Convites para substituições perto de você',
    'Você aceita ou recusa cada convite',
    'Avaliações que fortalecem o seu perfil',
    'Flexibilidade de horário e modalidade',
    'Renda extra sem compromisso fixo',
  ];
}
