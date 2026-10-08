import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../../core/services/app-state.service';
import { SubRequest } from '../../../core/models/app.models';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="page-content page-enter">
  <!-- Header -->
  <div class="dash-header">
    <div>
      <h1 class="dash-title">{{greeting}}, {{teacher.nome}}!</h1>
      <p class="dash-date">{{today}}</p>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-card__icon">✉️</div>
      <div class="stat-card__value">{{myInvites.length}}</div>
      <div class="stat-card__label">Convites recebidos</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__icon">✅</div>
      <div class="stat-card__value">{{myConfirmed.length}}</div>
      <div class="stat-card__label">Substituições confirmadas</div>
    </div>
    <div class="stat-card">
      <div class="stat-card__icon">⭐</div>
      <div class="stat-card__value">{{teacher.nota}}</div>
      <div class="stat-card__label">Avaliação média</div>
    </div>
  </div>

  <!-- Pending Invites Alert Card -->
  @if (myInvites.length > 0) {
    <div class="card card--invite-highlight">
      <div class="card-header">
        <div class="invite-header-badge">
          <span class="invite-count">{{myInvites.length}}</span>
          <h2 class="card-header__title">Convite{{myInvites.length > 1 ? 's' : ''}} aguardando sua resposta</h2>
        </div>
        <button class="link-btn" (click)="go('/professor/convites')">Ver todos</button>
      </div>

      <div class="invite-list">
        <div class="invite-item" *ngFor="let r of myInvites">
          <div class="invite-item__info">
            <p class="invite-item__title">{{r.disciplina}} · {{r.turma || r.nivel}}</p>
            <p class="invite-item__sub">
              {{r.instituicaoNome}} · {{fmt(r.data)}} · {{r.horarioInicio}}–{{r.horarioFim}} · R$ {{r.valor}}
            </p>
          </div>
          <button class="btn btn--primary btn--sm" (click)="go('/professor/convites')">
            Ver convite
          </button>
        </div>
      </div>
    </div>
  }

  <!-- Confirmed Substitutions -->
  <div class="card" style="margin-top: 24px;">
    <div class="card-header">
      <h2 class="card-header__title">Substituições confirmadas</h2>
      @if (myConfirmed.length > 0) {
        <button class="link-btn" (click)="go('/professor/confirmadas')">Ver todas</button>
      }
    </div>

    @if (myConfirmed.length === 0) {
      <div class="empty-state">
        <div class="empty-state__icon">📅</div>
        <p class="empty-state__title">Nenhuma substituição confirmada ainda</p>
        <p class="empty-state__desc">
          {{myInvites.length === 0 ? 'Aguarde novos convites de instituições.' : 'Você possui convites pendentes de resposta acima.'}}
        </p>
      </div>
    } @else {
      <div class="confirmed-list">
        <div class="confirmed-item" *ngFor="let r of myConfirmed.slice(0, 5)">
          <div class="confirmed-item__info">
            <p class="confirmed-item__title">{{r.disciplina}} · {{r.turma || r.nivel}}</p>
            <p class="confirmed-item__sub">
              {{r.instituicaoNome}} · {{fmt(r.data)}} · {{r.horarioInicio}}–{{r.horarioFim}}
              @if (r.modalidade === 'presencial') { · {{r.cidade}} }
            </p>
          </div>
          <span class="badge badge--confirmada">✓ Confirmada</span>
        </div>
      </div>
    }
  </div>
</div>
  `,
  styles: [`
    .dash-header { margin-bottom: 28px; }
    .dash-title { font-size: 22px; font-weight: 700; color: #0F172A; }
    .dash-date { font-size: 13px; color: #94A3B8; margin-top: 2px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    
    .card--invite-highlight {
      border: 1.5px solid #BFDBFE;
      background: #FFFFFF;
    }
    .card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 24px; border-bottom: 1px solid #F1F5F9;
    }
    .card-header__title { font-size: 15px; font-weight: 600; color: #0F172A; }
    .link-btn { font-size: 13px; font-weight: 500; color: #2563EB; &:hover { text-decoration: underline; } }

    .invite-header-badge { display: flex; align-items: center; gap: 10px; }
    .invite-count {
      width: 26px; height: 26px; border-radius: 50%;
      background: #2563EB; color: #fff; font-size: 12px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }

    .invite-list, .confirmed-list { padding: 8px; }
    .invite-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; border-radius: 12px; background: #EFF6FF; margin: 4px 0; gap: 12px;
    }
    .invite-item__info { flex: 1; min-width: 0; }
    .invite-item__title { font-size: 14px; font-weight: 600; color: #1E3A8A; }
    .invite-item__sub { font-size: 12px; color: #3B82F6; margin-top: 2px; }

    .confirmed-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; border-radius: 12px; transition: background .15s;
      &:hover { background: #F8FAFC; }
    }
    .confirmed-item__info { flex: 1; min-width: 0; }
    .confirmed-item__title { font-size: 14px; font-weight: 600; color: #0F172A; }
    .confirmed-item__sub { font-size: 12px; color: #64748B; margin-top: 2px; }
  `],
})
export class TeacherDashboardComponent {
  constructor(private router: Router, private appState: AppStateService) { void appState.retry(); }

  get teacher() { return this.appState.currentTeacher; }

  get myInvites(): SubRequest[] {
    return this.appState.requests.filter(
      r => r.status === 'aguardando' && r.professorConvidadoId === this.teacher.id
    );
  }

  get myConfirmed(): SubRequest[] {
    return this.appState.requests.filter(
      r => r.status === 'confirmada' && r.professorConfirmadoId === this.teacher.id
    );
  }

  get greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  }

  get today() {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  fmt(data: string) {
    if (!data) return '—';
    const [y, m, d] = data.split('-');
    return `${d}/${m}/${y}`;
  }

  go(path: string) {
    this.router.navigateByUrl(path);
  }
}
