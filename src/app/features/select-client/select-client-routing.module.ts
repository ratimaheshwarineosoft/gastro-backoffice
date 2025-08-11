import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: 'client-selection', loadComponent: () => import('./pages/client-selection/client-selection.component').then((m) => m.ClientSelectionComponent) }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectClientRoutingModule {}
