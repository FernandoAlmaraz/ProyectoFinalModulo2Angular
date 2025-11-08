import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home'), 
    },
    {
        path: 'stock',
        loadComponent: () => import('./pages/reactive-products-list/reactive-products-list'), 
    },
    {
        path: 'agregar',
        loadComponent: () => import('./pages/reactive-add-products/reactive-add-products'), 
    },
    {
        path: 'editar/:id',
        loadComponent: () => import('./pages/reactive-edit-products/reactive-edit-products'), 
    },
    {
        path: '**',
        redirectTo: ''
    }
];