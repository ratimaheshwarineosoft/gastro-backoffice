import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectClientRoutingModule } from './select-client-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { AuthRouting } from '@app/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LanguageSelectorComponent } from '@app/i18n';
import { ClientSelectionComponent } from './pages/client-selection/client-selection.component';

@NgModule({
  declarations: [ClientSelectionComponent],
  imports: [CommonModule, SelectClientRoutingModule, ReactiveFormsModule, TranslateModule, AuthRouting, FormsModule, LanguageSelectorComponent],
  exports: [ClientSelectionComponent],
})
export class SelectClientModule {}
