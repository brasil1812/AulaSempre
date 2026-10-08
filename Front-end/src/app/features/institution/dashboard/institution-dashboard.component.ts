import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppStateService } from '../../../core/services/app-state.service';
import { SubRequest } from '../../../core/models/app.models';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  aberta:     { label: 'Buscando professor',       cls: 'badge--aberta' },
  aguardando: { label: 'Aguardando confirmação',   cls: 'badge--aguardando' },
  confirmada: { label: 'Professor confirmado',     cls: 'badge--confirmada' },
  recusada:   { label: 'Recusada',                 cls: 'badge--recusada' },
  concluida:  { label: 'Concluída',                cls: 'badge--concluida' },
  cancelada:  { label: 'Cancelada',                cls: 'badge--cancelada' },
};

@Component({
  selector: 'app-institution-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="page-content page-enter">

  <!-- Header -->
  <div class="dash-header">
    <div>
      <h1 class="dash-title">{{greeting}}, {{inst.nome}}!</h1>
      <p class="dash-date">{{today}}</p>
    </div>
    <button class="btn btn--primary" (click)="go('/instituicao/solicitar')">
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
      Solicitar substituição
    </button>
  </div>

  <!-- Stats -->
  <div class="stats-grid">
    <div class="stat-card" *ngFor="let s of stats">
      <div class="stat-card__icon">{{s.icon}}</div>
      <div class="stat-card__value">{{s.value}}</div>
      <div class="stat-card__label">{{s.label}}</div>
    </div>
  </div>

  <!-- Recent requests -->
  <div class="card">
    <div class="card-header">
      <h2 class="card-header__title">Solicitações recentes</h2>
      <button class="link-btn" (click)="go('/instituicao/solicitacoes')">Ver todas</button>
    </div>

    @if (requests.length === 0) {
      <div class="empty-state">
        <div class="empty-state__icon">📭</div>
        <p class="empty-state__title">Nenhuma solicitação ainda</p>
        <p class="empty-state__desc">Crie sua primeira solicitação de substituição</p>
        <button class="btn btn--primary" style="margin-top:16px" (click)="go('/instituicao/solicitar')">Solicitar substituição</button>
      </div>
    } @else {
      <div class="req-list">
        <div class="req-item" *ngFor="let r of requests.slice(0,5)" (click)="go('/instituicao/solicitacoes')">
          <div class="req-item__info">
            <p class="req-item__title">{{r.disciplina}} · {{r.turma || r.nivel}}</p>
            <p class="req-item__sub">{{fmt(r.data)}} · {{r.horarioInicio}} – {{r.horarioFim}}{{r.professorConvidadoNome ? ' · ' + r.professorConvidadoNome : ''}}</p>
          </div>
          <div class="req-item__actions">
            <span class="badge" [class]="statusCls(r.status)">{{statusLabel(r.status)}}</span>
            @if (r.status === 'aberta') {
              <button class="btn btn--primary btn--sm" (click)="$event.stopPropagation(); go('/instituicao/professores')">
                Buscar professores
              </button>
            }
          </div>
        </div>
      </div>
    }
  </div>

</div>
  `,
  styles: [`
    .dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
    .dash-title { font-size: 22px; font-weight: 700; color: #0F172A; }
    .dash-date { font-size: 13px; color: #94A3B8; margin-top: 2px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; }
    .card-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #F1F5F9; }
    .card-header__title { font-size: 15px; font-weight: 600; color: #0F172A; }
    .link-btn { font-size: 13px; font-weight: 500; color: #2563EB; &:hover { text-decoration: underline; } }
    .req-list { padding: 8px; }
    .req-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; border-radius: 12px; cursor: pointer; gap: 12px;
      transition: background .15s;
      &:hover { background: #F8FAFC; }
    }
    .req-item__info { flex: 1; min-width: 0; }
    .req-item__title { font-size: 14px; font-weight: 600; color: #0F172A; }
    .req-item__sub { font-size: 12px; color: #94A3B8; margin-top: 2px; }
    .req-item__actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  `],
})
export class InstitutionDashboardComponent {
  constructor(private router: Router, public appState: AppStateService) { void appState.retry(); }

  get requests(): SubRequest[] { return this.appState.requests; }
  get inst() { return this.appState.currentInstitution; }

  get greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  }
  get today() {
    return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  get stats() {
    const reqs = this.requests;
    return [
      { label: 'Solicitações ativas', value: reqs.filter(r => !['concluida','cancelada'].includes(r.status)).length, icon: '📋' },
      { label: 'Aguardando resposta', value: reqs.filter(r => r.status === 'aguardando').length, icon: '⏳' },
      { label: 'Confirmadas', value: reqs.filter(r => r.status === 'confirmada').length, icon: '✅' },
      { label: 'Em aberto', value: reqs.filter(r => r.status === 'aberta').length, icon: '🔍' },
    ];
  }

  fmt(data: string) {
    if (!data) return '—';
    const [y, m, d] = data.split('-');
    return `${d}/${m}/${y}`;
  }
  statusLabel(s: string) { return STATUS_MAP[s]?.label || s; }
  statusCls(s: string) { return STATUS_MAP[s]?.cls || ''; }
  go(path: string) { this.router.navigateByUrl(path); }
}
