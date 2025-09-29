import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, map, Observable, of } from 'rxjs';

import { CredentialsService } from '@app/auth';
import { Credentials } from '@core/entities';
import { environment } from '@env/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

export interface LoginContext {
  email: string;
  password: string;
  remember?: boolean;
  isMobile?: boolean;
}

/**
 * Provides a base for authentication workflow.
 * The login/logout methods should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  clients: any;
  client: any;
  clientSource = new BehaviorSubject('');
  activeClient = this.clientSource.asObservable();
  activeClientId: number;

  constructor(
    private readonly _credentialsService: CredentialsService,
    private http: HttpClient,
    private router: Router,
  ) {}

  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
  login(context: LoginContext): Observable<any> {
    const email = context.email;
    const password = context.password;
    const remember = context.remember;
    return this.http.post<any>(environment.serverUrl + `public/login`, { email, password, remember }).pipe(
      map((response: any) => {
        // login successful if there's a jwt token in the response
        if (response && response.token) {
          const credentials = {
            token: response.token,
            email: response.user.email,
            id: response.user.id,
            language: response.user.lang || 'GER',
            role: response.user.admin && response.user.admin.type === 'superAdmin' ? 'admin' : 'user',
            memberSince: response.user.memberSince,
          };
          this._credentialsService.setCredentials(credentials, context.remember);
        }
        return of(response);
      }),
    );
  }

  setActiveClientId(clientId: number) {
    this.activeClientId = clientId;
  }

  getActiveClient() {
    return this.getClient(this.activeClientId);
  }

  changeActiveClient(client: any) {
    this.clientSource.next(client);
  }

  getClient(clientId: number, refreshData: boolean = false): Observable<any> {
    const cred = this._credentialsService.credentials;
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + cred.token,
    });

    if (this.client && this.client.id === clientId && !refreshData) {
      return of(this.client);
    } else {
      return this.http
        .get<any>(environment.serverUrl + `client/` + clientId, {
          headers: headers,
        })
        .pipe(
          map((client: any) => {
            this.client = client;
            return client;
          }),
        );
    }
  }

  getClientResSettings(clientId: any): Observable<any> {
    const cred = this._credentialsService.credentials;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + cred.token,
    });
    return this.http
      .get<any>(environment.serverUrl + `reservation/client-res-settings/` + clientId, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          return response;
        }),
      );
  }

  /**
   * Logs out the user and clear credentials.
   * @return True if the user was logged out successfully.
   */
  logout(): Observable<any> {
    sessionStorage.removeItem('credentials');
    localStorage.removeItem('credentials');
    this._credentialsService.setCredentials(null);
    console.log('Clear');
    return of(true);
  }

  getUserData(): Observable<any> {
    const cred = this._credentialsService.credentials;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + cred.token,
    });
    return this.http
      .get<any>(environment.serverUrl + `private/user/` + cred.id, {
        headers: headers,
      })
      .pipe(
        map((user: any) => {
          return user;
        }),
      );
  }

  getClients(refreshData: boolean = false): Observable<any> {
    if (this.clients && !refreshData) {
      return of(this.clients);
    } else {
      const cred = this._credentialsService.credentials;
      if (!cred || !cred.token) {
        this.router.navigate(['/login']);
        return EMPTY;
      }
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + cred.token,
      });
      return this.http
        .get<any>(environment.serverUrl + `private/clients/` + cred.id, {
          headers: headers,
        })
        .pipe(
          map((clientList: any) => {
            this.clients = clientList;
            return clientList;
          }),
        );
    }
  }

  getUserStatus(): Observable<any> {
    const cred = this._credentialsService.credentials;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + cred.token,
    });
    return this.http
      .get<any>(environment.serverUrl + `private/user-status/` + cred.id, {
        headers: headers,
      })
      .pipe(
        map((user: any) => {
          return user;
        }),
      );
  }
}
