import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../../core/services/app-state.service';
import { SubRequest } from '../../../core/models/app.models';

@Component({
  selector: 'app-teacher-invites',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="page-content page-enter">
  <div class="page-header">
    <h1 class="page-title">Convites recebidos</h1>
    <p class="page-sub">Aceite ou recuse convites de substituição</p>
  </div>

  @if (pending.length === 0 && others.length === 0) {
    <div class="card empty-card">
      <div class="empty-state">
        <div class="empty-state__icon">✉️</div>
        <h3 class="empty-state__title">Nenhum convite recebido</h3>
        <p class="empty-state__desc">Quando uma escola te convidar, o convite aparecerá aqui.</p>
      </div>
    </div>
  } @else {
    <div class="invites-container">
      <!-- Pending invites -->
      @if (pending.length > 0) {
        <div class="invites-section">
          <h2 class="section-title">Aguardando sua resposta ({{pending.length}})</h2>
          <div class="cards-list">
            <div class="card invite-card" *ngFor="let r of pending">
              <div class="invite-card__header">
                <div>
                  <h3 class="invite-card__title">{{r.disciplina}}</h3>
                  <p class="invite-card__sub">{{r.turma || r.nivel}}</p>
                </div>
                <span class="badge badge--aguardando">Novo convite</span>
              </div>

              <div class="details-grid">
                <div class="detail-box">
                  <p class="detail-box__key">🏢 Instituição</p>
                  <p class="detail-box__val">{{r.instituicaoNome}}</p>
                </div>
                <div class="detail-box">
                  <p class="detail-box__key">📅 Data</p>
                  <p class="detail-box__val">{{fmt(r.data)}}</p>
                </div>
                <div class="detail-box">
                  <p class="detail-box__key">🕐 Horário</p>
                  <p class="detail-box__val">{{r.horarioInicio}} – {{r.horarioFim}}</p>
                </div>
                <div class="detail-box">
                  <p class="detail-box__key">📍 Modalidade</p>
                  <p class="detail-box__val">
                    {{r.modalidade === 'presencial' ? 'Presencial – ' + r.cidade : 'Online'}}
                  </p>
                </div>
                <div class="detail-box">
                  <p class="detail-box__key">💰 Valor</p>
                  <p class="detail-box__val">R$ {{r.valor}}</p>
                </div>
                @if (r.turma) {
                  <div class="detail-box">
                    <p class="detail-box__key">👥 Turma</p>
                    <p class="detail-box__val">{{r.turma}}</p>
                  </div>
                }
              </div>

              @if (r.observacoes) {
                <div class="notes-box">
                  <p class="notes-box__title">📝 Observações da instituição</p>
                  <p class="notes-box__content">{{r.observacoes}}</p>
                </div>
              }

              <div class="actions-row">
                <button class="btn btn--danger btn--lg" style="flex: 1;" (click)="decline(r.id)">
                  Recusar convite
                </button>
                <button class="btn btn--success btn--lg" style="flex: 1;" (click)="accept(r.id)">
                  Aceitar convite
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- History of invites -->
      @if (others.length > 0) {
        <div class="invites-section" style="margin-top: 32px;">
          <h2 class="section-title">Histórico de convites</h2>
          <div class="cards-list">
            <div class="card history-card" *ngFor="let r of others">
              <div class="history-card__inner">
                <div>
                  <p class="history-card__title">{{r.disciplina}} · {{r.turma || r.nivel}}</p>
                  <p class="history-card__sub">{{r.instituicaoNome}} · {{fmt(r.data)}}</p>
                </div>
                <span class="badge" [class.badge--confirmada]="r.status === 'confirmada'" [class.badge--recusada]="r.status !== 'confirmada'">
                  {{r.status === 'confirmada' ? 'Aceito ✓' : 'Recusado'}}
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  }
</div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 22px; font-weight: 700; color: #0F172A; }
    .page-sub { font-size: 13px; color: #94A3B8; margin-top: 2px; }

    .invites-container { display: flex; flex-direction: column; gap: 24px; }
    .section-title {
      font-size: 12px; font-weight: 700; color: #64748B;
      text-transform: uppercase; letter-spacing: .05em; margin-bottom: 14px;
    }
    .cards-list { display: flex; flex-direction: column; gap: 16px; }

    .invite-card {
      padding: 24px; border: 2px solid #BFDBFE;
    }
    .invite-card__header {
      display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px;
    }
    .invite-card__title { font-size: 18px; font-weight: 700; color: #0F172A; }
    .invite-card__sub { font-size: 14px; color: #64748B; margin-top: 2px; }

    .details-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px; margin-bottom: 16px;
    }
    .detail-box {
      background: #F8FAFC; border-radius: 12px; padding: 12px 14px;
    }
    .detail-box__key { font-size: 11px; color: #94A3B8; margin-bottom: 3px; font-weight: 500; }
    .detail-box__val { font-size: 13px; font-weight: 600; color: #0F172A; }

    .notes-box {
      background: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 12px;
      padding: 14px 16px; margin-bottom: 18px;
    }
    .notes-box__title { font-size: 11px; font-weight: 600; color: #B45309; margin-bottom: 4px; }
    .notes-box__content { font-size: 13px; color: #92400E; line-height: 1.5; }

    .actions-row { display: flex; gap: 12px; }

    .history-card { padding: 16px 20px; }
    .history-card__inner {
      display: flex; align-items: center; justify-content: space-between;
    }
    .history-card__title { font-size: 14px; font-weight: 600; color: #0F172A; }
    .history-card__sub { font-size: 12px; color: #64748B; margin-top: 2px; }
  `],
})
export class TeacherInvitesComponent {
  constructor(private appState: AppStateService, private router: Router) {}

  get currentTeacher() { return this.appState.currentTeacher; }

  get myInvites(): SubRequest[] {
    return this.appState.requests.filter(
      r => r.professorConvidadoId === this.currentTeacher.id
    );
  }

  get pending(): SubRequest[] {
    return this.myInvites.filter(r => r.status === 'aguardando');
  }

  get others(): SubRequest[] {
    return this.myInvites.filter(r => r.status !== 'aguardando');
  }

  accept(requestId: string) {
    this.appState.acceptInvite(requestId);
  }

  decline(requestId: string) {
    this.appState.declineInvite(requestId);
  }

  fmt(data: string) {
    if (!data) return '—';
    const [y, m, d] = data.split('-');
    return `${d}/${m}/${y}`;
  }
}
