import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/auth';
import { TranslateService } from '@ngx-translate/core';
import { interval, Subject, Subscription } from 'rxjs';
import CryptoJS from 'crypto-js';

@Component({
  selector: 'app-client-selection',
  templateUrl: './client-selection.component.html',
  styleUrls: ['./client-selection.component.scss'],
  standalone: false,
})
export class ClientSelectionComponent {
  clients: any;
  isUserBlocked: boolean = false;
  isEmailVerified: boolean = false;
  userEmail: string = '';
  mailRetryCount: number = 0;
  lastAttempt: Date | null = null;
  remainingSeconds = 0;
  isButtonDisabled = false;
  private timerSub!: Subscription;
  isLoading: boolean = false;
  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    public translate: TranslateService,
  ) {}

  ngOnInit() {
    this.checkUserStatus();
    this.getClients();
  }

  ngOnDestroy(): any {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
    if (this.timerSub) this.timerSub.unsubscribe();
  }

  getClients() {
    this.authService.getClients(true).subscribe(
      (res) => {
        this.clients = res.clients;
      },
      (error) => {},
    );
  }

  checkUserStatus() {
    this.isLoading = true;
    this.authService.getUserStatus().subscribe(
      (res) => {
        const { user, isEmailVerified, email, mailRetryCount, lastAttempt } = res;
        this.isUserBlocked = user ? true : false;
        this.isEmailVerified = isEmailVerified ? true : false;
        this.userEmail = email || '';
        this.mailRetryCount = mailRetryCount;
        this.lastAttempt = lastAttempt;
        this.isLoading = false;
        this.checkResendCooldown();
      },
      (error) => {
        this.isLoading = false;
      },
    );
  }

  resendVerificationEMail() {
    // if (this.mailRetryCount >= 3) {
    //   // return this.snackBar.open('Email Limit Exceeded', '', {
    //   //   duration: 2000,
    //   //   panelClass: ['snackbar-error'],
    //   // });
    // }
    // this.authService
    //   .resendVerificationEmail()
    //   .takeUntil(this.ngUnsubscribe)
    //   .subscribe(
    //     (res) => {
    //       const { message, mailRetryCount, lastAttempt } = res;
    //       this.mailRetryCount = mailRetryCount;
    //       this.lastAttempt = lastAttempt;
    //       this.checkResendCooldown();
    //       // this.snackBar.open(message || '', '', {
    //       //   duration: 2000,
    //       //   panelClass: ['snackbar-success'],
    //       // });
    //     },
    //     (error) => {
    //       // this.snackBar.open('Something went wrong, Please contact administrator.', '', {
    //       //   duration: 2000,
    //       //   panelClass: ['snackbar-error'],
    //       // });
    //     },
    //   );
  }

  openClientDashboard(clientId: number, client: any = null) {
    const credentials = JSON.parse(localStorage.getItem('credentials') ?? sessionStorage.getItem('credentials') ?? '{}');
    const email = credentials.email;
    let id = credentials.id;
    console.log(email, id);
    let key = 'TZCUeUbiUDqdTTrdeVlqxtZ6ieSfVLxmPtKYzNH4'; // live
    id = `${id}`;
    let signedString = CryptoJS.HmacSHA256(id, key);
    let resultSign = CryptoJS.enc.Hex.stringify(signedString);

    this.authService.getUserData().subscribe({
      next: (user: any) => {
        console.log(71, 'selecting', user, email, id, resultSign, client);
        let intercomUser = {
          app_id: window.location.href.includes('kunden.gastro.digital') ? 'u57ft9ay' : 'u57ft9ay',
          email: email,
          user_id: id,
          user_hash: resultSign,
          name: user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : 'Besucher',

          company: {
            id: client.id,
            name: client.name || 'Firma',
          },
        };
        (<any>window).Intercom('boot', intercomUser);
        console.log(85, 'select intercom', intercomUser, user);
      },
      error: (error) => {
        console.error(91, error);
      },
    });

    this.router.navigate(['/client', clientId, 'dashboard']);
    this.getPermissions(clientId);
  }

  getPermissions(clientId: number) {
    // this.initPermissionService.load(clientId).then((permissions) => this.permissionsService.addPermission(permissions));
  }

  addNewClient() {
    const { id } = JSON.parse(localStorage.getItem('credentials'));
    // this.newCompanyService.getDraftData({ userId: id }).subscribe((response: any) => {
    //   if (response && response.length) {
    //     this.router.navigate(['/select-from-draft']);
    //   } else {
    //     this.router.navigate(['new-client']);
    //   }
    // });
  }

  editEmail() {
    // let newEmail = '';
    // const modalRef = this.modalService.open(EditEmailModalComponent);
    // modalRef.componentInstance.title = `Edit Email`;
    // modalRef.componentInstance.email = this.userEmail;
    // modalRef.componentInstance.buttonText = 'Ja';
    // modalRef.result.then(
    //   (result) => {
    //     if (result) {
    //       const { data } = result;
    //       console.log('Result', result);
    //       newEmail = data || '';
    //       console.log(newEmail);
    //       if (newEmail !== this.userEmail) {
    //         this.authService
    //           .updateUserEmail(newEmail)
    //           .takeUntil(this.ngUnsubscribe)
    //           .subscribe(
    //             (res) => {
    //               const { message, email } = res;
    //               this.userEmail = email;
    //               this.snackBar.open(message || '', '', {
    //                 duration: 2000,
    //                 panelClass: ['snackbar-success'],
    //               });
    //             },
    //             (error) => {
    //               this.snackBar.open(error.error.message || 'Something went wrong', '', {
    //                 duration: 2000,
    //                 panelClass: ['snackbar-error'],
    //               });
    //             },
    //           );
    //       }
    //     }
    //   },
    //   () => {},
    // );
    // console.log('newEmail', newEmail);
  }

  checkResendCooldown() {
    if (!this.lastAttempt) return;
    const now = new Date().getTime();
    console.log('Current Date', new Date());
    console.log('Current Time', now);
    console.log(this.lastAttempt);
    const last = new Date(this.lastAttempt).getTime();
    console.log('Last Time', last);
    const elapsed = (now - last) / 1000;

    if (elapsed < 119) {
      console.log('elapsed', elapsed);
      console.log('Math.floor(elapsed)', Math.floor(elapsed));
      this.remainingSeconds = 119 - Math.floor(elapsed);
      this.isButtonDisabled = true;
      console.log('remaining Time', this.remainingSeconds);

      this.timerSub = interval(1000).subscribe(() => {
        this.remainingSeconds--;
        if (this.remainingSeconds <= 0) {
          this.isButtonDisabled = false;
          this.timerSub.unsubscribe();
        }
      });
    }
  }
}
