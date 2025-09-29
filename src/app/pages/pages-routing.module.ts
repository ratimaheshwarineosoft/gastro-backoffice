import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientResolverService } from '@app/shared/resolvers/client.resolver';
import { Shell } from '@app/shell/services/shell.service';
import { DashboardComponent } from '@pages/dashboard/dashboard.component';
import { OpeningHoursComponent } from './opening-hours/opening-hours.component';
import { AddOpeningHoursComponent } from './add-opening-hours/add-opening-hours.component';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'client/:clientId/dashboard',
      component: DashboardComponent,
      data: {
        title: 'Dashboard',
      },
      resolve: {
        client: ClientResolverService,
      },
    },
    {
      path: 'client/:clientId/opening-hours',
      component: OpeningHoursComponent,
      data: {
        title: 'Opening Hour',
      },
      resolve: {
        client: ClientResolverService,
      },
    },
    {
      path: 'client/:clientId/add-opening-hours',
      component: AddOpeningHoursComponent,
      data: {
        title: 'Add Opening Hours',
      },
      resolve: {
        client: ClientResolverService,
      },
    },
    {
      path: 'users',
      loadChildren: () => import('./users/users.module').then((m) => m.UsersModule),
    },
    // Fallback when no prior route is matched
    { path: '**', redirectTo: 'client/:clientId/dashboard', pathMatch: 'full' },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
