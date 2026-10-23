import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../../core/services/app-state.service';
import { Teacher } from '../../../core/models/app.models';
import { errorMessage } from '../../../core/services/api.service';

const COLOR_MAP: Record<string, string> = {
  blue: 'avatar--blue',
  green: 'avatar--green',
  purple: 'avatar--purple',
  amber: 'avatar--amber',
};

@Component({
  selector: 'app-search-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page-content page-enter">
  <div class="page-top">
    <div>
      <h1 class="page-title">Buscar professores</h1>
      <p class="page-sub">Encontre professores disponíveis e envie convites</p>
    </div>
  </div>

  <!-- Success banner -->
  @if (success()) {
    <div class="success-banner">
      <p>{{success()}}</p>
    </div>
  }

  <!-- Select open request -->
  @if (openRequests().length > 0) {
    <div class="select-req-box">
      <p class="select-req-label">Qual solicitação deseja preencher?</p>
      <select [(ngModel)]="selectedRequestId" (ngModelChange)="loadMatches()" class="form-input">
        <option value="">Selecione uma solicitação aberta...</option>
        <option *ngFor="let r of openRequests()" [value]="r.id">
          {{r.disciplina}} · {{r.turma || r.nivel}} · {{fmtDate(r.data)}} · {{r.horarioInicio}}–{{r.horarioFim}}
        </option>
      </select>
    </div>
  } @else {
    <div class="no-req-warning">
      <div>
        <p style="font-size:14px;font-weight:600;color:var(--color-warning-dark)">Nenhuma solicitação aberta</p>
        <p style="font-size:13px;color:var(--color-warning-dark);margin-top:2px">Crie uma solicitação antes de convidar professores.</p>
        <button class="link-btn" (click)="go('/instituicao/solicitar')" style="margin-top:4px">Criar solicitação</button>
      </div>
    </div>
  }

    @if (error()) { <p class="form-error" role="alert">{{error()}}</p> }
    @if (matching()) { <p role="status">Buscando professores compatíveis…</p> }
  <div class="search-layout">
    <!-- Filters -->
    <div class="filters-panel">
      <h3 class="filters-title">Filtros</h3>
      <div class="filter-group">
        <label class="filter-label">Busca</label>
        <input [(ngModel)]="search" class="form-input" placeholder="Nome ou disciplina..." />
      </div>
      <div class="filter-group">
        <label class="filter-label">Disciplina</label>
        <select [(ngModel)]="filterDisciplina" class="form-input">
          <option value="">Todas</option>
          <option *ngFor="let d of allDisciplinas()">{{d}}</option>
        </select>
      </div>
      <label class="filter-check">
        <input type="checkbox" [(ngModel)]="filterAvail" />
        <span>Apenas disponíveis</span>
      </label>

      <!-- Sort -->
      <div class="filter-group" style="margin-top:16px">
        <label class="filter-label">Ordenar por</label>
        <div class="sort-group">
          <button *ngFor="let s of sortOptions" class="sort-btn" [class.active]="sortBy===s.v" (click)="sortBy=s.v">{{s.l}}</button>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="results">
      <p class="results-count">{{filtered().length}} professor(es)</p>

      @if (filtered().length === 0) {
        <div class="card">
          <div class="empty-state">
            <div class="empty-state__icon"></div>
            <p class="empty-state__title">Nenhum professor encontrado</p>
            <p class="empty-state__desc">Tente ajustar os filtros de busca.</p>
          </div>
        </div>
      } @else {
        <div class="teacher-list">
          <div class="teacher-card" *ngFor="let t of filtered()">
            <div class="teacher-card__inner">
              <div class="teacher-avatar" [class]="avatarCls(t.cor)">{{t.initials}}</div>
              <div class="teacher-info">
                <div class="teacher-info__top">
                  <div>
                    <div class="teacher-name-row">
                      <h3 class="teacher-name">{{t.nome}}</h3>
                      @if (t.verificado) { <span class="verified-badge">Verificado</span> }
                    </div>
                    <p class="teacher-formacao">{{t.formacao}}</p>
                  </div>
                  <div class="teacher-avail" [class.available]="t.disponivel">
                    <span class="avail-dot" [class.green]="t.disponivel"></span>
                    {{t.disponivel ? 'Disponível' : 'Indisponível'}}
                  </div>
                </div>

                <div class="teacher-stats">
                  <span class="stars-row">Nota <b>{{t.nota}}</b></span>
                  <span>{{t.experiencia}} anos de experiência</span>
                  <span>{{t.distancia}}</span>
                  <span>{{t.subs}} substituições</span>
                </div>

                <div class="teacher-tags">
                  <span class="tag" *ngFor="let d of t.disciplinas">{{d}}</span>
                </div>

                <div class="teacher-actions">
                  <button class="btn btn--secondary btn--sm" (click)="go('/instituicao/professor/'+t.id)">Ver perfil</button>
                  @if (t.disponivel && !isInvited(t.id)) {
                    <button class="btn btn--primary btn--sm"
                      [disabled]="!selectedRequestId || busy() || matching()"
                      (click)="invite(t.id, t.nome)">
                      {{selectedRequestId ? 'Convidar para substituição' : 'Selecione uma solicitação'}}
                    </button>
                  }
                  @if (isInvited(t.id)) {
                    <span class="invited-chip">Convite enviado</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  </div>
</div>
  `,
  styles: [`
    .page-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; gap:16px; }
    .page-title { font-family:'Source Serif 4', Georgia, serif; font-size:23px; font-weight:600; color:var(--color-primary); }
    .page-sub { font-size:13px; color:var(--color-text-muted); margin-top:2px; }
    .success-banner { display:flex; align-items:center; gap:10px; background:var(--color-success-light); border:1px solid var(--color-success-border); border-left:4px solid var(--color-success); border-radius:4px; padding:14px 16px; margin-bottom:16px; font-size:14px; font-weight:600; color:var(--color-success); }
    .select-req-box { background:var(--color-primary-light); border:1px solid var(--color-primary-muted); border-radius:4px; padding:16px; margin-bottom:20px;
      p { font-size:14px; font-weight:600; color:var(--color-primary); margin-bottom:8px; }
    }
    .select-req-label { font-size:14px; font-weight:600; color:var(--color-primary); margin-bottom:8px; }
    .no-req-warning { display:flex; align-items:flex-start; gap:12px; background:var(--color-warning-light); border:1px solid var(--color-warning-border); border-left:4px solid var(--color-warning); border-radius:4px; padding:14px 16px; margin-bottom:20px; }
    .link-btn { font-size:13px; font-weight:600; color:var(--color-primary); &:hover{text-decoration:underline;} }
    .search-layout { display:flex; gap:24px; align-items:flex-start; }
    @media(max-width:900px) { .search-layout { flex-direction:column; } .search-layout .filters-panel { width:100%; } }
    .filters-panel { width:220px; flex-shrink:0; background:#fff; border:1px solid var(--color-border); border-radius:6px; padding:20px; }
    .filters-title { font-size:14px; font-weight:700; color:var(--color-primary); margin-bottom:16px; }
    .filter-group { margin-bottom:14px; }
    .filter-label { display:block; font-size:11px; font-weight:600; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }
    .filter-check { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--color-text-body); cursor:pointer;
      input { accent-color:var(--color-primary); }
    }
    .sort-group { display:flex; flex-direction:column; gap:4px; }
    .sort-btn { padding:6px 10px; border-radius:4px; font-size:12px; font-weight:500; color:var(--color-text-secondary); text-align:left; transition:all .15s;
      &:hover { background:var(--color-bg); }
      &.active { background:var(--color-primary-light); color:var(--color-primary); font-weight:600; }
    }
    .results { flex:1; min-width:0; }
    .results-count { font-size:13px; color:var(--color-text-muted); margin-bottom:12px; }
    .teacher-list { display:flex; flex-direction:column; gap:14px; }
    .teacher-card { background:#fff; border:1px solid var(--color-border); border-radius:6px; padding:20px; transition:border-color .2s;
      &:hover { border-color:var(--color-border-hover); }
    }
    .teacher-card__inner { display:flex; gap:16px; }
    .teacher-avatar { width:50px; height:50px; border-radius:4px; font-size:16px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0;
      &--blue { background:var(--color-primary-light); color:var(--color-primary); }
      &--green { background:var(--color-success-light); color:var(--color-success); }
      &--purple { background:#EEE9F6; color:#4A3B7A; }
      &--amber { background:var(--color-warning-light); color:var(--color-warning-dark); }
    }
    .teacher-info { flex:1; min-width:0; }
    .teacher-info__top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px; gap:10px; }
    .teacher-name-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .teacher-name { font-size:16px; font-weight:700; color:var(--color-primary); }
    .teacher-formacao { font-size:12px; color:var(--color-text-muted); margin-top:2px; }
    .verified-badge { background:var(--color-primary-light); color:var(--color-primary); font-size:11px; font-weight:600; padding:2px 8px; border-radius:9999px; border:1px solid var(--color-primary-muted); }
    .teacher-avail { font-size:12px; font-weight:500; color:var(--color-text-muted); display:flex; align-items:center; gap:4px; flex-shrink:0;
      &.available { color:var(--color-success); }
    }
    .avail-dot { width:6px; height:6px; border-radius:50%; background:var(--color-primary-muted);
      &.green { background:var(--color-success); }
    }
    .teacher-stats { display:flex; align-items:center; gap:14px; flex-wrap:wrap; font-size:12px; color:var(--color-text-secondary); margin-bottom:8px; }
    .stars-row { display:flex; align-items:center; gap:4px; b { color:var(--color-primary); } }
    .teacher-tags { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
    .tag { background:var(--color-neutral-light); color:var(--color-text-secondary); font-size:12px; padding:3px 8px; border-radius:4px; }
    .teacher-actions { display:flex; gap:8px; flex-wrap:wrap; }
    .invited-chip { font-size:12px; font-weight:600; color:var(--color-primary); background:var(--color-primary-light); padding:6px 12px; border-radius:4px; }
  `],
})
export class SearchTeachersComponent {
  search = '';
  filterDisciplina = '';
  filterAvail = false;
  sortBy = 'nota';
  selectedRequestId = '';
  invitedId: string | null = null;
  success = signal<string | null>(null);
  error = signal('');
  busy = signal(false);
  matching = signal(false);
  matchIds = signal<string[] | null>(null);

  sortOptions = [
    { v: 'nota', l: 'Melhor avaliação' },
    { v: 'subs', l: 'Mais substituições' },
    { v: 'experiencia', l: 'Mais experiência' },
  ];

  constructor(private router: Router, private appState: AppStateService) { void appState.retry(); }

  openRequests() { return this.appState.requests.filter(r => ['aberta','aguardando'].includes(r.status)); }

  async loadMatches() {
    const id = this.selectedRequestId; this.matchIds.set(null); this.error.set(''); this.invitedId = null;
    if (!id) { this.matching.set(false); return; }
    this.matching.set(true);
    try { const ids = await this.appState.compatibleTeachers(id); if (id === this.selectedRequestId) this.matchIds.set(ids); }
    catch (e) { if (id === this.selectedRequestId) this.error.set(errorMessage(e)); }
    finally { if (id === this.selectedRequestId) this.matching.set(false); }
  }

  allDisciplinas() {
    return Array.from(new Set(this.appState.teachers.flatMap(t => t.disciplinas))).sort();
  }

  filtered(): Teacher[] {
    const selectedReq = this.openRequests().find(r => r.id === this.selectedRequestId);
    return this.appState.teachers
      .filter(t => {
        if (selectedReq && !this.matchIds()?.includes(t.id)) return false;
        if (this.filterAvail && !t.disponivel) return false;
        if (this.filterDisciplina && !t.disciplinas.includes(this.filterDisciplina)) return false;
        if (this.search) {
          const s = this.search.toLowerCase();
          if (!t.nome.toLowerCase().includes(s) && !t.disciplinas.join(' ').toLowerCase().includes(s)) return false;
        }
        if (selectedReq && selectedReq.recusadoPorIds.includes(t.id)) return false;
        return true;
      })
      .sort((a, b) => {
        if (this.sortBy === 'nota') return b.nota - a.nota;
        if (this.sortBy === 'subs') return b.subs - a.subs;
        return b.experiencia - a.experiencia;
      });
  }

  isInvited(id: string) {
    if (this.invitedId === id) return true;
    const selectedReq = this.openRequests().find(r => r.id === this.selectedRequestId);
    return selectedReq?.invitedTeacherIds?.includes(id) || selectedReq?.professorConvidadoId === id;
  }

  async invite(teacherId: string, teacherNome: string) {
    if (!this.selectedRequestId || this.busy()) return;
    this.busy.set(true); this.error.set('');
    try {
    await this.appState.inviteTeacher(this.selectedRequestId, teacherId, teacherNome);
    this.invitedId = teacherId;
    this.success.set(`Convite enviado para ${teacherNome}! Aguardando resposta.`);
    setTimeout(() => this.router.navigateByUrl('/instituicao/solicitacoes'), 2000);
    } catch (e) { this.error.set(errorMessage(e)); }
    finally { this.busy.set(false); }
  }

  fmtDate(data: string) {
    if (!data) return '';
    const [y, m, d] = data.split('-');
    return `${d}/${m}/${y}`;
  }
  avatarCls(cor: string) { return `teacher-avatar ${COLOR_MAP[cor] || 'avatar--blue'}`; }
  go(path: string) { this.router.navigateByUrl(path); }
}
