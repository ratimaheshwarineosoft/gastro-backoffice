import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'germanDate',
  standalone: true,
})
export class GermanDatePipe implements PipeTransform {
  transform(value: string): string {
    const [d, m, y] = value.split('/').map(Number);
    const dateObj = new Date(y, m - 1, d);

    return dateObj.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
