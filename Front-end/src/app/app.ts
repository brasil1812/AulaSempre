import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AppStateService } from './core/services/app-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    @if (state.demo()) { <div class="app-notice">Demonstração com dados fictícios. <button (click)="exitDemo()">Entrar com uma conta</button></div> }
    @if (state.loading()) { <div class="app-notice" role="status">Carregando dados…</div> }
    @if (state.error()) { <div class="app-notice app-notice--error" role="alert">{{state.error()}} <button (click)="state.retry()">Atualizar</button></div> }
    <router-outlet />`,
  styles: [`.app-notice {padding:12px 20px;background:#EFF6FF;color:#1E40AF;font-size:14px}.app-notice button {margin-left:12px;text-decoration:underline}.app-notice--error {background:#FEF2F2;color:#991B1B}`],
})
export class App {
  constructor(public state: AppStateService, private router: Router) {
    window.addEventListener('aulasempre-session-expired', () => { void this.router.navigateByUrl('/entrar'); });
  }
  exitDemo() { this.state.logout(); void this.router.navigateByUrl('/entrar'); }
}
