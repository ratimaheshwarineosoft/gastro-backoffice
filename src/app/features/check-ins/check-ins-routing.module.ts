import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: 'check-in-list', loadComponent: () => import('./pages/check-in-list/check-in-list.component').then((m) => m.CheckInListComponent) }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CheckInsRoutingModule {}
