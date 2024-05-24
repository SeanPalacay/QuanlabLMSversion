import { forwardRef, Inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { MeetingService } from './meeting.service';
import { MessagingService } from './messaging.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  public usedStorage = this.isLocalStorage() ? localStorage : sessionStorage;
  private socket: WebSocket;
  online = true;

  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    private router: Router,
    private meetingService: MeetingService,
    private messagingService: MessagingService
  ) {
    this.socket = new WebSocket(environment.socket);
    this.socket.binaryType = 'arraybuffer';
  }

  updateLastSeen() {
    if (!this.userService.isLoggedIn()) return;
    var tzoffset = new Date().getTimezoneOffset() * 60000;
    var localISOTime = new Date(Date.now() - tzoffset).toISOString();

    const id = this.userService.getUserData().id;
    const userType = this.userService.getUserType();

    const postObject = {
      tables:
        userType === '2'
          ? 'administrators'
          : userType === '1'
          ? 'teachers'
          : 'students',
      values: {
        LastSeen: localISOTime.slice(0, 19).replace('T', ' '),
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };

    this.post('update_entry', { data: JSON.stringify(postObject) }).subscribe(
      () => {},
      (error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            this.goOffline();
          }
        }
      }
    );
  }

  parseDate(date: string) {
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  parseDateTime(date: string) {
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  parseTime(date: string) {
    const dateObject = new Date(date);
    return dateObject.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  parseDateFromNow(date: string) {
    const timepassed = new Date().getTime() - new Date(date).getTime();
    const seconds = timepassed / 1000;
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return days === 1 ? '1 day ago' : `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    return 'A long time ago';
  }

  failedSnackbar(message: string, timer?: number) {
    var time = 3000;
    if (timer !== undefined) {
      time = timer!;
    }
    this.snackBar.open(message, 'Dismiss', {
      duration: time,
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
      panelClass: 'default-snackbar-error',
    });
  }

  successSnackbar(message: string, timer?: number) {
    var time = 3000;
    if (timer !== undefined) {
      time = timer!;
    }
    this.snackBar.open(message, 'Dismiss', {
      duration: time,
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
      panelClass: 'default-snackbar-success',
    });
  }

  showSnackbar(
    message: string,
    action: string = 'Close',
    duration: number = 3000
  ) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }

  justSnackbar(message: string, timer?: number) {
    var time = 3000;
    if (timer !== undefined) {
      time = timer!;
    }
    this.snackBar.open(message, 'Dismiss', {
      duration: time,
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
      panelClass: 'default-snackbar',
    });
  }

  post(method: string, body: {}) {
    for (var [key, obj] of Object.entries<any>(body)) {
      if (key === 'values') {
        for (var [field, value] of Object.entries(obj)) {
          obj[field] = value ?? '';
        }
      }
    }
    const headers = new HttpHeaders({
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
    });
    const salt = new Date().getTime();
    return this.http.post<any>(
      environment.api + '?' + salt,
      JSON.stringify(
        Object.assign(
          {
            API_KEY: environment.apiKey,
            Method: method,
          },
          body
        )
      ),
      { headers }
    );
  }

  localPost(method: string, body: {}) {
    for (var [key, obj] of Object.entries<any>(body)) {
      if (key === 'values') {
        for (var [field, value] of Object.entries(obj)) {
          obj[field] = value ?? '';
        }
      }
    }
    const headers = new HttpHeaders({
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
    });
    const salt = new Date().getTime();
    return this.http.post<any>(
      `${environment.localServer}:85/api.php?${salt}`,
      JSON.stringify(
        Object.assign(
          {
            API_KEY: environment.apiKey,
            Method: method,
          },
          body
        )
      ),
      { headers }
    );
  }

  socketSend(data: object) {
    this.socket.send(
      JSON.stringify({ key: environment.socketKey, data: data })
    );
  }

  setMeetPermissions(cam: boolean, mic: boolean) {
    // Implementation of the setMeetPermissions method
  }

  joinMeet() {
    // Implementation of the joinMeet method
  }

  resetMeetOptions() {
    // Implementation of the resetMeetOptions method
  }

  escapeHtml(input: string) {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  getCNSCPresident() {
    const postObject = {
      selectors: ['*'],
      tables: 'administrators',
      conditions: {
        WHERE: {
          Role: 'CNSC President',
        },
      },
    };

    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  checkInputs(inputs: Array<any>) {
    for (let input of inputs) {
      if (input === '' || input === undefined || input === null) {
        return false;
      }
    }
    return true;
  }

  checkAtLeastOneInput(inputs: Array<any>) {
    for (let input of inputs) {
      if (input !== '' && input !== undefined && input !== null) {
        return true;
      }
    }
    return false;
  }

  convertToTimeZone(date: Date, timeZone: string): Date {
    const targetOffset = new Date(
      date.toLocaleString('en-US', { timeZone })
    ).getTimezoneOffset();
    const localOffset = date.getTimezoneOffset();
    const offsetDiff = localOffset - targetOffset;

    return new Date(date.getTime() + offsetDiff * 60000);
  }

  goOffline() {
    this.online = false;
    this.hideLoader();
    if (this.userService.getUserType() != '0') return;
    Swal.fire({
      title: 'No Internet? No Problem!',
      text: 'Your modules are automatically downloaded for offline viewing!',
      icon: 'info',
      confirmButtonColor: '0172AF',
      cancelButtonColor: '#7F7F7F',
      showCancelButton: true,
      confirmButtonText: 'Proceed!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.value) {
        this.router.navigate(['/modules']);
      }
    });
  }

  isLocalStorage() {
    const storage = localStorage.getItem('storage');
    return storage == 'local';
  }

  resetUI() {
    this.meetingService.participantsAudio.clear();
    this.meetingService.meeting = null;
    this.messagingService.labMessages = [];
  }

  // mar
  createID36() {
    return uuidv4();
  }

  createID32() {
    return uuidv4().replaceAll('-', '');
  }

  showLoader() {
    this.showLoader();
  }

  hideLoader() {
    this.hideLoader();
  }

  updateEsign(ref: string) {
    const id = this.userService.getUserData().id;
    if (this.userService.getUserType() == '1') {
      const postObject = {
        tables: 'teachers',
        values: {
          ESign: ref,
        },
        conditions: {
          WHERE: {
            ID: id,
          },
        },
      };
      return this.post('update_entry', {
        data: JSON.stringify(postObject),
      });
    } else {
      const postObject = {
        tables: 'administrators',
        values: {
          ESign: ref,
        },
        conditions: {
          WHERE: {
            ID: id,
          },
        },
      };
      return this.post('update_entry', {
        data: JSON.stringify(postObject),
      });
    }
  }

  returnSuccess(data: any, errorMsg: string) {
    if (data.success) {
      return data.output;
    } else {
      this.failedSnackbar(errorMsg);
      return new Array<any>();
    }
  }
}
