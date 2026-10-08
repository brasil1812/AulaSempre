import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AppStateService } from '../../../core/services/app-state.service';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
<div class="app-layout">
  <aside class="sidebar">
    <div class="sidebar__brand">
      <div class="sidebar__logo">
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" fill="white"/>
        </svg>
      </div>
      <div>
        <span class="sidebar__brand-name">AulaSempre</span>
        <span class="sidebar__brand-role">Professor</span>
      </div>
    </div>

    <nav class="sidebar__nav">
      <a routerLink="/professor/perfil" routerLinkActive="sidebar__link--active" class="sidebar__link"><span>👤</span><span class="sidebar__link-label">Meu perfil</span></a>
      <a [routerLink]="'/professor'" routerLinkActive="sidebar__link--active"
        [routerLinkActiveOptions]="{exact:true}" class="sidebar__link">
        <span class="sidebar__link-icon">🏠</span>
        <span class="sidebar__link-label">Início</span>
      </a>
      <a [routerLink]="'/professor/convites'" routerLinkActive="sidebar__link--active" class="sidebar__link">
        <span class="sidebar__link-icon">✉️</span>
        <span class="sidebar__link-label">Convites</span>
        @if (pendingCount > 0) { <span class="sidebar__badge">{{pendingCount}}</span> }
      </a>
      <a [routerLink]="'/professor/confirmadas'" routerLinkActive="sidebar__link--active" class="sidebar__link">
        <span class="sidebar__link-icon">✅</span>
        <span class="sidebar__link-label">Confirmadas</span>
      </a>
    </nav>

    <div class="sidebar__footer">
      <button class="sidebar__logout" (click)="appState.retry()">↻ Atualizar dados</button>
      <div class="sidebar__user">
        <div class="sidebar__avatar sidebar__avatar--green">{{teacherInitials}}</div>
        <div class="sidebar__user-info">
          <p class="sidebar__user-name">{{teacherName}}</p>
          <p class="sidebar__user-role">Professor</p>
        </div>
      </div>
      <button class="sidebar__logout" (click)="logout()">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v8a1 1 0 001 1h4a1 1 0 000-2H4V5h3a1 1 0 000-2H3zm9.293 1.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L13.586 8l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M7 8a1 1 0 011-1h7a1 1 0 010 2H8a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
        Sair
      </button>
    </div>
  </aside>
  <main class="app-content"><router-outlet /></main>
</div>
  `,
  styles: [`
    .sidebar { width:240px; min-height:100vh; background:#fff; border-right:1px solid #E2E8F0; display:flex; flex-direction:column; flex-shrink:0; box-shadow:1px 0 4px rgba(0,0,0,.04); }
    .sidebar__brand { padding:20px 16px; border-bottom:1px solid #F1F5F9; display:flex; align-items:center; gap:10px; }
    .sidebar__logo { width:32px; height:32px; background:#2563EB; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 2px 6px rgba(37,99,235,.3); }
    .sidebar__brand-name { display:block; font-size:14px; font-weight:700; color:#0F172A; line-height:1.2; }
    .sidebar__brand-role { display:block; font-size:11px; color:#94A3B8; }
    .sidebar__nav { flex:1; padding:12px 8px; display:flex; flex-direction:column; gap:2px; }
    .sidebar__link { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:9px; font-size:13px; font-weight:500; color:#475569; transition:all .15s; text-decoration:none;
      &:hover { background:#F8FAFC; color:#0F172A; }
      &--active { background:#EFF6FF !important; color:#2563EB !important; font-weight:600; }
    }
    .sidebar__link-icon { font-size:16px; line-height:1; width:18px; text-align:center; }
    .sidebar__link-label { flex:1; }
    .sidebar__badge { background:#2563EB; color:#fff; font-size:10px; font-weight:700; border-radius:9999px; width:18px; height:18px; display:flex; align-items:center; justify-content:center; }
    .sidebar__footer { padding:12px 8px; border-top:1px solid #F1F5F9; }
    .sidebar__user { display:flex; align-items:center; gap:10px; padding:8px 12px; margin-bottom:4px; }
    .sidebar__avatar { width:32px; height:32px; border-radius:50%; background:#DBEAFE; color:#1D4ED8; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0;
      &--green { background:#D1FAE5; color:#065F46; }
    }
    .sidebar__user-name { font-size:13px; font-weight:600; color:#0F172A; }
    .sidebar__user-role { font-size:11px; color:#94A3B8; }
    .sidebar__logout { display:flex; align-items:center; gap:8px; width:100%; padding:8px 12px; border-radius:9px; font-size:13px; color:#64748B; transition:all .15s;
      &:hover { background:#FEF2F2; color:#DC2626; }
    }
  `],
})
export class TeacherLayoutComponent {
  constructor(private router: Router, public appState: AppStateService) {}

  get teacherName() { return this.appState.currentTeacher.nome; }
  get teacherInitials() { return this.appState.currentTeacher.initials; }
  get pendingCount() {
    return this.appState.requests.filter(r =>
      r.status === 'aguardando' && r.professorConvidadoId === this.appState.currentTeacher.id
    ).length;
  }
  logout() { this.appState.logout(); this.router.navigateByUrl('/'); }
}
