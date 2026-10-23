import { LogoMarkComponent } from '../../../core/logo-mark.component';
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AppStateService } from '../../../core/services/app-state.service';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [LogoMarkComponent, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
<div class="app-layout">
  <aside class="sidebar">
    <div class="sidebar__brand">
      <app-logo-mark [size]="32" bg="#2F5D50" />
      <div>
        <span class="sidebar__brand-name">AulaSempre</span>
        <span class="sidebar__brand-role">Professor</span>
      </div>
    </div>

    <nav class="sidebar__nav">
      <a routerLink="/professor/perfil" routerLinkActive="sidebar__link--active" class="sidebar__link"><span class="sidebar__link-label">Meu perfil</span></a>
      <a [routerLink]="'/professor'" routerLinkActive="sidebar__link--active"
        [routerLinkActiveOptions]="{exact:true}" class="sidebar__link">
        <span class="sidebar__link-label">Início</span>
      </a>
      <a [routerLink]="'/professor/convites'" routerLinkActive="sidebar__link--active" class="sidebar__link">
        <span class="sidebar__link-label">Convites</span>
        @if (pendingCount > 0) { <span class="sidebar__badge">{{pendingCount}}</span> }
      </a>
      <a [routerLink]="'/professor/confirmadas'" routerLinkActive="sidebar__link--active" class="sidebar__link">
        <span class="sidebar__link-label">Confirmadas</span>
      </a>
    </nav>

    <div class="sidebar__footer">
      <button class="sidebar__logout" (click)="appState.retry()">Atualizar dados</button>
      <div class="sidebar__user">
        <div class="sidebar__avatar sidebar__avatar--green">{{teacherInitials}}</div>
        <div class="sidebar__user-info">
          <p class="sidebar__user-name">{{teacherName}}</p>
          <p class="sidebar__user-role">Professor</p>
        </div>
      </div>
      <button class="sidebar__logout" (click)="logout()">
        Sair
      </button>
    </div>
  </aside>
  <main class="app-content"><router-outlet /></main>
</div>
  `,
  styles: [`
    .sidebar { width:240px; min-height:100vh; background:#fff; border-right:1px solid var(--color-border); display:flex; flex-direction:column; flex-shrink:0; }
    .sidebar__brand { padding:20px 16px; border-bottom:1px solid var(--color-border-soft); display:flex; align-items:center; gap:10px; }
    .sidebar__logo { width:32px; height:32px; background:var(--color-success); border-radius:4px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .sidebar__brand-name { display:block; font-family:'Source Serif 4', Georgia, serif; font-size:15px; font-weight:600; color:var(--color-primary); line-height:1.2; }
    .sidebar__brand-role { display:block; font-size:11px; color:var(--color-text-muted); }
    .sidebar__nav { flex:1; padding:12px 8px; display:flex; flex-direction:column; gap:2px; }
    .sidebar__link { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:4px; font-size:13px; font-weight:500; color:var(--color-text-secondary); transition:all .15s; text-decoration:none;
      &:hover { background:var(--color-bg); color:var(--color-primary); }
      &--active { background:var(--color-success-light) !important; color:var(--color-success) !important; font-weight:600; box-shadow: inset 2px 0 0 var(--color-success); }
    }
    .sidebar__link-label { flex:1; }
    .sidebar__badge { background:var(--color-warning); color:#fff; font-size:10px; font-weight:700; border-radius:9999px; width:18px; height:18px; display:flex; align-items:center; justify-content:center; }
    .sidebar__footer { padding:12px 8px; border-top:1px solid var(--color-border-soft); }
    .sidebar__user { display:flex; align-items:center; gap:10px; padding:8px 12px; margin-bottom:4px; }
    .sidebar__avatar { width:32px; height:32px; border-radius:50%; background:var(--color-primary-light); color:var(--color-primary); font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid var(--color-primary-muted);
      &--green { background:var(--color-success-light); color:var(--color-success); border-color:var(--color-success-border); }
    }
    .sidebar__user-name { font-size:13px; font-weight:600; color:var(--color-primary); }
    .sidebar__user-role { font-size:11px; color:var(--color-text-muted); }
    .sidebar__logout { display:flex; align-items:center; gap:8px; width:100%; padding:8px 12px; border-radius:4px; font-size:13px; color:var(--color-text-soft); transition:all .15s;
      &:hover { background:var(--color-danger-light); color:var(--color-danger); }
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
