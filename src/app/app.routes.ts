import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'gallery',
    loadComponent: () => import('./gallery/gallery.page').then(m => m.GalleryPage),
  },
  { path: '', redirectTo: 'gallery', pathMatch: 'full' },
];