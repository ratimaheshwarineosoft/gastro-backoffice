import { Component } from '@angular/core';

import { environment } from '@env/environment';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthenticationService, PermissionService } from '@app/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import CryptoJS from 'crypto-js';
import { NgxPermissionsService } from 'ngx-permissions';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent {
  version: string | null = environment.version;
  loginForm: FormGroup;
  showPassword = false;
  error: string | null = null;
  isLoading = false;

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _authService: AuthenticationService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private readonly permissionService: PermissionService,
    private rs: NgxPermissionsService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false],
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (this.loginForm.invalid) {
      this.error = 'Please fix the validation errors.';
      return;
    }
    this.isLoading = true;
    const login$ = this._authService.login(this.loginForm.value);
    login$
      .pipe(
        finalize(() => {
          this.loginForm.markAsPristine();
          this.isLoading = false;
        }),
        untilDestroyed(this),
      )
      .subscribe({
        next: (credentials) => {
          const snapshot = this.route.snapshot.queryParams['redirect'];
          let clientId = null;
          if (snapshot) {
            const match = snapshot.match(/^\/client\/(\d+)/);
            if (match) {
              clientId = match[1];
            }
          }
          let { email, id } = JSON.parse(localStorage.getItem('credentials') ?? sessionStorage.getItem('credentials') ?? '{}');
          let key = 'TZCUeUbiUDqdTTrdeVlqxtZ6ieSfVLxmPtKYzNH4';
          id = `${id}`;
          let signedString = CryptoJS.HmacSHA256(id, key);
          let resultSign = CryptoJS.enc.Hex.stringify(signedString);

          this._authService.getUserData().subscribe({
            next: (user: any) => {
              console.log('Intercom boot:', user, credentials, email, id, resultSign);

              (<any>window).Intercom('boot', {
                app_id: window.location.href.includes('kunden.gastro.digital') ? 'u57ft9ay' : 'u57ft9ay',
                email: email,
                user_id: id,
                user_hash: resultSign,
                name: user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : 'Besucher',
                company: {
                  id: id + 10000000,
                  name: credentials.username || 'Firma',
                },
              });
            },
            error: (error) => console.error(error),
          });

          this.permissionService.load(clientId).then(async (permissions) => {
            console.log(permissions, 'List of permissions');
            await this.rs.addPermission(permissions);
            this.router.navigate([snapshot || '/select'], { replaceUrl: true });
          });
        },
        error: (error) => {
          if (error && error.status != 0) {
            this.error = this.translate.instant('Login.Error');
          } else {
            this.error = 'Something went wrong! Please contact administrator.';
          }
        },
      });
  }
}
