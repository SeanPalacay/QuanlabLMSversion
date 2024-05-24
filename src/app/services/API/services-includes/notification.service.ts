import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  public inbox: number = 0;
  private socket: WebSocket;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private usedStorage: Storage,
  ) {
    this.socket = new WebSocket(environment.socket);
    this.socket.binaryType = 'arraybuffer';
  }

  notifyParticipants(message: string) {
    const classID = this.usedStorage.getItem('classID');
    const postObject = {
      selectors: ['student_classes.StudentID as id'],
      tables: 'student_classes',
      conditions: {
        WHERE: {
          'student_classes.ClassID': classID,
        },
      },
    };
    this.post('get_entries', {
      data: JSON.stringify(postObject),
    }).subscribe((data: any) => {
      if (data.success) {
        for (let student of data.output) {
          this.socketSend({
            to: student.id,
            message: message,
          });
        }
      } else {
        this.failedSnackbar('Error notifying participants');
      }
    });
  }

  pushNotifications(title: string, message: string, recipientID: string) {
    const userData = this.userService.getUserData();
    const postObject = {
      tables: 'notifications',
      values: {
        SenderID: userData?.id ?? 'Anonymous',
        RecipientID: recipientID,
        Title: title,
        Message: message,
        Status: 'not_seen',
      },
    };

    this.post('create_entry', {
      data: JSON.stringify(postObject),
    }).subscribe((data: any) => {
      const sender = userData
        ? `${userData.firstname} ${userData.lastname}`
        : 'Anonymous';
      this.socketSend({
        app: 'quanlab',
        type: 'notification',
        sender,
        from: userData?.id ?? 'Anonymous',
        to: recipientID,
        title: title,
        message: title,
      });
    });
  }

  getNotifications() {
    const userData = this.userService.getUserData();
    const id = userData?.id;
    const userType = this.userService.getUserType();
    const recipientID = userType === '2' ? '[--administrator--]' : id;

    const postObject = {
      selectors: ['*'],
      tables: 'notifications',
      conditions: {
        WHERE: {
          'notifications.RecipientID': recipientID,
        },
        'ORDER BY': 'notifications.Timestamp DESC',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  markAllAsInbox() {
    const userData = this.userService.getUserData();
    const postObject = {
      tables: 'notifications',
      values: {
        Status: 'inbox',
      },
      conditions: {
        WHERE: {
          RecipientID: userData?.id,
          Status: 'not_seen',
        },
      },
    };
    this.post('update_entry', {
      data: JSON.stringify(postObject),
    }).subscribe();
  }

  markAllAsRead() {
    const userData = this.userService.getUserData();
    const id = userData?.id;
    const userType = this.userService.getUserType();
    const recipientID = userType === '2' ? '[--administrator--]' : id;

    const postObject = {
      tables: 'notifications',
      values: {
        Status: 'seen',
      },
      conditions: {
        WHERE: {
          RecipientID: recipientID,
        },
      },
    };
    this.post('update_entry', {
      data: JSON.stringify(postObject),
    }).subscribe();
  }

  markAsRead(id: string) {
    const postObject = {
      tables: 'notifications',
      values: {
        Status: 'seen',
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    this.post('update_entry', {
      data: JSON.stringify(postObject),
    }).subscribe();
  }

  notifyStudentsInCourse(title: string, message: string, courseID: string) {
    const userData = this.userService.getUserData();
    const postObject = {
      selectors: ['student_classes.*'],
      tables: 'courses,classes, student_classes',
      conditions: {
        WHERE: {
          'courses.ID': courseID,
          'courses.TeacherID': userData?.id,
          'classes.CourseID': 'courses.ID',
          'classes.ID': 'student_classes.ClassID',
        },
      },
    };
    this.post('get_entries', {
      data: JSON.stringify(postObject),
    }).subscribe((data: any) => {
      for (let student of data.output) {
        this.pushNotifications(title, message, student.studentid);
      }
    });
  }

  notifyStudentsInClass(title: string, message: string, clsID?: string) {
    const classID = clsID ? clsID : this.usedStorage.getItem('classID');
    const postObject = {
      selectors: ['student_classes.StudentID as id'],
      tables: 'student_classes',
      conditions: {
        WHERE: {
          'student_classes.ClassID': classID,
        },
      },
    };
    this.post('get_entries', {
      data: JSON.stringify(postObject),
    }).subscribe((data: any) => {
      if (data.success) {
        for (let student of data.output) {
          this.pushNotifications(title, message, student.id);
        }
      } else {
        this.failedSnackbar('Error notifying participants');
      }
    });
  }

  failedSnackbar(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
      panelClass: 'default-snackbar-error',
    });
  }

  post(method: string, body: {}) {
    for (var [key, obj] of Object.entries<any>(body)) {
      if (key == 'values') {
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

  socketSend(data: object) {
    this.socket.send(
      JSON.stringify({ key: environment.socketKey, data: data })
    );
  }
}
