import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../../core/services/app-state.service';
import { SubRequest } from '../../../core/models/app.models';

@Component({
  selector: 'app-teacher-confirmed',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="page-content page-enter">
  <div class="page-header">
    <h1 class="page-title">Substituições confirmadas</h1>
    <p class="page-sub">Todas as substituições que você confirmou</p>
  </div>

  @if (confirmed.length === 0) {
    <div class="card empty-card">
      <div class="empty-state">
        <div class="empty-state__icon">📅</div>
        <h3 class="empty-state__title">Nenhuma substituição confirmada</h3>
        <p class="empty-state__desc">Aceite convites para ver as substituições confirmadas aqui.</p>
      </div>
    </div>
  } @else {
    <div class="confirmed-list">
      <div class="card confirmed-card" *ngFor="let r of confirmed">
        <div class="confirmed-card__header">
          <div>
            <h3 class="confirmed-card__title">{{r.disciplina}}</h3>
            <p class="confirmed-card__sub">{{r.turma || r.nivel}} · {{r.instituicaoNome}}</p>
          </div>
          <span class="badge badge--confirmada">{{r.status === 'concluida' ? 'Concluída' : '✓ Confirmada'}}</span>
        </div>

        <div class="details-grid">
          <div class="detail-box">
            <p class="detail-box__key">📅 Data</p>
            <p class="detail-box__val">{{fmt(r.data)}}</p>
          </div>
          <div class="detail-box">
            <p class="detail-box__key">🕐 Horário</p>
            <p class="detail-box__val">{{r.horarioInicio}} – {{r.horarioFim}}</p>
          </div>
          <div class="detail-box">
            <p class="detail-box__key">📍 Local</p>
            <p class="detail-box__val">
              {{r.modalidade === 'presencial' ? r.cidade + (r.endereco ? ' (' + r.endereco + ')' : '') : 'Online'}}
            </p>
          </div>
          <div class="detail-box">
            <p class="detail-box__key">💰 Valor</p>
            <p class="detail-box__val">R$ {{r.valor}}</p>
          </div>
        </div>

        @if (r.observacoes) {
          <div class="notes-box">
            <p class="notes-box__title">📝 Observações</p>
            <p class="notes-box__content">{{r.observacoes}}</p>
          </div>
        }
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 22px; font-weight: 700; color: #0F172A; }
    .page-sub { font-size: 13px; color: #94A3B8; margin-top: 2px; }

    .confirmed-list { display: flex; flex-direction: column; gap: 16px; }

    .confirmed-card {
      padding: 24px; border: 1.5px solid #BBF7D0;
    }
    .confirmed-card__header {
      display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px;
    }
    .confirmed-card__title { font-size: 18px; font-weight: 700; color: #0F172A; }
    .confirmed-card__sub { font-size: 14px; color: #64748B; margin-top: 2px; }

    .details-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
    }
    .detail-box {
      background: #F8FAFC; border-radius: 12px; padding: 12px 14px;
    }
    .detail-box__key { font-size: 11px; color: #94A3B8; margin-bottom: 3px; font-weight: 500; }
    .detail-box__val { font-size: 13px; font-weight: 600; color: #0F172A; }

    .notes-box {
      margin-top: 14px; background: #F0FDF4; border: 1px solid #DCFCE7;
      border-radius: 12px; padding: 12px 16px;
    }
    .notes-box__title { font-size: 11px; font-weight: 600; color: #166534; margin-bottom: 3px; }
    .notes-box__content { font-size: 13px; color: #15803D; line-height: 1.5; }
  `],
})
export class TeacherConfirmedComponent {
  constructor(private appState: AppStateService) { void appState.retry(); }

  get currentTeacher() { return this.appState.currentTeacher; }

  get confirmed(): SubRequest[] {
    return this.appState.requests.filter(
      r => ['confirmada','concluida'].includes(r.status) && r.professorConfirmadoId === this.currentTeacher.id
    );
  }

  fmt(data: string) {
    if (!data) return '—';
    const [y, m, d] = data.split('-');
    return `${d}/${m}/${y}`;
  }
}
