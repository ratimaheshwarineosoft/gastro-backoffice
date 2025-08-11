import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'reservation-list', loadComponent: () => import('./pages/reservation-list/reservation-list.component').then((m) => m.ReservationListComponent) },
  { path: 'reservation-settings', loadComponent: () => import('./pages/reservation-settings/reservation-settings.component').then((m) => m.ReservationSettingsComponent) },
  { path: 'reservation-log', loadComponent: () => import('./pages/reservation-log/reservation-log.component').then((m) => m.ReservationLogComponent) },
  { path: 'reservation-statistics', loadComponent: () => import('./pages/reservation-statistics/reservation-statistics.component').then((m) => m.ReservationStatisticsComponent) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReservationsRoutingModule {}
