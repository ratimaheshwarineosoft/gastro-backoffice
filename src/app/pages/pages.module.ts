import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { OpeningHoursComponent } from './opening-hours/opening-hours.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AddOpeningHoursComponent } from './add-opening-hours/add-opening-hours.component';

@NgModule({
  declarations: [OpeningHoursComponent, AddOpeningHoursComponent],
  imports: [CommonModule, PagesRoutingModule, ReactiveFormsModule, FormsModule, NgxDaterangepickerMd],
})
export class PagesModule {}
