import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { take, mergeMap, catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { CredentialsService } from '../../auth';

@Injectable({
  providedIn: 'root',
})
export class ClientResolverService implements Resolve<any> {
  client: any;
  private routeSub: any;

  constructor(
    private http: HttpClient,
    private credentialsService: CredentialsService,
  ) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Observable<never> {
    const cred = this.credentialsService.credentials;
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + cred.token,
    });
    if (route.firstChild) {
      if (route.firstChild.params.hasOwnProperty('clientId')) {
        if (this.client && this.client.id === route.firstChild.params['clientId']) {
          return of(this.client);
        } else {
          return this.http
            .get<any>(environment.serverUrl + `client/` + +route.firstChild.params['clientId'], {
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
    }

    return of(this.client);
  }
}
