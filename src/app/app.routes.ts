import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    loadComponent: () => import('./features/pokemon/pages/list/list.page').then( m => m.ListPage)
  },
  {
    path: 'details/:id',                               // ⬅️ incluído :id
    loadComponent: () =>
      import('./features/pokemon/pages/details/details.page')
        .then(m => m.DetailsPage)
  },
];
