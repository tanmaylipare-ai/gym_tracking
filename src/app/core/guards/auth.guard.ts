import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const router  = inject(Router);

  if (storage.getAccessToken()) return true;
  return router.createUrlTree(['/login']);
};

export const noAuthGuard: CanActivateFn = () => {
  const storage = inject(StorageService);
  const router  = inject(Router);

  if (!storage.getAccessToken()) return true;
  return router.createUrlTree(['/workout']);
};
