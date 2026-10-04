import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppStateService } from '../../../core/services/app-state.service';
import { SubRequest } from '../../../core/models/app.models';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  aberta:     { label: 'Buscando professor',     cls: 'badge--aberta' },
  aguardando: { label: 'Aguardando confirmação', cls: 'badge--aguardando' },
  confirmada: { label: 'Professor confirmado',   cls: 'badge--confirmada' },
  recusada:   { label: 'Recusada',               cls: 'badge--recusada' },
  concluida:  { label: 'Concluída',              cls: 'badge--concluida' },
  cancelada:  { label: 'Cancelada',              cls: 'badge--cancelada' },
};

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="page-content page-enter">
  <div class="page-top">
    <div>
      <h1 class="page-title">Minhas solicitações</h1>
      <p class="page-sub">Gerencie suas solicitações de substituição</p>
    </div>
    <button class="btn btn--primary" (click)="go('/instituicao/solicitar')">+ Nova solicitação</button>
  </div>

  <!-- Filter tabs -->
  <div class="filter-tabs">
    <button *ngFor="let f of filters" class="filter-tab"
      [class.active]="activeFilter() === f.value"
      (click)="activeFilter.set(f.value)">
      {{f.label}}
      @if (countFor(f.value) > 0) {
        <span class="tab-count">{{countFor(f.value)}}</span>
      }
    </button>
  </div>

  <!-- List -->
  @if (filtered().length === 0) {
    <div class="card">
      <div class="empty-state">
        <div class="empty-state__icon">📭</div>
        <p class="empty-state__title">Nenhuma solicitação encontrada</p>
        <p class="empty-state__desc">
          @if (activeFilter() === 'todas') { Crie sua primeira solicitação. }
          @else { Não há solicitações com este status. }
        </p>
        @if (activeFilter() === 'todas') {
          <button class="btn btn--primary" style="margin-top:16px" (click)="go('/instituicao/solicitar')">Criar solicitação</button>
        }
      </div>
    </div>
  } @else {
    <div class="req-list">
      <div class="req-card" *ngFor="let r of filtered()">
        <div class="req-card__top">
          <div>
            <h3 class="req-card__title">{{r.disciplina}} · {{r.turma || r.nivel}}</h3>
            <p class="req-card__sub">{{fmt(r.data)}} · {{r.horarioInicio}} – {{r.horarioFim}} · {{r.modalidade === 'presencial' ? r.cidade : 'Online'}}</p>
          </div>
          <span class="badge" [class]="cls(r.status)">{{label(r.status)}}</span>
        </div>

        @if (r.professorConvidadoNome) {
          <div class="req-card__teacher">
            <span class="teacher-avatar">{{r.professorConvidadoNome.charAt(0)}}</span>
            <span>{{r.professorConvidadoNome}}</span>
            @if (r.status === 'aguardando') { <span class="waiting-chip">Aguardando resposta</span> }
            @if (r.status === 'confirmada') { <span class="confirmed-chip">✓ Confirmado</span> }
          </div>
        }

        <div class="req-card__footer">
          <span class="req-card__val">R$ {{r.valor || 'A combinar'}}</span>
          <div class="req-card__actions">
            @if (r.status === 'aberta') {
              <button class="btn btn--primary btn--sm" (click)="go('/instituicao/professores')">Buscar professor</button>
            }
            @if (['aberta','aguardando'].includes(r.status)) {
              <button class="btn btn--danger btn--sm" (click)="cancel(r.id)">Cancelar</button>
            }
          </div>
        </div>
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    .page-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; gap:16px; flex-wrap:wrap; }
    .page-title { font-size:22px; font-weight:700; color:#0F172A; }
    .page-sub { font-size:13px; color:#94A3B8; margin-top:2px; }
    .filter-tabs { display:flex; gap:4px; flex-wrap:wrap; margin-bottom:20px; background:#F1F5F9; padding:4px; border-radius:12px; }
    .filter-tab {
      display:flex; align-items:center; gap:6px;
      padding:7px 14px; border-radius:9px; font-size:13px; font-weight:500; color:#64748B;
      transition:all .15s;
      &:hover { background:#fff; }
      &.active { background:#fff; color:#0F172A; box-shadow:0 1px 4px rgba(0,0,0,.08); font-weight:600; }
    }
    .tab-count {
      background:#2563EB; color:#fff; font-size:11px; font-weight:700;
      width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center;
    }
    .req-list { display:flex; flex-direction:column; gap:14px; }
    .req-card { background:#fff; border:1px solid #E2E8F0; border-radius:16px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,.05); }
    .req-card__top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:12px; gap:12px; }
    .req-card__title { font-size:15px; font-weight:700; color:#0F172A; }
    .req-card__sub { font-size:13px; color:#94A3B8; margin-top:2px; }
    .req-card__teacher {
      display:flex; align-items:center; gap:8px; padding:10px 12px;
      background:#F8FAFC; border-radius:10px; font-size:13px; color:#334155; margin-bottom:12px;
    }
    .teacher-avatar {
      width:28px; height:28px; border-radius:50%; background:#DBEAFE;
      color:#1D4ED8; font-size:12px; font-weight:700;
      display:flex; align-items:center; justify-content:center;
    }
    .waiting-chip { margin-left:auto; font-size:11px; font-weight:600; color:#1D4ED8; background:#DBEAFE; padding:3px 8px; border-radius:9999px; }
    .confirmed-chip { margin-left:auto; font-size:11px; font-weight:600; color:#065F46; background:#D1FAE5; padding:3px 8px; border-radius:9999px; }
    .req-card__footer { display:flex; align-items:center; justify-content:space-between; }
    .req-card__val { font-size:13px; font-weight:600; color:#334155; }
    .req-card__actions { display:flex; gap:8px; }
  `],
})
export class MyRequestsComponent {
  activeFilter = signal<string>('todas');

  filters = [
    { label: 'Todas', value: 'todas' },
    { label: 'Ativas', value: 'ativas' },
    { label: 'Aguardando', value: 'aguardando' },
    { label: 'Confirmadas', value: 'confirmada' },
    { label: 'Concluídas', value: 'concluida' },
    { label: 'Canceladas', value: 'cancelada' },
  ];

  constructor(private router: Router, private appState: AppStateService) {}

  get reqs() { return this.appState.requests; }

  filtered() {
    const f = this.activeFilter();
    if (f === 'todas') return this.reqs;
    if (f === 'ativas') return this.reqs.filter(r => !['concluida','cancelada'].includes(r.status));
    return this.reqs.filter(r => r.status === f);
  }

  countFor(f: string) {
    if (f === 'todas') return this.reqs.length;
    if (f === 'ativas') return this.reqs.filter(r => !['concluida','cancelada'].includes(r.status)).length;
    return this.reqs.filter(r => r.status === f).length;
  }

  fmt(data: string) {
    if (!data) return '—';
    const [y, m, d] = data.split('-');
    return `${d}/${m}/${y}`;
  }
  label(s: string) { return STATUS_MAP[s]?.label || s; }
  cls(s: string) { return STATUS_MAP[s]?.cls || ''; }
  cancel(id: string) { this.appState.cancelRequest(id); }
  go(path: string) { this.router.navigateByUrl(path); }
}
