import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStateService } from '../../../core/services/app-state.service';
import { Teacher } from '../../../core/models/app.models';

@Component({
  selector: 'app-teacher-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page-content page-enter">
  <button class="back-btn" (click)="go('/instituicao/professores')">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M9.707 4.293a1 1 0 010 1.414L7.414 8l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
    Voltar para busca
  </button>

  @if (!teacher) {
    <div class="card" style="padding:48px;text-align:center">
      <p style="color:#94A3B8">Professor não encontrado.</p>
    </div>
  } @else {
    <div class="profile-grid">
      <!-- Left: main info -->
      <div class="profile-main card">
        <div class="profile-header">
          <div class="profile-avatar" [class]="avatarCls()">{{teacher.initials}}</div>
          <div>
            <div class="profile-name-row">
              <h1 class="profile-name">{{teacher.nome}}</h1>
              @if (teacher.verificado) { <span class="verified">✓ Verificado</span> }
            </div>
            <p class="profile-formacao">{{teacher.formacao}}</p>
            <div class="profile-avail" [class.green]="teacher.disponivel">
              <span class="avail-dot" [class.green]="teacher.disponivel"></span>
              {{teacher.disponivel ? 'Disponível para substituições' : 'Indisponível no momento'}}
            </div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-pill">
            <span class="stat-pill__val">{{teacher.nota}}</span>
            <span class="stat-pill__lbl">Avaliação</span>
          </div>
          <div class="stat-pill">
            <span class="stat-pill__val">{{teacher.experiencia}}</span>
            <span class="stat-pill__lbl">Anos exp.</span>
          </div>
          <div class="stat-pill">
            <span class="stat-pill__val">{{teacher.subs}}</span>
            <span class="stat-pill__lbl">Substituições</span>
          </div>
          <div class="stat-pill">
            <span class="stat-pill__val">{{teacher.distancia}}</span>
            <span class="stat-pill__lbl">Distância</span>
          </div>
        </div>

        <div class="profile-section">
          <h3 class="section-title">Sobre</h3>
          <p class="profile-bio">{{teacher.bio}}</p>
        </div>

        <div class="profile-section">
          <h3 class="section-title">Disciplinas</h3>
          <div class="tags">
            <span class="tag" *ngFor="let d of teacher.disciplinas">{{d}}</span>
          </div>
        </div>

        <div class="profile-section">
          <h3 class="section-title">Níveis de ensino</h3>
          <div class="tags">
            <span class="tag tag--green" *ngFor="let n of teacher.niveis">{{n}}</span>
          </div>
        </div>
      </div>

      <!-- Right: invite -->
      <div class="invite-panel card">
        <h3 class="invite-title">Convidar para substituição</h3>

        @if (openRequests().length === 0) {
          <div class="no-reqs">
            <p>Você não tem solicitações abertas no momento.</p>
            <button class="btn btn--primary btn--block" style="margin-top:12px" (click)="go('/instituicao/solicitar')">Criar solicitação</button>
          </div>
        } @else {
          <p class="invite-label">Selecione a solicitação</p>
          <select class="form-input" [(ngModel)]="selectedId" style="margin-bottom:14px">
            <option value="">Selecione...</option>
            <option *ngFor="let r of openRequests()" [value]="r.id">
              {{r.disciplina}} · {{r.turma || r.nivel}} · {{fmtDate(r.data)}}
            </option>
          </select>

          @if (invited()) {
            <div class="invite-success">✓ Convite enviado! Aguardando resposta do professor.</div>
          } @else {
            <button class="btn btn--primary btn--block" [disabled]="!selectedId || !teacher.disponivel" (click)="sendInvite()">
              {{!teacher.disponivel ? 'Professor indisponível' : !selectedId ? 'Selecione uma solicitação' : 'Enviar convite'}}
            </button>
          }
        }

        <div class="city-info">
          <span>📍</span> {{teacher.cidade}} · {{teacher.distancia}}
        </div>
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    .back-btn { display:flex; align-items:center; gap:6px; font-size:13px; color:#64748B; margin-bottom:20px; &:hover{color:#334155;} }
    .profile-grid { display:grid; grid-template-columns:1fr 300px; gap:24px; align-items:start; }
    @media(max-width:900px) { .profile-grid { grid-template-columns:1fr; } }
    .profile-main { padding:28px; }
    .profile-header { display:flex; gap:18px; align-items:flex-start; margin-bottom:24px; }
    .profile-avatar { width:72px; height:72px; border-radius:20px; font-size:22px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0;
      &.avatar--blue { background:#DBEAFE; color:#1D4ED8; }
      &.avatar--green { background:#D1FAE5; color:#065F46; }
      &.avatar--purple { background:#EDE9FE; color:#5B21B6; }
    }
    .profile-name-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:4px; }
    .profile-name { font-size:22px; font-weight:700; color:#0F172A; }
    .profile-formacao { font-size:13px; color:#94A3B8; margin-bottom:8px; }
    .profile-avail { display:flex; align-items:center; gap:6px; font-size:13px; color:#94A3B8; &.green{color:#16A34A;} }
    .avail-dot { width:7px; height:7px; border-radius:50%; background:#CBD5E1; &.green{background:#4ADE80;} }
    .verified { background:#DBEAFE; color:#1D4ED8; font-size:11px; font-weight:600; padding:3px 9px; border-radius:9999px; }
    .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
    .stat-pill { background:#F8FAFC; border-radius:12px; padding:14px; text-align:center; }
    .stat-pill__val { display:block; font-size:20px; font-weight:700; color:#0F172A; }
    .stat-pill__lbl { display:block; font-size:11px; color:#94A3B8; margin-top:2px; }
    .profile-section { margin-bottom:20px; }
    .section-title { font-size:14px; font-weight:600; color:#0F172A; margin-bottom:10px; }
    .profile-bio { font-size:14px; color:#475569; line-height:1.6; }
    .tags { display:flex; flex-wrap:wrap; gap:8px; }
    .tag { background:#F1F5F9; color:#475569; font-size:13px; padding:5px 12px; border-radius:8px; }
    .tag--green { background:#D1FAE5; color:#065F46; }
    .invite-panel { padding:24px; }
    .invite-title { font-size:16px; font-weight:700; color:#0F172A; margin-bottom:16px; }
    .invite-label { font-size:13px; font-weight:500; color:#475569; margin-bottom:6px; }
    .no-reqs { font-size:13px; color:#94A3B8; }
    .invite-success { background:#D1FAE5; color:#065F46; font-size:13px; font-weight:600; padding:12px 14px; border-radius:10px; border:1px solid #A7F3D0; }
    .city-info { margin-top:16px; font-size:13px; color:#94A3B8; }
  `],
})
export class TeacherDetailComponent implements OnInit {
  teacher: Teacher | undefined;
  selectedId = '';
  invited = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appState: AppStateService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.teacher = this.appState.teachers.find(t => t.id === id);
  }

  openRequests() { return this.appState.requests.filter(r => r.status === 'aberta'); }

  sendInvite() {
    if (!this.selectedId || !this.teacher) return;
    this.appState.inviteTeacher(this.selectedId, this.teacher.id, this.teacher.nome);
    this.invited.set(true);
    setTimeout(() => this.router.navigateByUrl('/instituicao/solicitacoes'), 2000);
  }

  avatarCls() {
    const map: Record<string, string> = { blue: 'avatar--blue', green: 'avatar--green', purple: 'avatar--purple' };
    return `profile-avatar ${map[this.teacher?.cor || 'blue'] || 'avatar--blue'}`;
  }

  fmtDate(data: string) {
    if (!data) return '';
    const [y, m, d] = data.split('-');
    return `${d}/${m}/${y}`;
  }
  go(path: string) { this.router.navigateByUrl(path); }
}
