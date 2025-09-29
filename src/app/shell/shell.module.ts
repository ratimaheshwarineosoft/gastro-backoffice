import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { AuthModule } from '@app/auth';
import { ShellComponent } from './shell.component';
import { HumanizePipe } from '@shared/pipes';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '@app/shell/components/sidebar/sidebar.component';
import { HeaderComponent } from '@app/shell/components/header/header.component';
import { PagesModule } from '@pages/pages.module';
import { LanguageSelectorComponent } from '@app/i18n';
import { AdministrationModule } from '@app/features/administration/administration.module';
import { AdministrationRoutingModule } from '@app/features/administration/administration-routing.module';
import { SelectClientModule } from '@app/features/select-client/select-client.module';
import { LoadingComponent } from '@app/shared/components/loading/loading.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    AuthModule,
    SelectClientModule,
    RouterModule,
    HumanizePipe,
    FormsModule,
    PagesModule,
    LanguageSelectorComponent,
    AdministrationRoutingModule,
    LoadingComponent,
  ],
  declarations: [ShellComponent, HeaderComponent, SidebarComponent],
})
export class ShellModule {}
