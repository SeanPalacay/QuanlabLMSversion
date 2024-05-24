import { Inject, Injectable, forwardRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LoadingSnackbarComponent } from 'src/app/components/popups/loadingsnackbar/loadingsnackbar.component';
import { Observable, Subject } from 'rxjs';
import { UtilityService } from './utility.service';
import { MeetingService } from './meeting.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usedStorage = this.utilityService.isLocalStorage()
    ? localStorage
    : sessionStorage;
  public downloadProgress$: Subject<number> = new Subject<number>();
  public userData = this.getUserData();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    @Inject(forwardRef(() => UtilityService)) private utilityService: UtilityService,
    private meetingService: MeetingService
  ) {}

  getUserData(logout: boolean = false) {
    const userData = this.usedStorage.getItem('user_info');
    if (userData == null && !logout) {
      this.logout();
      return null;
    }
    return JSON.parse(userData!);
  }

  getUserAccountType() {
    const userData = this.usedStorage.getItem('user_info');
    if (userData == null) {
      return null;
    }
    const parsedUserData = JSON.parse(userData);
    return parsedUserData.accountType;
  }

  getFullName() {
    const user = this.getUserData();
    return user.firstname + ' ' + user.lastname;
  }

  updateLocalUserData(userData: any) {
    this.usedStorage.setItem('user_info', userData);
    this.userData = this.getUserData();
  }

  useLocalStorage() {
    localStorage.setItem('storage', 'local');
  }

  useSessionStorage() {
    localStorage.setItem('storage', 'session');
  }

  isLoggedIn() {
    let loggedIn = this.usedStorage.getItem('logged_in');
    return loggedIn != null;
  }

  getUserType() {
    let userType = this.usedStorage.getItem('logged_in');
    return userType ? userType : undefined;
  }

  login(username: string, password: string) {
    this.snackBar.openFromComponent(LoadingSnackbarComponent, {
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
      panelClass: ['default-snackbar'],
    });
    return this.utilityService
      .post('login', {
        Username: username,
        Password: password,
      })
      .subscribe((data) => {
        this.snackBar.dismiss();
        const display = data.success ? 'Login Successful!' : data.output;
        const snackbarType = data.success
          ? 'default-snackbar-success'
          : 'default-snackbar-error';
        this.snackBar
          .open(display, 'Dismiss', {
            duration: 500,
            verticalPosition: 'bottom',
            horizontalPosition: 'right',
            panelClass: [snackbarType],
          })
          .afterDismissed()
          .subscribe(() => {
            if (data.success) {
              this.usedStorage.setItem(
                'logged_in',
                data.output.accountType.toString()
              );
              this.usedStorage.setItem(
                'user_info',
                JSON.stringify(data.output)
              );
              switch (parseInt(data.output.accountType)) {
                case 0:
                  this.router.navigate(['/student/dashboard']);
                  break;
                case 1:
                  this.router.navigate(['/teacher/dashboard']);
                  break;
                case 2:
                  this.router.navigate(['/admin/dashboard']);
                  break;
              }
            }
          });
      });
  }

  logout() {
    if (!this.isLoggedIn()) {
      return;
    }
    const rememberMe = this.utilityService.isLocalStorage();
    const user = this.getUserData(true);
    const email = user.email;
    this.usedStorage.clear();
    if (rememberMe) {
      localStorage.setItem('remember', email);
      localStorage.setItem('storage', 'local');
    } else {
      localStorage.clear();
    }
    this.router.navigate(['/login']);
  }

  getSavedEmail() {
    const email = localStorage.getItem('remember');
    return email;
  }

  checkIfPendingVerification(email: string) {
    const postObject = {
      selectors: ['*'],
      tables: 'verification',
      conditions: {
        WHERE: {
          '[dot]Email': email,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  pushVerification(data: any) {
    const postObject = {
      tables: 'verification',
      values: {
        Email: data.email,
        FirstName: data.firstname,
        LastName: data.lastname,
        Token: data.token,
      },
    };

    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  sendVerification(details: any) {
    return this.http.post<any>(
      environment.nodeserver + '/send-verification-email',
      {
        key: environment.socketKey,
        host: details.host,
        email: details.email,
        password: details.password,
        firstname: details.firstname,
        lastname: details.lastname,
        address: details.address,
        nationality: details.nationality,
        birthdate: details.birthdate,
        gender: details.gender,
      }
    );
  }

  adminVerifyToken(token: string) {
    return this.http.post<any>(environment.nodeserver + '/admin-verify-email', {
      key: environment.socketKey,
      token: token,
    });
  }

  adminRejectToken(token: string) {
    return this.http.post<any>(environment.nodeserver + '/admin-reject-email', {
      key: environment.socketKey,
      token: token,
    });
  }

  verifyEmail(token: string) {
    return this.http.post<any>(environment.nodeserver + '/verify-email', {
      key: environment.socketKey,
      token: token,
    });
  }

  removeFromVerification(email: string) {
    const postObject = {
      tables: 'verification',
      conditions: {
        WHERE: {
          '[dot]Email': email,
        },
      },
    };
    return this.utilityService.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  register(details: any) {
    const id = this.utilityService.createID32();

    const newDate = new Date().getTime().toString();
    const visID =
      'Q-S' + newDate.substring(4, 7) + '-' + newDate.substring(7, 13);

    const postObject = {
      tables: 'students',
      values: {
        ID: id,
        VisibleID: visID,
        Email: details.email,
        '[hash]Password': details.password,
        FirstName: details.firstname,
        LastName: details.lastname,
        Address: details.address,
        Nationality: details.nationality,
        BirthDate: details.birthdate,
        Gender: details.gender,
      },
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  checkEmailExists(email: string, domain: string) {
    const postObject = {
      selectors: ['ID'],
      tables: domain,
      conditions: {
        WHERE: {
          '[dot]Email': email,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  updateAdminName(id: string, firstname: string, lastname: string) {
    const postObject = {
      tables: 'administrators',
      values: {
        FirstName: firstname,
        LastName: lastname,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateTeacherName(id: string, firstname: string, lastname: string) {
    const postObject = {
      tables: 'teachers',
      values: {
        FirstName: firstname,
        LastName: lastname,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateStudentName(id: string, firstname: string, lastname: string) {
    const postObject = {
      tables: 'students',
      values: {
        FirstName: firstname,
        LastName: lastname,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateTeacherStudentName(id: string, firstname: string, lastname: string) {
    const postObject = {
      table: 'students',
      update: {
        FirstName: firstname,
        LastName: lastname,
      },
      where: {
        ID: id,
      },
    };

    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateAdminEmail(id: string, email: string) {
    const postObject = {
      tables: 'administrators',
      values: {
        Email: email,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateTeacherEmail(id: string, email: string) {
    const postObject = {
      tables: 'teachers',
      values: {
        Email: email,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateStudentEmail(id: string, email: string) {
    const postObject = {
      tables: 'students',
      values: {
        Email: email,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateForStudentName(id: string, firstname: string, lastname: string) {
    const postObject = {
      tables: 'students',
      values: {
        FirstName: firstname,
        LastName: lastname,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateForStudentEmail(id: string, email: string) {
    const postObject = {
      tables: 'students',
      values: {
        Email: email,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateProfileImage(id: string, url: string) {
    const userType = this.getUserType();
    const postObject = {
      tables:
        userType == '0'
          ? 'students'
          : userType == '1'
          ? 'teachers'
          : 'administrators',
      values: {
        Profile: url,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateStudentPassword(id: string, password: string) {
    const postObject = {
      tables: 'students',
      values: {
        '[hash]Password': password,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateTeacherPassword(id: string, password: string) {
    const postObject = {
      tables: 'teachers',
      values: {
        '[hash]Password': password,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateAdminPassword(id: string, password: string) {
    const postObject = {
      tables: 'administrators',
      values: {
        '[hash]Password': password,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  deleteAccount(accountID: string, type: string) {
    const postObject = {
      tables: type,
      conditions: {
        WHERE: {
          ID: accountID,
        },
      },
    };
    return this.utilityService.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  localPost(method: string, body: {}) {
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

  failedSnackbar(message: string, timer?: number) {
    var time = 3000;
    if (timer != undefined) {
      time = timer!;
    }
    this.snackBar.open(message, 'Dismiss', {
      duration: time,
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
      panelClass: 'default-snackbar-error',
    });
  }

  getURL(file: string) {
    if (file) {
      if (file.includes('http')) return file;
      return environment.server + '/' + file + '?' + new Date().getTime();
    }
    return file;
  }

  searchPeople(search: string) {
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'students.ID, students.FirstName, students.LastName, students.LastSeen, students.VisibleID, students.Profile',
        `'student' as type`,
      ],
      tables: 'students',
      conditions: {
        WHERE: {},
        "lower(concat(students.FirstName,' ',students.LastName))": `LIKE '%${search}%' AND students.ID != '${id}'`,
        'UNION ALL': `SELECT teachers.ID, teachers.FirstName, teachers.LastName, teachers.LastSeen, teachers.VisibleID, teachers.Profile, 'teacher' as type FROM teachers 
            WHERE 
              lower(concat(teachers.FirstName,' ',teachers.LastName)) LIKE '%${search}%'  AND teachers.ID != '${id}'`,
        'ORDER BY': `FirstName`,
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  updateTeacher(newTeacher: any) {
    var password = {};
    if (newTeacher.password) {
      password = {
        '[hash]Password': newTeacher.password,
      };
    }
    const postObject = {
      tables: 'teachers',
      values: Object.assign(
        {
          FirstName: newTeacher.firstname,
          LastName: newTeacher.lastname,
          Email: newTeacher.email,
          Job: newTeacher.job,
          VisibleID: newTeacher.visibleid,
        },
        password
      ),
      conditions: {
        WHERE: {
          ID: newTeacher.id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateAdmin(newAdmin: any) {
    var password = {};
    if (newAdmin.password) {
      password = {
        '[hash]Password': newAdmin.password,
      };
    }
    const postObject = {
      tables: 'administrators',
      values: Object.assign(
        {
          FirstName: newAdmin.firstname,
          LastName: newAdmin.lastname,
          Email: newAdmin.email,
          Role: newAdmin.role,
        },
        password
      ),
      conditions: {
        WHERE: {
          ID: newAdmin.id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  getTeachers() {
    const postObject = {
      selectors: [
        'ID',
        'FirstName',
        'LastName',
        'VisibleID',
        'Email',
        'lastseen',
        'job',
      ],
      tables: 'teachers',
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  addAdmin(newAdmin: any): Observable<any> {
    const postObject = {
      tables: 'administrators',
      values: Object.assign({
        ID: this.utilityService.createID32(),
        FirstName: newAdmin.firstname,
        LastName: newAdmin.lastname,
        Email: newAdmin.email,
        '[hash]Password': newAdmin.password ?? '1',
        Role: newAdmin.role,
      }),
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateStudentInfo(student: any) {
    var password = {};
    if (student.password) {
      password = {
        '[hash]Password': student.password,
      };
    }
    const postObject = {
      tables: 'students',
      values: Object.assign(
        {
          FirstName: student.firstname,
          LastName: student.lastname,
          Email: student.email,
          VisibleID: student.visibleid,
        },
        password
      ),
      conditions: {
        WHERE: {
          ID: student.id,
        },
      },
    };
    console.log(postObject);
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  addTeacher(newTeacher: any): Observable<any> {
    const postObject = {
      tables: 'teachers',
      values: Object.assign({
        ID: this.utilityService.createID32(),
        FirstName: newTeacher.firstname,
        LastName: newTeacher.lastname,
        Email: newTeacher.email,
        '[hash]Password': newTeacher.password ?? '1',
        Job: newTeacher.job,
        VisibleID: newTeacher.visibleid,
      }),
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  getPendingStudents() {
    const postObject = {
      selectors: ['*'],
      tables: 'verification',
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getAdmins() {
    const postObject = {
      selectors: ['ID', 'FirstName', 'LastName', 'Role', 'Email', 'LastSeen'],
      tables: 'administrators',
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  studentGetAssignments() {
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'assignments.*',
        'courses.course',
        'languages.Language',
        'COUNT(student_assignments.ID) as done',
      ],
      tables: 'assignments',
      conditions: {
        'LEFT JOIN courses': 'ON assignments.CourseID = courses.ID',
        'LEFT JOIN languages': 'ON courses.LanguageID = languages.ID',
        'LEFT JOIN classes': 'ON classes.CourseID = courses.ID',
        'LEFT JOIN student_classes': 'ON student_classes.ClassID = classes.ID',
        'LEFT JOIN student_assignments': `ON student_assignments.StudentID = '${id}' AND student_assignments.AssignmentID = assignments.ID`,

        WHERE: {
          'student_classes.StudentID': id,
        },
        'GROUP BY':
          'assignments.ID, courses.ID, languages.ID,classes.ID, student_classes.ID',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  studentGetAssignmentByID(taskID: string) {
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'assignments.*',
        'courses.course',
        'teachers.ID as teacherid, teachers.FirstName, teachers.LastName',
      ],
      tables: 'assignments,courses,teachers, classes, student_classes',
      conditions: {
        WHERE: {
          'teachers.ID': 'courses.TeacherID',
          'courses.ID': 'assignments.CourseID',
          'classes.CourseID': 'courses.ID',
          'student_classes.ClassID': 'classes.ID',
          'student_classes.StudentID': id,
          'assignments.ID': taskID,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  studentSubmitAssignment(
    assignID: string,
    comments?: string,
    attachments?: string
  ) {
    const id = this.getUserData().id;
    var attach = {};
    if (attachments != undefined) {
      attach = { Attachments: attachments };
    }
    var comment = {};
    if (comments != undefined) {
      comment = { Comments: comments };
    }

    const postObject = {
      tables: 'student_assignments',
      values: Object.assign(
        {},
        {
          AssignmentID: assignID,
          StudentID: id,
        },
        attach,
        comment
      ),
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  studentAssignSubmitted(assignID: string) {
    const id = this.getUserData().id;
    const postObject = {
      selectors: ['student_assignments.*'],
      tables: 'student_assignments',
      conditions: {
        WHERE: {
          'student_assignments.AssignmentID': assignID,
          'student_assignments.StudentID': id,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  teacherGetAllSubmissions() {
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'students.FirstName',
        'students.LastName',
        'assignments.title',
        'student_assignments.*',
      ],
      tables: 'students,student_assignments, assignments, courses',
      conditions: {
        WHERE: {
          'student_assignments.AssignmentID': 'assignments.ID',
          'student_assignments.StudentID': 'students.ID',
          'assignments.CourseID': 'courses.ID',
          'courses.TeacherID': id,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  updateFromTeacher(id: string, firstname: string, lastname: string) {
    const postObject = {
      tables: 'students',
      values: {
        FirstName: firstname,
        LastName: lastname,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };

    console.log('ken', postObject);
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  teacherGetTasks() {
    const id = this.getUserData().id;
    const postObject = {
      selectors: ['assignments.*', 'courses.course'],
      tables: 'assignments,courses',
      conditions: {
        WHERE: {
          'courses.ID': 'assignments.CourseID',
          'courses.TeacherID': id,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  teacherGetAssignment(taskID: string) {
    const postObject = {
      selectors: ['assignments.*'],
      tables: 'assignments',
      conditions: {
        WHERE: {
          ID: taskID,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  teacherGetStudentAssignment(subID: string) {
    const postObject = {
      selectors: ['student_assignments.*'],
      tables: 'student_assignments',
      conditions: {
        WHERE: {
          ID: subID,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  resetStudents() {
    this.meetingService.meeting.sendChatMessage(
      JSON.stringify({
        senderID: this.getUserData().visibleid,
        senderName: this.getFullName(),
        profile: this.getUserData().profile,
        labid: this.meetingService.labID,
        type: 'reset',
      })
    );
  }
}
