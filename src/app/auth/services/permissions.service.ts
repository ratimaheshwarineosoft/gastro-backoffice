import { Injectable } from '@angular/core';
import { CredentialsService, PERMISSIONS, ROLE } from '@app/auth';
import { Credentials } from '@core/entities';
import { appSetting } from '@core/constants';
import { environment } from '@env/environment';
import { EMPTY, map } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(
    private credentialsService: CredentialsService,
    private http: HttpClient,
  ) {}

  load(clientId: number | null = null): Promise<any> {
    if (!clientId) {
      const match = window.location.pathname.match(/^\/client\/(\d+)/);
      if (match && match.length > 1) {
        clientId = +match[1]; // reuse captured ID
      }
    }

    if (!clientId) {
      return Promise.resolve(null); // ✅ instead of resolve()
    }

    const cred = this.credentialsService.credentials;

    if (!cred) {
      // Credentials not found
      return Promise.resolve(null); // ✅ always return a Promise
    }

    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + cred.token,
    });

    if (this.credentialsService.isAdmin()) {
      return Promise.resolve('admin'); // ✅ simplified
    }

    return this.http
      .get<any>(`${environment.serverUrl}private/moderators/check/${clientId}/${cred.id}`, { headers })
      .pipe(
        map((response: any) => {
          if (response) {
            return this.http.get<any>(`${environment.serverUrl}private/moderators/permissions/${clientId}/${cred.id}`, { headers }).toPromise();
          } else {
            return Promise.resolve('admin');
          }
        }),
      )
      .toPromise();
  }
}
