import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from './services/app-state.service';
export const roleGuard: CanActivateFn = route => {
  const state = inject(AppStateService), router = inject(Router);
  if (!state.api.isAuthenticated && !state.demo()) return router.createUrlTree(['/entrar']);
  if (state.role !== route.data['role']) return router.createUrlTree([state.role === 'professor' ? '/professor' : '/instituicao']);
  return true;
};
