import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { OpeningHoursComponent } from './opening-hours/opening-hours.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AddOpeningHoursComponent } from './add-opening-hours/add-opening-hours.component';
import { TranslateModule } from '@ngx-translate/core';
import { GermanDatePipe } from '@app/shared/pipes/german-date.pipe';

@NgModule({
  declarations: [OpeningHoursComponent, AddOpeningHoursComponent],
  imports: [CommonModule, PagesRoutingModule, ReactiveFormsModule, FormsModule, NgxDaterangepickerMd, TranslateModule, GermanDatePipe],
})
export class PagesModule {}
