import { Component, OnInit } from '@angular/core';
import { ShellService } from '@app/shell/services/shell.service';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthenticationService } from '@app/auth';

@UntilDestroy()
@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  standalone: false,
})
export class ShellComponent implements OnInit {
  isSidebarActive = false;
  clientId: number;
  userData: any;
  activeClient: any;
  private routeSub: any;
  params: any;
  isNewClient: boolean = true;
  userClients: any = [];

  constructor(
    private readonly _shellService: ShellService,
    private readonly _router: Router,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
  ) {
    router.events.subscribe((val: any) => {
      if (!(val instanceof NavigationEnd)) {
        return;
      }
    });

    // this.refreshToken();
    this.getUserData();
    this.getActiveClient();

    this.authService.activeClient.subscribe((client) => {
      this.activeClient = client;
    });
  }

  ngOnInit() {
    // this._socketService.connect();
    this.getUserClients();
  }

  sidebarToggle(toggleState: boolean) {
    this.isSidebarActive = toggleState;
  }

  getClientUrl(clientId: number): string {
    return this.router.url.replace(String(this.activeClient?.id), String(clientId));
  }

  logout() {
    this.authService.logout().subscribe({
      next: (data) => {
        console.log('Logged out & storage cleared', data);
        // Redirect to login page
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);
      },
    });
  }

  getUserData() {
    console.log('API Call');
    this.authService.getUserData().subscribe({
      next: (user) => {
        console.log('Call User API', user);
        if (user && Object.keys(user).length) {
          this.userData = user;
          console.log('userdata', this.userData);
        } else {
          this.logout();
        }
      },
      error: (err) => console.error(err),
    });
  }

  getUserClients() {
    this.authService.getClients().subscribe(
      (res) => {
        this.userClients = res.clients;
        console.log(this.userClients);
      },
      (error) => {},
    );
  }

  private _reloadCurrentRoute(path?: string) {
    const currentUrl = path || this._router.url;
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this._router.navigate([currentUrl]);
    });
  }

  getActiveClient() {
    if (this.route.firstChild) {
      this.routeSub = this.route.firstChild.params.subscribe((params: any) => {
        if (params.hasOwnProperty('clientId') !== '') {
          this.params = params;
          this.clientId = +params.clientId;
          this.authService.setActiveClientId(+params.clientId);
          this.authService.getClient(+params.clientId).subscribe(
            (res) => {
              this.authService.changeActiveClient(res);
              // Change title
              // this.titleService.setTitle(this.titleService.getTitle() + ' | ' + res.name);
            },
            (error) => {
              console.log(error);
              // User has no permission to access client
              if (error.status === 403) {
                this.router.navigateByUrl('/403', { skipLocationChange: true });
              }
              if (error.status === 404) {
                this.router.navigateByUrl('/404', { skipLocationChange: true });
              }
            },
          );
          /*Get Client Res Settings*/
          this.authService.getClientResSettings(this.clientId).subscribe((data: any) => {
            if (data && Object.keys(data).length > 0) {
              this.isNewClient = false;
            }
            // this.setNavGroups(params);
          });
        } else {
          this.router.navigate(['/select']);
        }
      });
    } else {
      this.router.navigate(['/select']);
    }
  }
}
