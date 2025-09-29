import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientSelectionComponent } from './pages/client-selection/client-selection.component';
import { marker } from '@colsen1991/ngx-translate-extract-marker';
import { AlreadyLoggedCheckGuard, AuthenticationGuard } from '@app/auth';

const routes: Routes = [{ path: 'select', component: ClientSelectionComponent, canActivate: [AuthenticationGuard], data: { title: marker('Eintrag auswählen | GastroDigital') } }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectClientRoutingModule {}
