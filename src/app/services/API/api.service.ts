import { Injectable, OnDestroy, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoadingSnackbarComponent } from 'src/app/components/popups/loadingsnackbar/loadingsnackbar.component';
import { environment } from 'src/environments/environment';
import {
  AssemblyAI,
  TranscribeParams,
  TranscriptLanguageCode,
} from 'assemblyai';
import { v4 as uuidv4 } from 'uuid';
import * as FileSaver from 'file-saver';
import {
  BehaviorSubject,
  EMPTY,
  ReplaySubject,
  Subject,
  Subscription,
  catchError,
  firstValueFrom,
  iif,
  lastValueFrom,
  min,
  timeout,
} from 'rxjs';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ViewerComponent } from 'src/app/components/viewer/viewer.component';
import {
  Course,
  MessageObject,
  ParticipantObject,
} from 'src/app/shared/model/models';
import { Observable, throwError } from 'rxjs';
import { LoaderService } from 'src/app/loader.service';
import Swal from 'sweetalert2';
import { first, map } from 'rxjs/operators';
import { fromEvent, merge, of } from 'rxjs';
import { VideoSDK } from '@videosdk.live/js-sdk';

const client = new AssemblyAI({
  apiKey: environment.assemblyAIToken,
});

@Injectable({
  providedIn: 'root',
})
export class APIService implements OnDestroy, OnInit {
  public socket: WebSocket;
  public inbox: number = 0;

  localServer = 'http://34.80.109.155';
  audio: HTMLAudioElement;
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private modalService: NgbModal,
    private loader: LoaderService
  ) {
    this.audio = new Audio();
    this.audio.src = 'assets/sounds/notif.mp3';
    this.audio.load();
    this.socket = new WebSocket(environment.socket);
    this.socket.binaryType = 'arraybuffer';
    this.updateLastSeen();
    this.backgroundID = setInterval(() => {
      if (this.online) {
        this.updateLastSeen();
      }
    }, 3000);
    this.userData = this.getUserData();
  }

  ngOnInit(): void {
    const obs = this.endSpeechMeeting(this.getUserData().id).subscribe(() => {
      obs.unsubscribe();
    });
  }

  getAttendanceHistory() {
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'lab_meetings.ID',
        'lab_meetings.StartTime as datetime',
        'speech_attendance.TimeIn',
        'students.FirstName as firstname',
        'students.LastName as lastname',
      ],
      tables: 'lab_meetings, speech_attendance, students',
      conditions: {
        WHERE: {
          'lab_meetings.ID': 'speech_attendance.MeetingID',
          'lab_meetings.TeacherID': id,
          'students.ID': 'speech_attendance.StudentID',
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  // Method to fetch lesson data
  getLessonData(): Observable<any> {
    return this.http.get<any>('assets/jsons/speechlab/module1/lesson1.json');
  }

  getQuizData(): Observable<any> {
    return this.http.get<any>('assets/jsons/speechlab/vidquiz/vidquiz.json');
  }

  ngOnDestroy(): void {
    if (this.backgroundID) {
      clearInterval(this.backgroundID);
    }
    this.downloadProgress$.unsubscribe();
    const obs = this.endSpeechMeeting(this.getUserData().id).subscribe(() => {
      obs.unsubscribe();
    });
  }

  backgroundID: any = 0;

  private usedStorage = this.isLocalStorage() ? localStorage : sessionStorage;
  public userData = this.getUserData();
  public joinWithMic?: boolean;
  public joinWithCamera?: boolean;
  public search: string = '';
  public currentPractice: any;
  public currentTask: any;
  public quizID: string | null = null;
  public messages: any = [];
  public convos: any = [];
  public chat: any;
  public interests: string[] = [];
  public meetingInfo: any;
  public notifications: any = [];

  online = true;

  goOffline() {
    this.online = false;
    this.hideLoader();
    if (this.getUserType() != '0') return;
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

  async getServerFileAsBase64(link: string) {
    const file = await firstValueFrom(
      this.http.get(this.getURL(link), { responseType: 'blob' })
    );
    // console.log(file);
    const base = await firstValueFrom(this.getBaseAsync(file));
    return base;
  }
  async getServerFile(link: string) {
    const file = await firstValueFrom(
      this.http.get(this.getURL(link), { responseType: 'blob' })
    );
    return file;
  }

  setCourse(courseID: string) {
    this.usedStorage.setItem('courseID', courseID);
  }

  setClass(classID: string) {
    this.usedStorage.setItem('classID', classID);
  }

  setLesson(lessonID: any) {
    this.usedStorage.setItem('lessonID', lessonID);
  }

  createID32() {
    return uuidv4().replaceAll('-', '');
  }
  createID36() {
    return uuidv4();
  }

  showLoader() {
    this.loader.show();
  }
  hideLoader() {
    this.loader.hide();
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
    return this.post('update_entry', {
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
    return this.post('update_entry', {
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
    return this.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateTeacherStudentName(id: string, firstname: string, lastname:string) {
    const postObject = {
      table: 'students',
      update: {
        FirstName: firstname,
        LastName: lastname,
      },
      where: {
        ID: id
      }
    };
    
    return this.post('update_entry', {
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
    return this.post('update_entry', {
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
    return this.post('update_entry', {
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
    return this.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  // edit for teacher 

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
    return this.post('update_entry', {
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
    return this.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }
  // end edit for teacher 
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
    return this.post('update_entry', {
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
    return this.post('update_entry', {
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
    return this.post('update_entry', {
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
    return this.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }
  askGemini(prompt: string) {
    this.justSnackbar('Asking Gemini for reponse...', 9999999);
    const headers = new HttpHeaders({
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
    });
    this.http
      .post<any>(
        environment.nodeserver + '/generate',
        JSON.stringify({
          key: environment.socketKey,
          prompt: prompt,
        }),
        { headers }
      )
      .pipe(
        timeout(20000),
        catchError((e) => {
          this.failedSnackbar('Took too long to respond.');
          return EMPTY;
        })
      )
      .subscribe((data) => {
        try {
          const json = (data.response as string)
            .replaceAll('```', '')
            .replaceAll('json', '')
            .replaceAll('JSON', '')
            .replaceAll('Json', '')
            .trim();

          const jsonObject = JSON.parse(json);
          var title = 'default';
          if (jsonObject.title != undefined) {
            title = jsonObject.title;
          }
          const blob = new Blob([json], { type: 'application/json' });
          FileSaver.saveAs(blob, title + '.json');
          this.successSnackbar('JSON saved successfully');
        } catch (e) {
          if (data.success) {
            this.justSnackbar(data.response, 9999999);
          } else {
            this.failedSnackbar(data.response, 9999999);
          }
        }
      });
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

  parseTime(date:string){
    const dateObject = new Date(date);
    return dateObject.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  parseDateFromNow(date: string) {
    const timepassed = new Date().getTime() - new Date(date).getTime();
    // if(timepassed)
    const seconds = timepassed / 1000;
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
      return minutes == 1 ? '1 minute ago' : `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours == 1 ? '1 hour ago' : `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return days == 1 ? '1 day ago' : `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return weeks == 1 ? '1 week ago' : `${weeks} weeks ago`;
    return 'A long time ago';
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

  successSnackbar(message: string, timer?: number) {
    var time = 3000;
    if (timer != undefined) {
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
    if (timer != undefined) {
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
      `${this.localServer}:85/api.php?${salt}`,
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
    this.joinWithCamera = cam;
    this.joinWithMic = mic;
  }

  joinMeet() {
    if (this.getUserType() == '0') {
      this.router.navigate(['student/quanhub']);
    } else {
      this.router.navigate(['teacher/quanhub']);
    }
  }

  resetMeetOptions() {
    this.joinWithCamera = undefined;
    this.joinWithMic = undefined;
  }

  login(username: string, password: string) {
    this.snackBar.openFromComponent(LoadingSnackbarComponent, {
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
      panelClass: ['default-snackbar'],
    });
    return this.post('login', {
      Username: username,
      Password: password,
    }).subscribe((data) => {
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
            const user = data.output;
            if(user.esign){
             user.esign = user.esign + '?' + new Date().getTime(); 
            }
            this.usedStorage.setItem('user_info', JSON.stringify(data.output));
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

  teacherAllCourses() {
    const id = this.getUserData().id;
    const postObject = {
      selectors: ['courses.*', 'COUNT(lessons.ID) as  lessons'],
      tables: 'courses',
      conditions: {
        'LEFT JOIN lessons': 'ON lessons.CourseID = courses.ID',
        WHERE: {
          'courses.TeacherID': id,
        },
        'GROUP BY': 'courses.ID',
      },
    };

    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getCourses(limit?: number, filter?: string) {
    const filterObject = filter != null ? { languageID: filter } : {};
    const limitObject = limit != null ? { LIMIT: limit } : {};
    // const postObject =Object.assign(
    //   {},filterObject, limitObject
    // );
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'teachers.FirstName,teachers.LastName,teachers.Profile',
        'languages.*',
        'courses.*',
        'COUNT(lessons.ID) as lessoncount',
        'AVG(lessons.Difficulty) as complexity',
        'COUNT(student_classes.StudentID) as enrolled',
      ],
      tables: 'courses',
      conditions: Object.assign(
        {
          'LEFT JOIN teachers': 'ON teachers.ID = courses.TeacherID',
          'LEFT JOIN languages': 'ON languages.ID = courses.LanguageID',
          'LEFT JOIN lessons': 'ON lessons.CourseID = courses.ID',
          'LEFT JOIN classes': 'ON classes.CourseID = courses.ID',
          'LEFT JOIN student_classes':
            `ON student_classes.ClassID = classes.ID AND student_classes.StudentID ='` +
            id +
            `'`,
          // 'LEFT JOIN student_classes'
          WHERE: Object.assign(
            {
              'teachers.ID': 'courses.TeacherID',
            },
            filterObject
          ),
          'GROUP BY': 'courses.ID, teachers.ID, languages.ID',
          'ORDER BY': 'AVG(lessons.Difficulty) DESC',
        },
        limitObject
      ),
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
    // return this.post('get_courses', postObject);
  }

  matchCourseCode(courseID: string, classCode: string) {
    const classCodeMatch = {
      '[dot]classes.ClassCode': classCode,
    };

    const postObject = {
      selectors: ['classes.*'],
      tables: 'classes, courses',
      conditions: {
        WHERE: Object.assign(classCodeMatch, {
          'classes.CourseID': 'courses.ID',
          'courses.ID': courseID,
        }),
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  enrollCourse(classID: string) {
    const userData = JSON.parse(this.usedStorage.getItem('user_info')!);
    const postObject = {
      tables: 'student_classes',
      values: {
        StudentID: userData.id,
        ClassID: classID,
        Pending: false,
      },
    };
    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  checkIfEnrolled(courseID: string) {
    const postObject = { CourseID: courseID, StudentID: this.getUserData().id };
    return this.post('check_if_enrolled', postObject);
  }

  noProfile() {
    return 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg';
  }

  getLessons() {
    const id = this.getUserData().id;
    const currentCourse = this.usedStorage.getItem('courseID');
    if (currentCourse == null) {
      this.router.navigate(['/student/courses']);
    }
    const postObject = {
      selectors: [
        'teachers.FirstName',
        'teachers.LastName',
        'lessons.*, lessons_taken.Progress',
      ],
      tables: 'teachers,courses,lessons',
      conditions: {
        'LEFT JOIN lessons_taken': `ON lessons_taken.LessonID = lessons.ID AND lessons_taken.StudentID ='${id}'`,
        WHERE: {
          'courses.ID': currentCourse,
          'courses.TeacherID': 'teachers.ID',
          'lessons.CourseID': 'courses.ID',
        },
        // 'GROUP BY': 'lessons.ID,teachers.ID, courses.ID',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }
  lessonProgress(lessonID: string, progress: number) {
    const id = this.getUserData().id;
    const postObject = {
      tables: 'lessons_taken',
      values: {
        LessonID: lessonID,
        StudentID: id,
        Progress: progress,
      },
    };
    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  getEnrolledCourses() {
    const userData = JSON.parse(this.usedStorage.getItem('user_info')!);
    const postObject = {
      selectors: [
        'teachers.FirstName',
        'teachers.LastName',
        'classes.*',
        'classes.ID as class_id',
        'courses.*',
      ],
      tables: 'students,student_classes,classes,courses, teachers',
      conditions: {
        WHERE: {
          'teachers.ID': 'courses.TeacherID',
          'students.ID': 'student_classes.StudentID',
          'courses.ID': 'classes.CourseID',
          'student_classes.ClassID': 'classes.ID',
          ' students.ID': userData.id,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  createClass(
    courseID: string,
    className: string,
    code: string,
    schedule: string
  ) {
    const postObject = {
      tables: 'classes',
      values: {
        CourseID: courseID,
        Class: className,
        ClassCode: code,
        Schedule: schedule,
      },
    };
    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  editClass(
    classID: string,
    className: string,
    code: string,
    schedule: string
  ) {
    const postObject = {
      tables: 'classes',
      values: {
        Class: className,
        ClassCode: code,
        Schedule: schedule,
      },
      conditions: {
        WHERE: {
          ID: classID,
        },
      },
    };
    return this.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  deleteClass(classID: string) {
    const postObject = {
      tables: 'classes',
      conditions: {
        WHERE: {
          ID: classID,
        },
      },
    };
    return this.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  getCourseClasses() {
    const currentCourse = this.usedStorage.getItem('courseID');
    const id = this.getUserData().id;
    const postObject = {
      selectors: ['classes.*', 'courses.ID as course_id'],
      tables: 'classes,courses',
      conditions: {
        WHERE: {
          'classes.CourseID': 'courses.ID',
          'courses.TeacherID': id,
          'courses.ID': currentCourse,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  teacherAllClasses() {
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'classes.*',
        'courses.ID as course_id',
        'courses.course',
        'COUNT(students.ID) as studentcount',
      ],
      tables: 'classes',
      conditions: {
        'LEFT JOIN student_classes': 'ON student_classes.ClassID = classes.ID',
        'LEFT JOIN courses': 'ON classes.CourseID = courses.ID',
        'LEFT JOIN students': 'ON student_classes.StudentID = students.ID',
        WHERE: {
          // 'classes.CourseID': 'courses.ID',
          // 'student_classes.ClassID': 'classes.ID',
          'courses.TeacherID': id,
        },
        'GROUP BY': 'classes.ID,courses.ID',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  teacherCoursesAndEnrolled() {
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'courses.*',
        'languages.Language',
        'COUNT(students.ID) as studentcount',
      ],
      tables: 'courses',
      conditions: {
        'LEFT JOIN languages': 'ON languages.ID = courses.LanguageID',
        'LEFT JOIN classes': 'ON classes.CourseID = courses.ID',
        'LEFT JOIN student_classes': 'ON student_classes.ClassID = classes.ID',
        'LEFT JOIN students': 'ON student_classes.StudentID = students.ID',
        WHERE: {
          'courses.TeacherID': id,
        },
        'GROUP BY': 'courses.ID,languages.ID',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getStudentsInClass(classID: string) {
    const postObject = {
      selectors: [
        'students.FirstName',
        'students.LastName',
        'students.ID as student_id',
      ],
      tables: 'classes,student_classes,students',
      conditions: {
        WHERE: {
          'classes.ID': classID,
          'student_classes.ClassID': 'classes.ID',
          'students.ID': 'student_classes.StudentID',
          'student_classes.Pending': false,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

    getStudents() {
      const postObject = {
        selectors: [
          'students.ID',
          'students.FirstName',
          'students.LastName',  
          'students.gender',
          'students.birthdate',
          'students.nationality',
          'students.address',
          'students.VisibleID',
          'students.Email',
          'students.profile',
          'students.lastseen',
        ],
        tables: 'students',
      };
      return this.post('get_entries', {
        data: JSON.stringify(postObject),
      });
    }

    getStudentsTeacher() {
      const postObject = {
        selectors: [
          'students.ID',
          'students.FirstName',
          'students.LastName',  
          'students.gender',
          'students.birthdate',
          'students.nationality',
          'students.address',
          'students.VisibleID',
          'students.Email',
          'students.profile',
          'students.lastseen',
          'courses.course',
          'classes.class',
          'classes.id AS class_id' 
        ],
        tables: 'students,student_classes,classes,courses',
        conditions: {
          WHERE: {
            'student_classes.StudentID': 'students.ID',
            'student_classes.ClassID': 'classes.ID',
            'classes.CourseID': 'courses.ID',
            'courses.teacherID': this.getUserData().id,
          },
        },
      };
      return this.post('get_entries', {
        data: JSON.stringify(postObject),
      });
    }


    //delete 

    deleteStudentFromCourse(classID: string, studentID: string) {
      const postObject = {
        tables: 'student_classes',
        conditions: {
          WHERE: {
            ClassID: classID, 
            StudentID: studentID,
          },
        },
      };
      console.log('ken', postObject);
      return this.post('delete_entry', {
        data: JSON.stringify(postObject),
      });
    }

  
    
    updateFromTeacher(id: string, firstname: string, lastname: string) {
      const postObject = {
        tables: 'students',
        values: {
          FirstName: firstname,
          LastName: lastname
        },
        conditions: {
          WHERE: {
            ID: id,
          },
        },
      };

      console.log('ken', postObject);
      return this.post('update_entry', {
        data: JSON.stringify(postObject),
      });
    }
    

  verificationNotifier = new BehaviorSubject<any>(null);

  getPendingStudents() {
    const postObject = {
      selectors: [
        '*',
      ],
      tables: 'verification',
    };
    return this.post('get_entries', {
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
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getAdmins() {
    const postObject = {
      selectors: [
        'ID',
        'FirstName',
        'LastName',
        'Role',
        'Email',
        'LastSeen'
      ],
      tables: 'administrators',
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }
  addStudent(newStudent: any): Observable<any> {
    const postObject = {
      tables: 'students',
      values: Object.assign({
        FirstName: newStudent.lastname,
        LastName: newStudent.firstname,
        Email: newStudent.email,
        '[hash]Password': newStudent.password ?? '1',
        Job: newStudent.job,
        VisibleID: newStudent.visibleid,
      }),
    };
    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }
  addTeacher(newTeacher: any): Observable<any> {
    const postObject = {
      tables: 'teachers',
      values: Object.assign({
        ID: this.createID32(),
        FirstName: newTeacher.firstname,
        LastName: newTeacher.lastname,
        Email: newTeacher.email,
        '[hash]Password': newTeacher.password ?? '1',
        Job: newTeacher.job,
        VisibleID: newTeacher.visibleid,
      }),
    };
    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  addAdmin(newAdmin: any): Observable<any> {
    const postObject = {
      tables: 'administrators',
      values: Object.assign({
        ID: this.createID32(),
        FirstName: newAdmin.firstname,
        LastName: newAdmin.lastname,
        Email: newAdmin.email,
        '[hash]Password': newAdmin.password ?? '1',
        Role: newAdmin.role,
      }),
    };
    return this.post('create_entry', {
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
    return this.post('update_entry', {
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
    return this.post('update_entry', {
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
    return this.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  
  getCourseProgress(courseid: string) {
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'SUM(lessons_taken.Progress)',
        'COUNT(lessons.ID) as lessons',
        'student_classes.*',
      ],
      tables: 'student_classes,classes,courses',
      conditions: {
        'LEFT JOIN lessons': 'ON lessons.CourseID = courses.ID',
        'LEFT JOIN lessons_taken': 'ON lessons_taken.LessonID = lessons.ID',
        WHERE: {
          'student_classes.StudentID': id,
          'student_classes.ClassID': 'classes.ID',
          'classes.CourseID': 'courses.ID',
          'courses.ID': courseid,
        },
        'GROUP BY': 'student_classes.ID, classes.ID, courses.ID',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getClasses() {
    if (this.getUserType() == '1') {
      const id = this.getUserData().id;
      const postObject = {
        selectors: ['courses.*,classes.*'],
        tables: 'classes,courses',
        conditions: {
          WHERE: {
            'classes.CourseID': 'courses.ID',
            'courses.TeacherID': id,
          },
        },
      };
      return this.post('get_entries', {
        data: JSON.stringify(postObject),
      });
    } else {
      const id = this.getUserData().id;
      const postObject = {
        selectors: [' courses.*, classes.*'],
        tables: 'classes,student_classes, courses',
        conditions: {
          WHERE: {
            'classes.CourseID': 'courses.ID',
            'classes.ID': 'student_classes.ClassID',
            'student_classes.StudentID': id,
          },
        },
      };
      return this.post('get_entries', {
        data: JSON.stringify(postObject),
      });
    }
  }

  teacherGetClassesByCourse(courseID: string) {
    const postObject = {
      selectors: ['classes.*'],
      tables: 'classes',
      conditions: {
        WHERE: {
          'classes.CourseID': courseID,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  createCourse(
    courseID: string,
    title: string,
    description: string,
    mode: string,
    languageID: string
  ) {
    var _description = description;
    if (_description == '') {
      _description = '[NONE]';
    }
    const id = this.getUserData().id;
    const postObject = {
      tables: 'courses',
      values: {
        ID: courseID,
        Course: title,
        Details: _description,
        Difficulty: 3,
        TeacherID: id,
        LanguageID: languageID,
        Filter: mode,
      },
    };
    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateCourse(
    courseID: string,
    title: string,
    description: string,
    mode: string,
    languageID: string
  ) {
    var _description = description;
    if (_description == '') {
      _description = '[NONE]';
    }
    const id = this.getUserData().id;
    const postObject = {
      tables: 'courses',
      values: {
        Course: title,
        Details: _description,
        Difficulty: 3,
        TeacherID: id,
        LanguageID: languageID,
        Filter: mode,
      },
      conditions: {
        WHERE: {
          ID: courseID,
        },
      },
    };
    return this.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  deleteCourse(courseID: string) {
    const postObject = {
      tables: 'courses',
      conditions: {
        WHERE: {
          ID: courseID,
        },
      },
    };
    return this.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  teacherGetCoursebyID(courseID: string) {
    const postObject = {
      selectors: ['courses.*'],
      tables: 'courses',
      conditions: {
        WHERE: {
          ID: courseID,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  createLesson(
    courseID: string,
    title: string,
    description: string,
    complexity: number,
    attachments?: string,
    image?: string
  ) {
    var attach = {};
    if (attachments != undefined) {
      attach = { Attachments: attachments };
    }
    var bg = {};
    if (image != undefined) {
      bg = { Background: image };
    }
    const postObject = {
      tables: 'lessons',
      values: Object.assign(
        {},
        {
          CourseID: courseID,
          Title: title,
          Details: description,
          Difficulty: complexity,
        },
        attach,
        bg
      ),
    };
    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateLesson(
    courseID: string,
    lessonID: string,
    title: string,
    description: string,
    complexity: number,
    attachments?: string,
    image?: string
  ) {
    var attach = {};
    if (attachments != undefined) {
      attach = { Attachments: attachments };
    }
    var bg = {};
    if (image != undefined) {
      bg = { Background: image };
    }
    const postObject = {
      tables: 'lessons',
      values: Object.assign(
        {
          Title: title,
          Details: description,
          Difficulty: complexity,
        },
        attach,
        bg
      ),
      conditions: {
        WHERE: {
          CourseID: courseID,
          ID: lessonID,
        },
      },
    };
    return this.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  getURL(file: string) {
    if (file) {
      if (file.includes('http')) return file;
      return environment.server + '/' + file ;
    }
    return file;
  }

  checkIfPendingVerification(email:string){
    const postObject = {
      selectors: [
      '*'
      ],
      tables: 'verification',
      conditions: {
        WHERE: {
          '[dot]Email': email,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  pushVerification(data:any){
    const postObject = {
      tables: 'verification',
      values: {
        Email: data.email,
        FirstName: data.firstname,
        LastName: data.lastname,
        Token: data.token
      },
    };
    
    // console.log(postObject);
    return this.post('create_entry', {
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

  removeFromVerification(email:string){
    const postObject = {
      tables: 'verification',
      conditions: {
        WHERE: {
          '[dot]Email': email,
        },
      },
    };
    return this.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

 register(details: any) {
    const id = this.createID32();

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
    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  checkEmailExists(email: string, domain: string) {
    const postObject = {
      selectors: [
        'ID',
        // 'COUNT(teachers.ID) as B',
        // 'COUNT(administrators.ID) as C',
      ],
      tables: domain,
      conditions: {
        // 'LEFT JOIN teachers': 'ON teachers.Email = "'+email+'"',
        // 'LEFT JOIN administrators': 'ON administrators.Email = "'+email+'"',
        WHERE: {
          '[dot]Email': email,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  teacherCourseLessons(courseID: string) {
    const postObject = {
      selectors: [
        'courses.id as cid',
        'courses.Course',
        'courses.Details',
        'lessons.*',
      ],
      tables: 'courses,lessons',
      conditions: {
        WHERE: {
          'courses.ID': courseID,
          'lessons.CourseID': 'courses.ID',
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getAllLanguages() {
    const postObject = {
      selectors: ['languages.*'],
      tables: 'languages',
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getLanguages() {
    const id = this.getUserData().id;
    const postObject = {
      selectors: ['languages.*'],
      tables: 'languages,courses',
      conditions: {
        WHERE: {
          'languages.ID': 'courses.LanguageID',
          'courses.TeacherID': id,
        },
        'GROUP BY': 'languages.ID',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getCoursesByLanguage(languageID: string) {
    const id = this.getUserData().id;
    const postObject = {
      selectors: ['courses.*'],
      tables: 'languages,courses',
      conditions: {
        WHERE: {
          'courses.LanguageID': 'languages.ID',
          'courses.TeacherID': id,
          'languages.ID': languageID,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }


 


  dictionary(word: string) {
    return this.http.get<any>(environment.server + '/' + word, {});
    // return this.http.get<any>(environment.server+ "/dictionary/"+word+".json",{});
  }

  getWord(word: string) {
    const postObject = {
      selectors: ['*'],
      tables: 'word_searches',
      conditions: {
        WHERE: {
          Search: word,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  pronounce(word: string) {
    const salt = new Date().getTime();
    return this.http.get<any>(
      environment.server + '/audio/' + word + '.json?' + salt,
      {
        headers: {},
      }
    );
  }

  fetchDictionaryAPI(word: string) {
    // fetch from own server first
    const headers = new HttpHeaders({
      'X-RapidAPI-Key': environment.lexicalakey,
      'X-RapidAPI-Host': environment.lexicalahost,
    });
    // return this.http.get<any>('https://api.dictionaryapi.dev/api/v2/entries/en/' + word);
    return this.http.get<any>(
      'https://' + environment.lexicalahost + '/search-entries',
      {
        headers: headers,
        params: { text: word },
      }
    );
  }

  fetchSRAPI(url: string, language: string) {
    var lang = 'en-US';
    switch (language) {
      case 'ja':
        lang = 'ja-JP';
        break;
    }
    const encodedParams = new URLSearchParams();
    encodedParams.set('audio_url', url);
    encodedParams.set('language_code', lang);

    const headers = new HttpHeaders({
      'X-RapidAPI-Key': environment.srKey,
      'X-RapidAPI-Host': environment.srHost,
      'content-type': 'application/x-www-form-urlencoded',
    });
    // return this.http.get<any>('https://api.dictionaryapi.dev/api/v2/entries/en/' + word);
    return this.http.post<any>(
      'https://' + environment.srHost + '/recognize',
      encodedParams,
      { headers }
    );
  }

  tts(text: string, lang: string) {
    const params = new HttpParams()
      .set('msg', text)
      .set('lang', 'Salli')
      .set('source', 'ttsmp3');
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-RapidAPI-Key': 'c29ff39618mshcedc0e4b8d12b69p18ec51jsnd5550cdbf497',
      'X-RapidAPI-Host': 'text-to-speech-for-28-languages.p.rapidapi.com',
    });
    return this.http.post(
      'https://text-to-speech-for-28-languages.p.rapidapi.com/',
      {
        data: params,
      },
      {
        headers,
      }
    );
  }

  saveDictionary(word: string, dictionary?: string) {
    var fileObject = {};
    if (dictionary != undefined) {
      const file = 'dictionary/' + word + '.json';
      this.uploadJson(dictionary, file);
      fileObject = { File: file };
    }
    const postObject = {
      tables: 'word_searches',
      values: Object.assign(
        {
          Search: word,
        },
        fileObject
      ),
    };
    const observable$: Subscription = this.post('create_entry', {
      data: JSON.stringify(postObject),
    }).subscribe(() => observable$.unsubscribe());
  }

  savePronunciation(word: string, soundURL: string) {
    return this.post('save_pronunciation', {
      search_key: word,
      sound_url: soundURL,
    }).subscribe((data) => {
      // console.log(data);
    });
  }

  convertToBase64(url: string) {
    this.http.get(url, { responseType: 'blob' }).subscribe(
      (blob: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          var bbase64 = reader.result as string;
          // console.log(bbase64);
        };
        reader.readAsDataURL(blob);
      },
      (error) => {
        console.error('Error fetching audio:', error);
      }
    );
  }

  getCurrentLevel(language: string, mode: string) {
    const id = this.getUserData().id;
    const postObject = {
      selectors: ['student_practices.*'],
      tables: 'student_practices',
      conditions: {
        WHERE: {
          StudentID: id,
          LanguageID: language,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  createLevelEntry(language: string, mode: string) {
    const id = this.getUserData().id;
    const postObject = {
      tables: 'student_practices',
      values: {
        StudentID: id,
        LanguageID: language,
      },
    };

    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateLevel(practiceID: string, level: number, mode: string) {
    var toUpdate: any = {
      Read: level + 1,
    };
    switch (mode) {
      case 'listening':
        toUpdate = {
          Listen: level + 1,
        };
        break;
      case 'writing':
        toUpdate = {
          Write: level + 1,
        };
        break;
      case 'speaking':
        toUpdate = {
          Speak: level + 1,
        };
        break;
    }
    const postObject = {
      tables: 'student_practices',
      values: toUpdate,
      conditions: {
        WHERE: {
          ID: practiceID,
        },
      },
    };
    this.post('update_entry', {
      data: JSON.stringify(postObject),
    }).subscribe();
  }

  convertToTimeZone(date: Date, timeZone: string): Date {
    const targetOffset = new Date(
      date.toLocaleString('en-US', { timeZone })
    ).getTimezoneOffset();
    const localOffset = date.getTimezoneOffset();
    const offsetDiff = localOffset - targetOffset;

    return new Date(date.getTime() + offsetDiff * 60000);
  }

  updateLastSeen() {
    if (!this.isLoggedIn()) return;
    var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = new Date(Date.now() - tzoffset).toISOString();

    const id = this.getUserData().id;
    if (this.getUserType() == '2') {
      const postObject = {
        tables: 'administrators',
        values: {
          LastSeen: localISOTime.slice(0, 19).replace('T', ' '),
        },
        conditions: {
          WHERE: {
            ID: id,
          },
        },
      };
      const observable = this.post('update_entry', {
        data: JSON.stringify(postObject),
      }).subscribe(
        () => {
          observable.unsubscribe();
        },
        (error) => {
          if (error instanceof HttpErrorResponse) {
            // Handle error
            if (error.status == 0) {
              this.goOffline();
            }
          }
        }
      );
    } else if (this.getUserType() == '1') {
      const postObject = {
        tables: 'teachers',
        values: {
          LastSeen: localISOTime.slice(0, 19).replace('T', ' '),
        },
        conditions: {
          WHERE: {
            ID: id,
          },
        },
      };
      const observable = this.post('update_entry', {
        data: JSON.stringify(postObject),
      }).subscribe(
        () => {
          observable.unsubscribe();
        },
        (error) => {
          if (error instanceof HttpErrorResponse) {
            // Handle error
            if (error.status == 0) {
              this.goOffline();
            }
          }
        }
      );
    } else {
      const postObject = {
        tables: 'students',
        values: {
          LastSeen: localISOTime.slice(0, 19).replace('T', ' '),
        },
        conditions: {
          WHERE: {
            ID: id,
          },
        },
      };
      const observable = this.post('update_entry', {
        data: JSON.stringify(postObject),
      }).subscribe(
        () => {
          observable.unsubscribe();
        },
        (error) => {
          if (error instanceof HttpErrorResponse) {
            // Handle error
            if (error.status == 0) {
              this.goOffline();
            }
          }
        }
      );
    }
  }

  recordAssessment(
    practiceID: string,
    level: number,
    takenPoints: number,
    totalPoints: number,
    mode: string
  ) {
    const postObject = {
      tables: 'student_practice_attempts',
      values: {
        StudentPracticeID: practiceID,
        Mode: mode,
        CurrentLevel: level,
        TakenPoints: takenPoints,
        TotalPoints: totalPoints,
      },
    };
    this.post('create_entry', {
      data: JSON.stringify(postObject),
    }).subscribe();
  }

  recordQuiz(assessmentID: string, takenPoints: number, totalPoints: number) {
    const id = this.getUserData().id;
    const postObject = {
      tables: 'student_assessments',
      values: {
        StudentID: id,
        AssessmentID: assessmentID,
        TakenPoints: takenPoints,
        TotalPoints: totalPoints,
      },
    };
    const record$ = this.post('create_entry', {
      data: JSON.stringify(postObject),
    }).subscribe(() => {
      record$.unsubscribe();
    });
  }

  updateQuizScore(assessmentID: string, takenPoints: number) {
    const id = this.getUserData().id;
    const postObject = {
      tables: 'student_assessments',
      values: {
        TakenPoints: takenPoints,
      },
      conditions: {
        WHERE: {
          StudentID: id,
          AssessmentID: assessmentID,
        },
      },
    };
    const update$ = this.post('update_entry', {
      data: JSON.stringify(postObject),
    }).subscribe(() => {
      update$.unsubscribe();
    });
  }

  similarity(s1: string, s2: string) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (
      (longerLength - this.editDistance(longer, shorter)) /
      parseFloat(longerLength.toString())
    );
  }

  editDistance(s1: string, s2: string) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0) costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  public speechComparison$: Subject<any> = new Subject<any>();

  speechToText(audioData: any, check: string, language: string) {
    const blob = new Blob([audioData], { type: 'audio/wav' });
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      const uniqID = uuidv4() + '.wav';
      this.http
        .post(environment.nodeserver + '/filehandler', {
          key: environment.socketKey,
          method: 'create_url',
          file_content: base64String,
          search_key: 'temp/' + uniqID,
        })
        .subscribe((data: any) => {
          // console.log(data);
          const url = environment.server + '/temp/' + uniqID;
          // deepgram.listen.prerecorded.transcribeUrl(
          //   audioData,
          //   {smart_format:true, model:'nova-2', language:'en-US'}
          // ).then(data=>{
          //   console.log(data);
          // })
          const params: TranscribeParams = {
            audio: url,
            language_code: language as TranscriptLanguageCode,
          };
          const stamp = Date.now();
          client.transcripts
            .transcribe(params, {
              pollingInterval: 100,
            })
            .then((transcript) => {
              // console.log(transcript);
              // console.log(
              //   ((Date.now() - stamp) / 1000).toString() + ' seconds'
              // );
              if (transcript.text != null) {
                this.speechComparison$.next({
                  spoken: transcript.text,
                  accuracy: this.similarity(
                    transcript.text.toLowerCase(),
                    check!.toLowerCase()
                  ),
                });
                // if (check != null) {
                //   if (

                //     // transcript.text.toLowerCase().includes(check.toLowerCase())
                //   ) {
                //     this.successSnackbar('Passed!');
                //   } else {
                //     this.failedSnackbar('Failed!');
                //   }
                // }
                // console.log(transcript.text);
              } else {
                this.failedSnackbar('Transcription failed');
              }
              // this.http.post(environment.nodeserver+'/filehandler',
              // {
              //   'method':'delete_url', 'search_key':uniqID
              // }).subscribe();
            });
        });
    };

    reader.readAsDataURL(blob);
  }

  uploadFile(file: File, filename: string) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      this.http
        .post(environment.nodeserver + '/filehandler', {
          key: environment.socketKey,
          method: 'create_url',
          file_content: base64String,
          search_key: 'files/' + filename,
        })
        .subscribe();
    };
    reader.readAsDataURL(file);
  }

  deleteFile(file: string) {
    const obs = this.http
      .post(environment.nodeserver + '/filehandler', {
        key: environment.socketKey,
        method: 'delete_url',
        search_key: file,
      })
      .subscribe((data) => {
        obs.unsubscribe();
      });
  }

  uploadImage(image: File, filename: string) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      const obs$ = this.http
        .post(environment.nodeserver + '/filehandler', {
          key: environment.socketKey,
          method: 'create_url',
          file_content: base64String,
          search_key: 'image_upload/' + filename,
        })
        .subscribe(() => {
          obs$.unsubscribe();
        });
    };
    reader.readAsDataURL(image);
  }

  uploadBase64(file: string, name: string) {
    const base64String = (file as string).split(',')[1];
    this.http
      .post(environment.nodeserver + '/filehandler', {
        key: environment.socketKey,
        method: 'create_url',
        file_content: base64String,
        search_key: name,
      })
      .subscribe();
  }

  async uploadBase64Async(file: string, name: string) {
    const base64String = (file as string).split(',')[1];
    await firstValueFrom(this.http
      .post(environment.nodeserver + '/filehandler', {
        key: environment.socketKey,
        method: 'create_url',
        file_content: base64String,
        search_key: name,
      }));
  }

  updateEsign(ref:string){
    const id = this.getUserData().id;
    if(this.getUserType() =='1'){
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
      })
    }else{
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
      })
    }
  }

  uploadProfilePicture(file: string, name: string) {
    const base64String = (file as string).split(',')[1];
    return this.http.post(environment.nodeserver + '/filehandler', {
      key: environment.socketKey,
      method: 'create_url',
      file_content: base64String,
      search_key: `${name}`,
    });
  }

  textToSpeech(phrase: string, language: string) {
    var speaker = {
      voice: 'Joanna',
      language: 'en-US',
      engine: 'neutral',
    };
    switch (language) {
      case 'en':
        speaker = {
          voice: 'Joanna',
          language: 'en-US',
          engine: 'neural',
        };
        break;
      case 'fr':
        speaker = {
          voice: 'Celine',
          language: 'fr-FR',
          engine: 'standard',
        };
        break;
      case 'ja':
        speaker = {
          voice: 'Kazuha',
          language: 'ja-JP',
          engine: 'neural',
        };
        break;
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': environment.ttskey,
      'X-RapidAPI-Host': environment.ttshost,
    });

    return this.http.post<any>(
      'https://' + environment.ttshost + '/synthesize-speech',
      JSON.stringify({
        sentence: phrase,
        language: speaker.language,
        voice: speaker.voice,
        engine: speaker.engine,
        withSpeechMarks: false,
      }),
      {
        headers: headers,
      }
    );
  }

  getUserAccountType() {
    const userData = this.usedStorage.getItem('user_info');
    if (userData == null) {
      return null;
    }
    const parsedUserData = JSON.parse(userData);
    return parsedUserData.accountType;
  }

  getUserData(logout: boolean = false) {
    const userData = this.usedStorage.getItem('user_info');
    if (userData == null && !logout) {
      this.logout();
      return null;
    }
    return JSON.parse(userData!);
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

  isLocalStorage() {
    const storage = localStorage.getItem('storage');
    return storage == 'local';
  }

  isLoggedIn() {
    let loggedIn = this.usedStorage.getItem('logged_in');
    return loggedIn != null;
  }

  getUserType() {
    let userType = this.usedStorage.getItem('logged_in');
    return userType ? userType : undefined;
  }

  // startMeeting(uniqID:string, teacherID:string, meetingCode:string){
  //   var classID = this.usedStorage.getItem('classID');
  //   return this.post('start_meeting', {
  //     'ClassID': classID,
  //     'TeacherID': teacherID,
  //     'MeetingCode': meetingCode,
  //   });
  // }

  startMeeting(uniqID: string, teacherID: string, meetingCode: string) {
    var classID = this.usedStorage.getItem('classID');
    const postObject = {
      tables: 'meetings',
      values: {
        ID: uniqID,
        ClassID: classID,
        TeacherID: teacherID,
        MeetingCode: meetingCode,
      },
    };
    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateParticipantCount(sessionID: string, participants: number) {
    const postObject = {
      tables: 'meetings',
      values: {
        Participants: participants,
      },
      conditions: {
        WHERE: {
          ID: sessionID,
        },
      },
    };
    const observable$: Subscription = this.post('update_entry', {
      data: JSON.stringify(postObject),
    }).subscribe(() => observable$.unsubscribe());
  }

  loadMeetingSessions() {
    const month = new Date().getMonth();
    const postObject = {
      selectors: [
        'classes.Class,meetings.*, teachers.FirstName, teachers.LastName',
      ],
      tables: 'meetings, teachers, classes',
      conditions: {
        WHERE: {
          'meetings.TeacherID': 'teachers.ID',
          'meetings.ClassID': 'classes.ID',
          'EXTRACT(MONTH FROM meetings.StartTime)': month + 1,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  loadWordSearches() {
    const postObject = {
      selectors: ['*'],
      tables: 'word_searches',
      conditions: {
        'WHERE FILE': 'IS NOT NULL',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
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
    }).subscribe((data) => {
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

  getMeeting(studentID: string) {
    const classID = this.usedStorage.getItem('classID');

    const postObject = {
      selectors: ['meetings.*,courses.*'],
      tables: 'meetings, student_classes,classes,courses',
      conditions: {
        WHERE: {
          'courses.ID': 'classes.CourseID',
          'classes.ID': 'meetings.ClassID',
          'student_classes.ClassID': 'meetings.ClassID',
          'meetings.ClassID': classID,
          'student_classes.StudentID': studentID,
        },
        AND: 'meetings.EndTime IS NULL',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
    // return this.post('get_meeting', {
    //   'StudentID': studentID,
    //   'ClassID': classID,
    // });
  }

  endMeeting(teacherID: string) {
    return this.post('end_meeting', {
      TeacherID: teacherID,
    });
  }

  returnSuccess(data: any, errorMsg: string) {
    if (data.success) {
      return data.output;
    } else {
      this.failedSnackbar(errorMsg);
      return new Array<any>();
    }
  }

  logout() {
    if (!this.isLoggedIn()) {
      return;
    }
    const rememberMe = this.isLocalStorage();
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

  randomCourseCover(language: string) {
    var list: any = [];
    var folder: string = '';
    switch (language) {
      case 'english':
        list = [
          'english (1).jpg',
          'english (2).jpg',
          'english (3).jpg',
          'english (4).jpg',
          'english (5).jpg',
          'english (6).jpg',
          'english (7).jpg',
          'english (8).jpg',
        ];
        folder = 'english';
        break;
      case 'french':
        list = [
          'french (1).jpg',
          'french (2).jpg',
          'french (3).jpg',
          'french (4).jpg',
          'french (5).jpg',
        ];
        folder = 'french';
        break;
      case 'japanese':
        list = [
          'japanese (1).jpg',
          'japanese (4).jpg',
          'japanese (5).jpg',
          'japanese (6).jpg',
          'japanese (7).jpg',
          'japanese (8).jpg',
          'japanese (9).jpg',
        ];
        folder = 'japanese';
    }
    const random = Math.floor(Math.random() * list.length);
    return 'assets/coursecovers/' + folder + '/' + list[random];
  }

  openFile(file: string) {
    const modalOptions: NgbModalOptions = {
      centered: false,
      size: 'lg',
      windowClass: 'viewer-window',
      // You can add other options here if needed
    };

    const modalRef = this.modalService.open(ViewerComponent, modalOptions);
    modalRef.componentInstance.link = environment.server + '/' + file; // Pass the custom class name
    // console.log(environment.server + '/' + file);
  }

  openLocalFile(file: string) {
    const modalOptions: NgbModalOptions = {
      centered: false,
      size: 'lg',
      windowClass: 'viewer-window',
      // You can add other options here if needed
    };

    const modalRef = this.modalService.open(ViewerComponent, modalOptions);
    modalRef.componentInstance.link = `${this.localServer}/${file}`; // Pass the custom class name
    // console.log(environment.server + '/' + file);
  }

  checkInputs(inputs: Array<any>) {
    for (let input of inputs) {
      if (input == '' || input == undefined || input == null) {
        return false;
      }
    }
    return true;
  }

  checkAtLeastOneInput(inputs: Array<any>) {
    for (let input of inputs) {
      if (input != '' && input != undefined && input != null) {
        return true;
      }
    }
    return false;
  }

  createTask(
    courseID: string,
    title: string,
    description: string,
    deadline: string,
    attachments?: string
  ) {
    var attach = {};
    if (attachments != undefined) {
      attach = { Attachments: attachments };
    }

    const postObject = {
      tables: 'assignments',
      values: Object.assign(
        {},
        {
          CourseID: courseID,
          Title: title,
          Details: description,
          Deadline: deadline,
        },
        attach
      ),
    };
    return this.post('create_entry', {
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
    return this.post('get_entries', {
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
          // 'courses.ID' :'assignments.CourseID',
          // 'courses.LanguageID' : 'languages.ID',
          // 'classes.CourseID' : 'courses.ID',
          // 'student_classes.ClassID': 'classes.ID',
          'student_classes.StudentID': id,
        },
        'GROUP BY':
          'assignments.ID, courses.ID, languages.ID,classes.ID, student_classes.ID',
      },
    };
    return this.post('get_entries', {
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
    return this.post('get_entries', {
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
    return this.post('get_entries', {
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
    return this.post('create_entry', {
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
    return this.post('get_entries', {
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
    return this.post('get_entries', {
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
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  createQuiz(
    CourseID: string,
    ID: string,
    title: string,
    details: string,
    timelimit: number,
    deadline: string,
    attachments?: string,
    settings?: string
  ) {
    var attach = {};
    if (attachments != undefined) {
      attach = { Attachments: attachments };
    }

    var det = '[NONE]';
    if (details.trim() != '') {
      det = details;
    }

    var sett = {};
    if (settings != undefined) {
      sett = { Settings: settings };
    }

    const postObject = {
      tables: 'assessments',
      values: Object.assign(
        {},
        {
          CourseID: CourseID,
          ID: ID,
          Title: title,
          Details: det,
          Timelimit: timelimit,
          Deadline: deadline,
        },
        attach,
        sett
      ),
    };
    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  createQuizItem(
    QuizID: string,
    type: string,
    question: string,
    answer: string,
    options?: string
  ) {
    var opt = {};
    if (options != undefined) {
      opt = { Options: options };
    }
    const postObject = {
      tables: 'assessment_items',
      values: Object.assign(
        {},
        {
          AssessmentID: QuizID,
          Question: question,
          Type: type,
          Answer: answer,
        },
        opt
      ),
    };
    // console.log(postObject);
    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  deleteLesson(lessonID: string) {
    const postObject = {
      tables: 'lessons',
      conditions: {
        WHERE: {
          ID: lessonID,
        },
      },
    };
    return this.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  deleteQuiz(quizID: string) {
    const postObject = {
      tables: 'assessments',
      conditions: {
        WHERE: {
          ID: quizID,
        },
      },
    };
    return this.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  teacherGetQuizzes() {
    const id = this.getUserData().id;
    const postObject = {
      selectors: ['assessments.*', 'COUNT(assessment_items.ID) as items'],
      tables: 'assessments',
      conditions: {
        'LEFT JOIN courses': 'ON assessments.CourseID = courses.ID',
        'LEFT JOIN assessment_items':
          'ON assessment_items.AssessmentID = assessments.ID',
        WHERE: {
          'courses.TeacherID': id,
        },
        'GROUP BY': 'assessments.ID',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  studentGetQuizzes() {
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'assessments.*',
        'courses.course',
        'languages.Language',
        'COUNT(student_assessments.ID) as done',
      ],
      tables: 'assessments',
      conditions: {
        'LEFT JOIN courses': 'ON assessments.CourseID = courses.ID',
        'LEFT JOIN languages': 'ON courses.LanguageID = languages.ID',
        'LEFT JOIN classes': 'ON classes.CourseID = courses.ID',
        'LEFT JOIN student_classes': 'ON student_classes.ClassID = classes.ID',
        'LEFT JOIN student_assessments': `ON student_assessments.StudentID = '${id}' AND student_assessments.AssessmentID = assessments.ID`,
        WHERE: {
          'student_classes.StudentID': id,
        },
        'GROUP BY':
          'assessments.ID, courses.ID, languages.ID,classes.ID, student_classes.ID',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
    // const id = this.getUserData().id;
    // const postObject = {
    //   'selectors':[
    //     'assessments.*',
    //     'courses.course',
    //     'languages.Language'
    //   ],
    //   'tables':'assessments,courses,languages, classes, student_classes',
    //   'conditions':{
    //     'WHERE':{
    //       'courses.ID' :'assessments.CourseID' ,
    //       'classes.CourseID' : 'courses.ID',
    //       'courses.LanguageID' : 'languages.ID',
    //       'student_classes.ClassID': 'classes.ID',
    //       'student_classes.StudentID': id,
    //     }
    //   }
    // }
    // return this.post('get_entries', {
    //   'data': JSON.stringify(postObject),
    // });
  }

  getFullName() {
    const user = this.getUserData();
    return user.firstname + ' ' + user.lastname;
  }

  teacherGradeTask(submissionID: string, grade: string, comment?: string) {
    const id = this.getUserData().id;
    var _comment: any = {};
    if (comment) {
      _comment = {
        Feedback: comment,
      };
    }
    const postObject = {
      tables: 'student_assignments',
      values: Object.assign(
        {
          Grade: grade,
        },
        _comment
      ),
      conditions: {
        WHERE: {
          ID: submissionID,
        },
      },
    };
    return this.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  studentQuizPoints() {
    const id = this.getUserData().id;
    const postObject = {
      selectors: ['student_assessments.*'],
      tables: 'student_assessments',
      conditions: {
        WHERE: {
          'student_assessments.StudentID': id,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  studentGetQuiz(taskID: string) {
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'assessments.*',
        'assessment_items.*',
        'teachers.ID as teacherid',
      ],
      tables:
        'assessments,assessment_items,courses, classes,teachers ,student_classes',
      conditions: {
        WHERE: {
          'courses.TeacherID': 'teachers.ID',
          'courses.ID': 'assessments.CourseID',
          'assessment_items.AssessmentID': 'assessments.ID',
          'assessments.ID': taskID,
          'classes.CourseID': 'courses.ID',
          'student_classes.ClassID': 'classes.ID',
          'student_classes.StudentID': id,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  escapeHtml(input: string) {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  pushNotifications(title: string, message: string, recipientID: string) {
    const id = this.getUserData()?.id;
    const postObject = {
      tables: 'notifications',
      values: {
        SenderID: id?? 'Anonymous',
        RecipientID: recipientID,
        Title: title,
        Message: message,
        Status: 'not_seen',
      },
    };

    const obs$ = this.post('create_entry', {
      data: JSON.stringify(postObject),
    }).subscribe((data: any) => {
      this.socketSend({
        app: 'quanlab',
        type: 'notification',
        sender: this.getUserData() != null ?
          this.getUserData().firstname + ' ' + this.getUserData().lastname : 'Anonymous',
        from:  id?? 'Anonymous',
        to: recipientID,
        title: title,
        message: title,
      });
      obs$.unsubscribe();
    });
  }

  getNotifications() {
    var id = this.getUserData().id;
    if (this.getUserType() == '2') {
      id = '[--administrator--]';
    }
    const postObject = {
      selectors: ['*'],
      tables: 'notifications',
      conditions: {
        WHERE: {
          'notifications.RecipientID': id,
        },
        'ORDER BY': 'notifications.Timestamp DESC',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  markAllAsInbox() {
    const id = this.getUserData().id;
    const postObject = {
      tables: 'notifications',
      values: {
        Status: 'inbox',
      },
      conditions: {
        WHERE: {
          RecipientID: id,
          Status: 'not_seen',
        },
      },
    };
    const obs$ = this.post('update_entry', {
      data: JSON.stringify(postObject),
    }).subscribe(() => {
      obs$.unsubscribe();
    });
  }

  markAllAsRead() {
    var id = this.getUserData().id;
    if(this.getUserType()=='2'){
      id = '[--administrator--]';
    }
    const postObject = {
      tables: 'notifications',
      values: {
        Status: 'seen',
      },
      conditions: {
        WHERE: {
          RecipientID: id,
        },
      },
    };
    const obs$ = this.post('update_entry', {
      data: JSON.stringify(postObject),
    }).subscribe(() => {
      obs$.unsubscribe();
    });
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
    const obs$ = this.post('update_entry', {
      data: JSON.stringify(postObject),
    }).subscribe(() => {
      obs$.unsubscribe();
    });
  }

  notifyStudentsInCourse(title: string, message: string, courseID: string) {
    const id = this.getUserData().id;
    const postObject = {
      selectors: ['student_classes.*'],
      tables: 'courses,classes, student_classes',
      conditions: {
        WHERE: {
          'courses.ID': courseID,
          'courses.TeacherID': id,
          'classes.CourseID': 'courses.ID',
          'classes.ID': 'student_classes.ClassID',
        },
      },
    };
    const obs$ = this.post('get_entries', {
      data: JSON.stringify(postObject),
    }).subscribe((data) => {
      for (let student of data.output) {
        this.pushNotifications(title, message, student.studentid);
      }
      obs$.unsubscribe();
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
    const obs$ = this.post('get_entries', {
      data: JSON.stringify(postObject),
    }).subscribe((data) => {
      // console.log(data);
      if (data.success) {
        for (let student of data.output) {
          this.pushNotifications(title, message, student.id);
        }
      } else {
        this.failedSnackbar('Error notifying participants');
      }
      obs$.unsubscribe();
    });
  }

  sendMessage(message: string, recipientID: string) {
    const id = this.getUserData().id;
    const postObject = {
      tables: 'messages',
      values: {
        SenderID: id,
        RecipientID: recipientID,
        Message: message,
        Status: 'not_seen',
      },
    };

    const obs$ = this.post('create_entry', {
      data: JSON.stringify(postObject),
    }).subscribe((data: any) => {
      this.socketSend({
        app: 'quanlab',
        type: 'messaging',
        sender:
          this.getUserData().firstname + ' ' + this.getUserData().lastname,
        from: id,
        to: recipientID,
        message: message,
      });
      obs$.unsubscribe();
    });
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
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  searchStudentInQuiz(search: string, id: string) {
    const postObject = {
      selectors: [
        'students.ID, students.FirstName, students.LastName, students.LastSeen, students.VisibleID, students.Profile,TotalPoints, TakenPoints',
      ],
      tables: 'students, student_assessments',
      conditions: {
        WHERE: {
          'students.ID': 'student_assessments.StudentID',
          'student_assessments.AssessmentID': id,
        },
        "AND lower(concat(students.FirstName,' ',students.LastName))": `LIKE '%${search}%'`,
        'ORDER BY': `students.FirstName`,
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  teacherGetStudentQuizzes() {
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'students.FirstName',
        'students.LastName',
        'assessments.title',
        'student_assessments.*',
      ],
      tables: 'students,student_assessments, assessments, courses',
      conditions: {
        WHERE: {
          'student_assessments.AssessmentID': 'assessments.ID',
          'student_assessments.StudentID': 'students.ID',
          'assessments.CourseID': 'courses.ID',
          'courses.TeacherID': id,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  teacherGetLabQuizzes() {
    const postObject = {
      selectors: [
        'students.FirstName',
        'students.LastName',
        'speech_labs.Name as lab',
        'speech_lessons.Description as lesson',
        'speech_quizzes.*',
      ],
      tables:
        'students, speech_quizzes, speech_lessons, speech_lab_computers, speech_labs',
      conditions: {
        WHERE: {
          'speech_quizzes.LessonID': 'speech_lessons.ID',
          'speech_lab_computers.Address': 'students.VisibleID',
          'speech_labs.ID': 'speech_lab_computers.LabID',
          'students.ID': 'speech_quizzes.StudentID',
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  checkStudentLabAttempt() {
    const id = this.getUserData().id;
    const lessonID = this.currentLabLesson;
    const postObject = {
      selectors: [
        'speech_labs.Name as lab',
        'speech_lessons.Description as lesson',
        'speech_quizzes.*',
      ],
      tables:
        'students, speech_quizzes, speech_lessons, speech_lab_computers, speech_labs',
      conditions: {
        WHERE: {
          'speech_quizzes.LessonID': 'speech_lessons.ID',
          'speech_lab_computers.Address': 'students.VisibleID',
          'speech_labs.ID': 'speech_lab_computers.LabID',
          'students.ID': 'speech_quizzes.StudentID',
          'speech_lessons.ID': lessonID,
          'students.ID ': id,
        },
      },
    };
    console.log(postObject);
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getConversations() {
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'students.ID, students.FirstName, students.LastName, students.LastSeen, students.VisibleID, students.Profile',
        'MAX(timestamp) as timestamp',
      ],
      tables: 'students, messages',
      conditions: {
        WHERE: {
          'messages.RecipientID': id,
          'messages.SenderID': 'students.ID',
        },
        OR: `messages.SenderID = '${id}' AND messages.RecipientID = students.ID`,
        'GROUP BY': 'students.ID',
        'UNION ALL': `SELECT teachers.ID, teachers.FirstName, teachers.LastName, teachers.LastSeen, teachers.VisibleID, teachers.Profile
          , MAX(timestamp) as timestamp
           FROM teachers, messages
            WHERE
              messages.RecipientID = '${id}' AND messages.SenderID =teachers.ID 
                OR
              messages.RecipientID = teachers.ID AND messages.SenderID = '${id}'
              GROUP BY teachers.ID
        `,
        'ORDER BY': 'timestamp DESC',
      },
    };
    const obs$ = this.post('get_entries', {
      data: JSON.stringify(postObject),
    }).subscribe(async (data) => {
      const convos = [];
      for (let convo of data.output) {
        const otherID = convo.id;
        const message = await firstValueFrom(this.getLastMessage(otherID));
        const lastConvo = message.output[0];
        convo.lastmessageref = lastConvo;
        convo.lastmessage =
          lastConvo.senderid == id
            ? 'You: ' + lastConvo.message
            : lastConvo.message;
        // const last$ =  this.getLastMessage(otherID).subscribe(message=>{
        //   const lastConvo = message.output[0]
        //   convo.lastmessage = lastConvo.senderid == id ? 'You: ' + lastConvo.message : lastConvo.message;
        //   last$.unsubscribe();
        // })
        convo.lastseen = this.parseDateFromNow(convo.lastseen);
        convos.push(convo);
      }
      this.convos = convos;
      obs$.unsubscribe();
    });
  }

  getLastMessage(themID: string) {
    const id = this.getUserData().id;
    const postObject = {
      selectors: ['*'],
      tables: 'messages',
      conditions: {
        WHERE: {
          'messages.RecipientID': id,
          'messages.SenderID': themID,
        },
        OR: `messages.SenderID = '${id}' AND messages.RecipientID = '${themID}'`,
        'ORDER BY': 'timestamp DESC',
        LIMIT: '1',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  messsagesMarkAllAsRead(otherID: string) {
    const id = this.getUserData().id;
    const postObject = {
      tables: 'messages',
      values: {
        Status: 'seen',
      },
      conditions: {
        WHERE: {
          RecipientID: id,
          SenderID: otherID,
        },
      },
    };
    const obs$ = this.post('update_entry', {
      data: JSON.stringify(postObject),
    }).subscribe(() => {
      obs$.unsubscribe();
    });
  }

  getMessages(themID: string) {
    const id = this.getUserData().id;
    const postObject = {
      selectors: ['*'],
      tables: 'messages',
      conditions: {
        WHERE: {
          'messages.RecipientID': id,
          'messages.SenderID': themID,
        },
        OR: `messages.SenderID = '${id}' AND messages.RecipientID = '${themID}'`,
        'ORDER BY': 'timestamp ASC',
      },
    };
    const obs$ = this.post('get_entries', {
      data: JSON.stringify(postObject),
    }).subscribe((data) => {
      this.messsagesMarkAllAsRead(themID);
      this.messages = data.output;
      obs$.unsubscribe();
    });
  }

  async checkMaxRegistrations() {
    const postObject = {
      selectors: ['Value'],
      tables: 'admin_options',
      conditions: {
        WHERE: {
          Type: 'max_students',
        },
      },
    };
    const max = Number(
      (
        await firstValueFrom(
          this.post('get_entries', {
            data: JSON.stringify(postObject),
          })
        )
      ).output[0].value
    );

    const postObject2 = {
      selectors: ['COUNT(*) as value'],
      tables: 'students',
    };
    const count = Number(
      (
        await firstValueFrom(
          this.post('get_entries', {
            data: JSON.stringify(postObject2),
          })
        )
      ).output[0].value
    );

    return max > count;
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
    return this.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  // sendBugReport(title:string, message:string, type:string){
  //   const name =  this.getFullName();
  //   const postObject = {
  //     tables: 'bug_reports',
  //     values: {
  //       Title: title,
  //       Description: message,
  //       type: type,
  //       Sender: name,
  //     },
  //   };
  //   return this.post('create_entry', {
  //     data: JSON.stringify(postObject),
  //   });
  // }

  getQuizAverage(quizID: string) {
    const postObject = {
      selectors: ['(AVG(TakenPoints)/AVG(TotalPoints)) as average'],
      tables: 'student_assessments',
      conditions: {
        WHERE: {
          AssessmentID: quizID,
        },
        'GROUP BY': 'AssessmentID',
      },
    };

    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  async checkIfOffline(lessonID: string) {
    const postObject = {
      selectors: ['*'],
      tables: 'modules',
      conditions: {
        WHERE: {
          ID: lessonID,
        },
      },
    };

    const found = await firstValueFrom(
      this.localPost('get_entries', {
        data: JSON.stringify(postObject),
      })
    );

    return found.output.length;
  }

  getBaseAsync(file: Blob): Observable<string> {
    return new Observable((obs) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        obs.next(base64String);
        obs.complete();
      };
      reader.readAsDataURL(file);
    });
  }

  // LOCAL SAVES
  public downloadProgress$: Subject<number> = new Subject<number>();
  downloadCourses() {
    if (this.getUserType() != '0') return;
    const id = this.getUserData().id;
    const postObject = {
      selectors: [
        'teachers.FirstName',
        'teachers.LastName',
        'courses.Course',
        'lessons.*',
      ],
      tables: 'teachers,courses,classes, student_classes,lessons',
      conditions: {
        WHERE: {
          'student_classes.StudentID': id,
          'classes.ID': 'student_classes.ClassID',
          'courses.ID': 'classes.CourseID',
          'courses.TeacherID': 'teachers.ID',
          'lessons.CourseID': 'courses.ID',
        },
      },
    };
    const download$ = this.post('get_entries', {
      data: JSON.stringify(postObject),
    }).subscribe(async (data) => {
      let i = 1;
      for (let module of data.output) {
        if (await this.checkIfOffline(module.id)) {
          this.downloadProgress$.next((i / data.output.length) * 100);
          i += 1;
          continue;
        }
        if (module.attachments) {
          const link = module.attachments.split('>')[0];
          const file = await firstValueFrom(
            this.http.get(this.getURL(link), { responseType: 'blob' })
          );
          // console.log(file);
          const base = await firstValueFrom(this.getBaseAsync(file));
          await firstValueFrom(
            this.http.post(`${this.localServer}:3000` + '/filehandler', {
              key: environment.socketKey,
              method: 'create_url',
              file_content: base,
              search_key: link,
            })
          );
          // const reader = new FileReader();

          // reader.onloadend = () => {
          //   const base64String = (reader.result as string).split(',')[1];

          // };
          // reader.readAsDataURL(file);
        }

        const postObject2 = {
          tables: 'modules',
          values: {
            StudentID: id,
            CourseID: module.courseid,
            Course: module.course,
            Title: module.title,
            Details: module.details,
            Attachments: module.attachments,
            Difficulty: Number(module.difficulty),
            Time: module.time,
            ID: Number(module.id),
          },
        };
        await firstValueFrom(
          this.localPost('create_entry', {
            data: JSON.stringify(postObject2),
          })
        );

        this.downloadProgress$.next((i / data.output.length) * 100);
        i += 1;
      }
      download$.unsubscribe();
    });
  }

  loadOffline() {
    const id = this.getUserData().id;
    var user = {};
    if (id) {
      user = {
        StudentID: id,
      };
    }
    const postObject = {
      selectors: ['modules.*'],
      tables: 'modules',
      conditions: {
        WHERE: Object.assign(
          {
            '1': '1',
          },
          user
        ),
      },
    };
    return this.localPost('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  async uploadFileAsync(file: File, location: string) {
    const base = await firstValueFrom(this.getBaseAsync(file));
    await firstValueFrom(
      this.http.post(environment.nodeserver + '/filehandler', {
        key: environment.socketKey,
        method: 'create_url',
        file_content: base,
        search_key: location,
      })
    );
  }

  uploadJson(json: string, name: string) {
    const base64String = btoa(unescape(encodeURIComponent(json)));
    this.http
      .post(environment.nodeserver + '/filehandler', {
        key: environment.socketKey,
        method: 'create_url',
        file_content: base64String,
        search_key: name,
      })
      .subscribe();
  }
  // SPEECH LAB

  /*
    TABLES
    DROP TABLE IF EXISTS speech_lessons;
    DROP TABLE IF EXISTS speech_modules;
    DROP TABLE IF EXISTS speech_lab_computers;
    DROP TABLE IF EXISTS speech_labs;

      CREATE TABLE speech_labs(
        Name varchar(255) NOT NULL,
        ID serial NOT NULL,
        Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (ID)
      );

      INSERT INTO speech_labs VALUES('Speech Lab 1');
      INSERT INTO speech_labs VALUES('Speech Lab 2');

      CREATE TABLE speech_modules(
        LabID int NOT NULL,
        Name varchar(255) NOT NULL,
        Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ID varchar(32) NOT NULL,
        PRIMARY KEY (ID),
        FOREIGN KEY (LabID) REFERENCES speech_labs(ID) ON DELETE CASCADE
      );
      CREATE TABLE speech_lessons(
        ModuleID varchar(32) NOT NULL,
        Name varchar(255) NOT NULL,
        LessonFile varchar(255) NOT NULL,
        QuizFile varchar(255) NOT NULL,
        LessonType varchar(100) NOT NULL,
        Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ID varchar(32) NOT NULL,
        PRIMARY KEY (ID),
        FOREIGN KEY (ModuleID) REFERENCES speech_modules(ID) ON DELETE CASCADE
      );

      CREATE TABLE speech_lab_computers(
        LabID int NOT NULL,
        Name varchar(255) NOT NULL,
        Address varchar(255) NOT NULL,
        Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ID varchar(32) NOT NULL,
        PRIMARY KEY (ID),
        FOREIGN KEY (LabID) REFERENCES speech_labs(ID) ON DELETE CASCADE
      );
  */

  createSpeechModule(name: string, practice: boolean = false) {
    const id = this.createID32();
    const postObject = {
      tables: practice ? 'speech_practices' : 'speech_modules',
      values: {
        Name: name,
        ID: id,
      },
    };
    console.log(postObject);
    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  editSpeechModule(id: string, name: string, practice: boolean = false) {
    const postObject = {
      tables: practice ? 'speech_practices' : 'speech_modules',
      values: {
        Name: name,
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

  deleteSpeechModule(id: string, practice: boolean = false) {
    const postObject = {
      tables: practice ? 'speech_practices' : 'speech_modules',
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  async createSpeechLesson(
    moduleID: string,
    name: string,
    description: string,
    lessonType: string,
    lessonFile?: File,
    jsonQuiz?: File,
    practice: boolean = false
  ) {
    var lessonDrillObj = {};
    var quizAudioObj = {};
    if (lessonFile) {
      const lessonFileExt = lessonFile.name.split('.').pop();
      const videoFileExtensions = [
        '.mp4',
        '.mov',
        '.avi',
        '.mkv',
        '.wmv',
        '.flv',
        '.webm',
        '.mpg',
        '.mpeg',
        '.3gp',
        '.m4v',
        '.ogv',
        '.ts',
        '.vob',
        '.swf',
        '.rm',
        '.rmvb',
        '.m2ts',
        '.asf',
        '.divx',
        '.m2v',
        '.mpg2',
        '.mpg4',
        '.mxf',
        '.f4v',
        '.h264',
        '.h265',
      ];

      if (
        lessonFileExt != 'pdf' &&
        !videoFileExtensions.includes(`.${lessonFileExt}`)
      ) {
        this.failedSnackbar(`Invalid ${practice ? 'Drill' : 'Lesson'} File!`);
        return;
      }

      const lessonDir = `modules/${this.createID36()}.${lessonFileExt}`;
      await this.uploadFileAsync(lessonFile, lessonDir);

      lessonDrillObj = practice
        ? { DrillFile: `${lessonDir}>${lessonFile.name}` }
        : { LessonFile: `${lessonDir}>${lessonFile.name}` };
    }

    if (jsonQuiz) {
      const quizFileExt = jsonQuiz.name.split('.').pop();
      if (practice ? quizFileExt != 'mp3' : quizFileExt != 'json') {
        this.failedSnackbar(`Invalid ${practice ? 'Audio' : 'JSON'} File!`);
        return;
      }
      const quizDir = `modules/${this.createID36()}.${quizFileExt}`;

      await this.uploadFileAsync(jsonQuiz, quizDir);

      quizAudioObj = practice
        ? { AudioFile: `${quizDir}>${jsonQuiz.name}` }
        : { QuizFile: `${quizDir}>${jsonQuiz.name}` };
    }

    const id = this.createID32();
    const postObject = {
      tables: practice ? 'speech_drills' : 'speech_lessons',
      values: Object.assign(
        {
          // Name: name,
          ID: id,
          Description: description,
        },
        lessonDrillObj,
        quizAudioObj,
        practice
          ? {
              PracticeID: moduleID,
            }
          : {
              ModuleID: moduleID,
              LessonType: lessonType,
            }
      ),
    };
    return await firstValueFrom(
      this.post('create_entry', {
        data: JSON.stringify(postObject),
      })
    );
  }

  async updateSpeechLesson(
    lessonID: string,
    moduleID: string,
    name: string,
    description: string,
    lessonType: string,
    lessonFile?: File,
    jsonQuiz?: File,
    practice: boolean = false
  ) {
    var lessonDrillObj = {};
    var quizAudioObj = {};
    if (lessonFile) {
      const lessonFileExt = lessonFile.name.split('.').pop();
      const videoFileExtensions = [
        '.mp4',
        '.mov',
        '.avi',
        '.mkv',
        '.wmv',
        '.flv',
        '.webm',
        '.mpg',
        '.mpeg',
        '.3gp',
        '.m4v',
        '.ogv',
        '.ts',
        '.vob',
        '.swf',
        '.rm',
        '.rmvb',
        '.m2ts',
        '.asf',
        '.divx',
        '.m2v',
        '.mpg2',
        '.mpg4',
        '.mxf',
        '.f4v',
        '.h264',
        '.h265',
      ];

      if (
        lessonFileExt != 'pdf' &&
        !videoFileExtensions.includes(`.${lessonFileExt}`)
      ) {
        this.failedSnackbar(`Invalid ${practice ? 'Drill' : 'Lesson'} File!`);
        return;
      }

      const lessonDir = `modules/${this.createID36()}.${lessonFileExt}`;
      await this.uploadFileAsync(lessonFile, lessonDir);

      lessonDrillObj = practice
        ? { DrillFile: `${lessonDir}>${lessonFile.name}` }
        : { LessonFile: `${lessonDir}>${lessonFile.name}` };
    }

    if (jsonQuiz) {
      const quizFileExt = jsonQuiz.name.split('.').pop();
      if (practice ? quizFileExt != 'mp3' : quizFileExt != 'json') {
        this.failedSnackbar(`Invalid ${practice ? 'Audio' : 'JSON'} File!`);
        return;
      }
      const quizDir = `modules/${this.createID36()}.${quizFileExt}`;

      await this.uploadFileAsync(jsonQuiz, quizDir);

      quizAudioObj = practice
        ? { AudioFile: `${quizDir}>${jsonQuiz.name}` }
        : { QuizFile: `${quizDir}>${jsonQuiz.name}` };
    }

    const postObject = {
      tables: practice ? 'speech_drills' : 'speech_lessons',
      values: Object.assign(
        {
          // Name: name,
          description: description,
        },
        lessonDrillObj,
        quizAudioObj,
        practice
          ? {
              PracticeID: moduleID,
            }
          : {
              ModuleID: moduleID,
              LessonType: lessonType,
            }
      ),
      conditions: {
        WHERE: {
          ID: lessonID,
        },
      },
    };
    console.log(postObject);
    return await firstValueFrom(
      this.post('update_entry', {
        data: JSON.stringify(postObject),
      })
    );
  }

  deleteSpeechLesson(id: string, practice: boolean = false) {
    const postObject = {
      tables: practice ? 'speech_drills' : 'speech_lessons',
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  loadSpeechLabs() {
    const postObject = {
      selectors: ['*'],
      tables: 'speech_labs',
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  loadSpeechAllModules(practice: boolean = false) {
    const postObject = {
      selectors: practice ? ['speech_practices.*'] : ['speech_modules.*'],
      tables: practice ? 'speech_practices' : 'speech_modules',
      conditions: {
        'ORDER BY': practice
          ? 'speech_practices.timestamp'
          : 'speech_modules.timestamp',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }
  loadSpeechLessons(moduleID: string, practice: boolean = false) {
    const postObject = {
      selectors: practice
        ? ['speech_drills.*, speech_practices.name as practice']
        : ['speech_lessons.*, speech_modules.name as module'],
      tables: practice
        ? 'speech_drills, speech_practices'
        : 'speech_lessons, speech_modules',
      conditions: {
        WHERE: practice
          ? {
              'speech_drills.PracticeID': moduleID,
              'speech_practices.ID': 'speech_drills.PracticeID',
            }
          : {
              'speech_lessons.ModuleID': moduleID,
              'speech_modules.ID': 'speech_lessons.ModuleID',
            },
        'ORDER BY': practice
          ? 'speech_drills.timestamp'
          : 'speech_lessons.timestamp',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  loadSpeechAllLessons(practice: boolean = false) {
    const postObject = {
      selectors: practice
        ? ['speech_drills.*, speech_practices.name as practice']
        : ['speech_lessons.*, speech_modules.name as module'],
      tables: practice
        ? 'speech_drills, speech_practices'
        : 'speech_lessons, speech_modules',
      conditions: {
        WHERE: practice
          ? {
              'speech_practices.ID': 'speech_drills.PracticeID',
            }
          : {
              'speech_modules.ID': 'speech_lessons.ModuleID',
            },
        'ORDER BY': practice
          ? 'speech_drills.timestamp'
          : 'speech_lessons.timestamp',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  // Configurtion

  changeLocalAddress(ip_addr: string) {
    const postObject = {
      tables: 'admin_options',
      values: {
        Value: ip_addr,
      },
      conditions: {
        WHERE: {
          Type: 'local_server',
        },
      },
    };
    return this.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  async changePCAddress(speechLabId: string, pc: any) {
    if (pc.id != null) {
      const postObject = {
        tables: 'speech_lab_computers',
        values: {
          Address: pc.ip,
        },
        conditions: {
          WHERE: {
            ID: pc.id,
          },
        },
      };
      console.log(postObject);
      const obs$ = this.post('update_entry', {
        data: JSON.stringify(postObject),
      }).subscribe(() => {
        // this.successSnackbar('Successfully changed address!')
        obs$.unsubscribe();
      });
    } else {
      const postObject = {
        tables: 'speech_lab_computers',
        values: {
          Address: pc.ip,
          LabID: speechLabId,
          Name: pc.label,
          ID: this.createID32(),
        },
      };
      console.log(postObject);
      const obs$ = this.post('create_entry', {
        data: JSON.stringify(postObject),
      }).subscribe(() => {
        // this.successSnackbar('Successfully changed address!')
        obs$.unsubscribe();
      });
    }
  }

  loadComputerAddresses() {
    const postObject = {
      selectors: ['*'],
      tables: 'speech_lab_computers',
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  async loadComputers() {
    var row1: any[] = [];
    var row2: any[] = [];
    var row3: any[] = [];
    let pcIndex = 1;
    // iterate to row 3
    for (let i = 0; i < 8; i++) {
      row3.push({
        id: null,
        label: `PC-${pcIndex}`,
        ip: '',
        icon: 'assets/monitor.png',
      });
      pcIndex += 1;
    }
    for (let i = 0; i < 9; i++) {
      row2.push({
        id: null,
        label: `PC-${pcIndex}`,
        ip: '',
        icon: 'assets/monitor.png',
      });
      pcIndex += 1;
    }
    for (let i = 0; i < 8; i++) {
      row1.push({
        id: null,
        label: `PC-${pcIndex}`,
        ip: '',
        icon: 'assets/monitor.png',
      });
      pcIndex += 1;
    }
    return [row1, row2, row3];
  }
  labID?: string;
  getStudentAssignedLab() {
    const id = this.getUserData().visibleid;
    const postObject = {
      selectors: [
        'speech_labs.ID as labid, speech_labs.name as lab, speech_lab_computers.*',
      ],
      tables: 'speech_labs, speech_lab_computers',
      conditions: {
        WHERE: {
          'speech_lab_computers.Address': id,
        },
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  // speechlab meet

  meeting: any;
  meetingID?: string;
  isMicOn = false;

  async initSpeechMeeting() {
    VideoSDK.config(environment.token);
    this.meeting = VideoSDK.initMeeting({
      meetingId: this.meetingID!, // required
      participantId: this.getUserData().visibleid,
      name: this.getFullName(), // required
      metaData: { who: this.getUserType(), id : this.getUserData().id, },
      micEnabled: this.getUserType() == '0', // optional, default: true
      webcamEnabled: false, // optional, default: true
    });
  }

  startSpeechMeeting(
    uniqID: string,
    teacherID: string,
    meetingCode: string,
    lab: string
  ) {
    const postObject = {
      tables: 'lab_meetings',
      values: {
        ID: uniqID,
        LabID: lab,
        TeacherID: teacherID,
        MeetingCode: meetingCode,
      },
    };
    return this.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  sessionID?: string;

  getOpenLabMeeting(lab:string){
    const postObject = {
      selectors: ['lab_meetings.*, teachers.Firstname, teachers.LastName,  speech_labs.Name as lab'],
      tables: 'lab_meetings, teachers, speech_labs',
      conditions: {
        WHERE: {
          'speech_labs.ID' : 'lab_meetings.LabID',
          'lab_meetings.LabID': lab,
          'teachers.ID' : 'lab_meetings.teacherid'
        },
        AND: 'lab_meetings.EndTime IS NULL',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getSpeechMeeting(studentID: string, lab: string) {
    const postObject = {
      selectors: ['lab_meetings.*'],
      tables: 'lab_meetings, speech_lab_computers, students',
      conditions: {
        WHERE: {
          'lab_meetings.LabID': 'speech_lab_computers.LabID',
          ' lab_meetings.LabID': lab,
          'speech_lab_computers.Address': 'students.VisibleID',
          'students.ID': studentID,
        },
        AND: 'lab_meetings.EndTime IS NULL',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }
  getTeacherMeeting() {
    const postObject = {
      selectors: ['lab_meetings.*'],
      tables: 'lab_meetings',
      conditions: {
        WHERE: {
          'lab_meetings.TeacherID': this.getUserData().id,
        },
        AND: 'lab_meetings.EndTime IS NULL',
      },
    };
    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  startLab(lab: string) {
    if (this.getUserType() == '0') {
      const obs = this.getSpeechMeeting(this.getUserData().id, lab).subscribe(
        (data) => {
          if (data.success) {
            if (data.output.length > 0) {
              this.validateSpeechMeeting(data.output[0].meetingcode);
            } else {
              this.failedSnackbar(
                'Please wait for your teacher to start.',
                2 + 1000
              );
            }
          }
          obs.unsubscribe();
        }
      );
    } else {
      const obs = this.endSpeechMeeting(this.getUserData().id).subscribe(() => {
        const obs2$ = this.getOpenLabMeeting(lab).subscribe(data=>{
          if(data.success){
            if(data.output.length > 0){
              this.failedSnackbar(`${data.output[0].firstname} ${data.output[0].lastname} is currently using ${data.output[0].lab}` )
            }else{
              this.createSpeechMeeting(lab);
            }
          }
          obs2$.unsubscribe();
        })
        obs.unsubscribe();
      });
    }
  }

  validateSpeechMeeting(meetingId: string) {
    const url = `https://api.videosdk.live/v2/rooms/validate/${meetingId}`;
    const headers = new HttpHeaders({
      authorization: environment.token,
      'Content-Type': 'application/json',
    });
    this.http
      .get<{ roomId: string }>(url, {
        headers,
      })
      .pipe(map((response) => response.roomId === meetingId))
      .subscribe(
        (isValid) => {
          if (isValid) {
            this.meetingID = meetingId;
            this.joinSpeechMeeting();
          } else {
            console.log('Room expired');
          }
        },
        (error) => {
          console.error('Failed to validate meeting:', error);
        }
      );
  }

  createSpeechMeeting(lab: string) {
    const apiUrl = 'https://api.videosdk.live/v2/rooms';
    const headers = new HttpHeaders({
      authorization: environment.token,
      'Content-Type': 'application/json',
    });
    this.http
      .post<{ roomId: string }>(apiUrl, {}, { headers })
      .pipe(map((response) => response.roomId))
      .subscribe(
        (roomid) => {
          this.meetingID = roomid;
          this.sessionID = this.createID32();
          this.startSpeechMeeting(
            this.sessionID,
            this.getUserData().id,
            this.meetingID,
            lab
          ).subscribe(
            (data) => {
              if (data.success) {
                // this.meetingHeader = `${this.API.meetingInfo.course} (${this.API.meetingInfo.class})`;
                // this.initSpeechMeeting();
                this.joinSpeechMeeting();
              }
            },
            (error) => {
              this.failedSnackbar(
                'Error while creating speech lab meet',
                2 + 1000
              );
            }
          );
        },
        (error) => {
          console.log(error);
        }
      );
  }

  joinSpeechMeeting() {
    this.initSpeechMeeting();
    // console.log('INIT',this.meeting);
    this.meeting.join();
    // console.log('Joined',this.meeting);
    this.handleMeetingEvents(this.meeting);
  }
  

  async distributeCertificates(courseid: string) {
    const postObject = {
      selectors: [
        'SUM(lessons_taken.Progress)',
        'COUNT(lessons.ID) as lessons',
        'courses.course',
        'student_classes.*',
        'COUNT(surveys.ID) as answered_survey'
      ],
      tables: 'courses',
      conditions: {
        'LEFT JOIN lessons': 'ON lessons.CourseID = courses.ID',
        'LEFT JOIN lessons_taken': 'ON lessons_taken.LessonID = lessons.ID',
        'LEFT JOIN classes': 'ON classes.CourseID = courses.ID',
        'LEFT JOIN student_classes' : 'ON student_classes.ClassID = classes.ID',
        'LEFT JOIN surveys' : 'ON surveys.StudentID = student_classes.StudentID',
        WHERE: {
          'courses.ID': courseid,
        },
        'GROUP BY': 'student_classes.ID, classes.ID, courses.ID',
      },
    };

    const response = await firstValueFrom(this.post('get_entries', {
      data: JSON.stringify(postObject),
    }));

    // return;

    if(!response.success) {
      this.failedSnackbar('Error distributing certificates!');
      return;
    };
    for(let student of response.output){
      if(student.answered_survey > 0){
        continue;
      }
      const progress = Number((Number(student.sum) / (Number(student.lessons) * 100)).toFixed(4))*100;
      if(progress >= 100){
        // push survey entry for students
        this.addSurveyEntryStudent(student.studentid, courseid);
        // student is legible for certificate
        this.pushNotifications(
          `[CERT]Claim your certificate for '${student.course}'`,
          `<b>${this.getFullName()}</b> has distributed the certificate for <b>'${student.course}</b>', complete the survey below to claim your certificate.[COURSEID]${courseid}`,
          student.studentid
        )
      }
    }
    
    
  }

  addSurveyEntryStudent(studentid:string, courseid:string){
    const postObject = {
      tables: 'surveys',
      values: {
        StudentID: studentid,
        CourseID: courseid,
      },
    };
    const record$ = this.post('create_entry', {
      data: JSON.stringify(postObject),
    }).subscribe(() => {
      record$.unsubscribe();
    });
  }

 async getSurveyEntryStudent(courseid:string){
    const postObject = {
      selectors: ['*'],
      tables: 'courses,teachers,surveys',
      conditions: {
        WHERE:  {
          StudentID: this.getUserData().id,
          CourseID: courseid,
          'courses.ID': 'surveys.CourseID',
          'teachers.ID': 'courses.TeacherID',
        }
      },
    };
    return (await firstValueFrom( this.post('get_entries', {
      data: JSON.stringify(postObject),
    }))).output[0];
  }

  async getAnsweredSurveyStudent(courseid:string){
    const postObject = {
      selectors: ['*'],
      tables: 'surveys,survey_items',
      conditions: {
        WHERE:  {
          'surveys.StudentID':  this.getUserData().id,
          'surveys.CourseID':  courseid,
          'surveys.ID' : 'survey_items.SurveyID'
        }
      },
    };
    return (await firstValueFrom( this.post('get_entries', {
      data: JSON.stringify(postObject),
    }))).output;
  }


  async uploadSurveyStudent( surveyid:string, survey:any[]){
    this.justSnackbar("Uploading survey...");
    var i = 0;
    for(let item of survey){
      i+=1
      var options = ''
      if(item.options){
        for (let option of item.options) {
          if(typeof option === 'object'){
            options += option.value  + '\\n\\n';
          }else{
            options += option + '\\n\\n';
          }
        }
      }

      const postObject = {
        tables: 'survey_items',
        values: {
          SurveyID: surveyid,
          ItemNo: i,
          Question: item.question,
          Type: item.type,
          Answer: item.answer,
          Options: options,
        },
      };
      await firstValueFrom(this.post('create_entry', {
        data: JSON.stringify(postObject),
      }));
    }

    this.successSnackbar("Thank you for answer the survey!");
  }  

  participantsAudio: Map<string, ParticipantObject> = new Map();
  // particpantID = this.getUserData().id;
  labMessages: Array<MessageObject> = [];

  micEnabled(stream: any, participant: any) {
    const mediaStream = new MediaStream();
    mediaStream.addTrack(stream.track);
    if (stream?.kind == 'audio') {
      if (participant.metaData.who == '1') {
        this.isMicOn = true;
        this.micLoading = false;
      }
      if (participant.id != this.getUserData().visibleid) {
        const np = new ParticipantObject(participant.displayName, mediaStream);
        if (participant.metaData.who == '1') {
          np.muted = false;
        }
        this.participantsAudio.set(participant.id, np);
      }
    }
  }
  micDisabled(stream: any, participant: any) {
    if (stream?.kind == 'audio') {
      this.participantsAudio.delete(participant.id);
      this.isMicOn = false;
      this.micLoading = false;
    }
  }

  micLoading = false;

  async toggleMic() {
    if (this.micLoading) return;
    if (this.isMicOn) {
      this.meeting.muteMic();
    } else {
      this.meeting.unmuteMic();
      this.micLoading = true;
    }
  }

  getCNSCPresident(){
    const postObject = {
      selectors: ['*'],
      tables: 'administrators',
      conditions: {
        WHERE :  {
          Role: 'doctor',
        },
      }
    };

    return this.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  endSpeechMeeting(teacherID: string) {
    var tzoffset = new Date().getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = new Date(Date.now() - tzoffset).toISOString();
    var time = localISOTime.slice(0, 19).replace('T', ' ');
    const postObject = {
      tables: 'lab_meetings',
      values: {
        EndTime: time,
      },
      conditions: {
        WHERE: {
          TeacherID: teacherID,
        },
        'AND EndTime IS ': 'NULL',
      },
    };
    return this.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  resetUI() {
    this.participantsAudio.clear();
    this.meeting = null;
    this.labMessages = [];
  }

  async recordSpeechLabAttendance(id:string){
    const checkObject = {
      selectors: ['*'],
      tables: 'speech_attendance',
      conditions: {
        WHERE :  {
          StudentID: id,
          MeetingID: this.sessionID
        },
      }
    };

    const  data = await firstValueFrom(this.post('get_entries', {
      data: JSON.stringify(checkObject),
    }));

    if(data.output.length > 0) return;

    const postObject = {
      tables: 'speech_attendance',
      values: {
        StudentID: id,
        MeetingID: this.sessionID
      },
    };
    const res = await firstValueFrom(this.post('create_entry', {
      data: JSON.stringify(postObject),
    }));

    // console.log(res);
  }

  handleMeetingEvents(meeting: any) {
    meeting.on('error', (data: any) => {
      const { code, message } = data;
      console.log('Error', code, message);
    });
    // // meeting joined event
    meeting.on('meeting-joined', () => {
      this.micDisabled(undefined, meeting.localParticipant);
    });

    meeting.localParticipant.on('stream-enabled', (stream: any) => {
      this.micEnabled(stream, meeting.localParticipant);
    });
    meeting.localParticipant.on('stream-disabled', (stream: any) => {
      this.micDisabled(stream, meeting.localParticipant);
    });

    // meeting left event
    meeting.on('meeting-left', () => {
      this.resetUI();
      if (this.getUserType() == '1') {
        const obs = this.endSpeechMeeting(this.getUserData().id).subscribe(
          () => {
            obs.unsubscribe();
          }
        );
      }
    });

    meeting.on('participant-joined',  async (participant: any)  => {
      // On teacher side ..
      if(this.getUserType() == '1'){
        // Record attendance of students
        if(participant.metaData.who != '1'){
          this.recordSpeechLabAttendance(participant.metaData.id);
        }
      }

      this.micDisabled(undefined, participant);
      participant.setQuality('med');

      participant.on('stream-enabled', (stream: any) => {
        this.micEnabled(stream, participant);
      });
      participant.on('stream-disabled', (stream: any) => {
        this.micDisabled(stream, participant);
      });
    });

    // participants left
    meeting.on('participant-left', (participant: any) => {
      this.participantsAudio.delete(participant.id);
      if (participant.metaData.who == '1') {
        this.endSpeechMeeting(participant.id).subscribe();
        this.meeting.end();
        this.resetUI();
      }
    });
    meeting.on('chat-message', (participantMessage: any) => {
      const { __, _, text } = participantMessage;
      const data = JSON.parse(text);
      // console.log(data);

      if (data.type == 'message') {
        const now = new Date();
        const time = now.toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        });
        this.labMessages.push(
          new MessageObject(
            data.senderID,
            data.senderName,
            data.message,
            time,
            data.profile
          )
        );
      } else if (data.type == 'direct-message') {
        if (data.to == this.getUserData().visibleid) {
          if (data.message != '') {
            this.successSnackbar(data.message);
          }
          if (data.action) {
            this.labNotifiier.next(data.action);
          }
          this.audio.play();
        }
      } else if (data.type == 'direct-action') {
        if (this.getUserData().visibleid == data.to) {
          this.labNotifiier.next(data.action);
        }
      } else if (data.type == 'reset') {
        if (this.getUserType() == '0' && this.labID == data.labid) {
          this.router.navigate(['/student/speechlab/lab']);
        }
      } else {
        // console.log(data.senderID ,this.getUserData().visibleid)
        if (data.action?.includes('select:')) {
          const content = data.action.split(':')[1];
          this.router.navigate([
            '/student/speechlab/practice1',
            { m: content.split(';')[0], q: content.split(';')[1] },
          ]);
          return;
        }
        if (
          data.senderID != this.getUserData().visibleid &&
          this.participantsAudio.get(data.senderID)
        ) {
          if (data.action == 'unmute') {
            const participant = this.participantsAudio.get(data.senderID);
            participant!.muted = false;
            this.participantsAudio.set(data.senderID, participant!);
            // console.log('Update',this.participantsAudio);
          }
          if (data.action == 'mute') {
            const participant = this.participantsAudio.get(data.senderID);
            participant!.muted = true;
            this.participantsAudio.set(data.senderID, participant!);
          }
          this.labNotifiier.next(data.action);
        }
      }
    });
  }
  labNotifiier = new BehaviorSubject<any>(null);

  sendLabMessage(message: string) {
    if (this.meeting == null) {
      return;
    }
    if (message.trim() != '') {
      this.meeting.sendChatMessage(
        JSON.stringify({
          senderID: this.getUserData().visibleid,
          senderName: this.getFullName(),
          message: message,
          profile: this.getUserData().profile,
          type: 'message',
        })
      );
    }
  }
  sendDirectLabMessage(message: string, destination: string, action: string) {
    if (this.meeting == null) {
      return;
    }
    // if(message.trim() != ''){
    this.meeting.sendChatMessage(
      JSON.stringify({
        senderID: this.getUserData().visibleid,
        senderName: this.getFullName(),
        message: message,
        profile: this.getUserData().profile,
        to: destination,
        action: action,
        type: 'direct-message',
      })
    );
    // }
  }

  sendLabAction(action: string) {
    this.meeting.sendChatMessage(
      JSON.stringify({
        senderID: this.getUserData().visibleid,
        senderName: this.getFullName(),
        profile: this.getUserData().profile,
        labid: this.labID,
        type: 'action',
        action: action,
      })
    );
  }

  resetStudents() {
    this.meeting.sendChatMessage(
      JSON.stringify({
        senderID: this.getUserData().visibleid,
        senderName: this.getFullName(),
        profile: this.getUserData().profile,
        labid: this.labID,
        type: 'reset',
      })
    );
  }

  sendDirectLabAction(action: string, destination: string) {
    this.meeting.sendChatMessage(
      JSON.stringify({
        senderID: this.getUserData().visibleid,
        senderName: this.getFullName(),
        profile: this.getUserData().profile,
        type: 'direct-action',
        to: destination,
        action: action,
      })
    );
  }

  leaveSpeechMeeting() {
    this.meeting?.leave();
    this.meeting = null;
    if (this.getUserType() == '1') {
      this.endSpeechMeeting(this.getUserData().id).subscribe();
    }
  }

  recordLabQuiz(lessonID: string, takenPoints: number, totalPoints: number) {
    const id = this.getUserData().id;
    const postObject = {
      tables: 'speech_quizzes',
      values: {
        StudentID: id,
        LessonID: lessonID,
        TakenPoints: takenPoints,
        TotalPoints: totalPoints,
      },
    };
    const record$ = this.post('create_entry', {
      data: JSON.stringify(postObject),
    }).subscribe(() => {
      record$.unsubscribe();
    });
  }

  currentLabLesson: string | boolean = false;

  chosenPCs: any = false;

  updateStudentApproval(studentId: string, approved: boolean) {
    // Make an API call to update the student's approval status
    // Replace the URL and method with your actual API endpoint
    return this.http.put(`/api/students/${studentId}/approval`, { approved });
  }

  updateTeacherApproval(teacherId: string, approved: boolean) {
    // Make an API call to update the teacher's approval status
    // Replace the URL and method with your actual API endpoint
    return this.http.put(`/api/teachers/${teacherId}/approval`, { approved });
  }

  groupMap = new Map<number, any[]>();
  rows:any[] = [];
}


// class VideoSDK {
//   static initMeeting(options:any) {
//     return new WebRTCMeeting(options);
//   }
// }

// class WebRTCMeeting {
//   meetingId:any;
//   participantId:any;
//   name:any;
//   metaData:any;
//   micEnabled:any;
//   webcamEnabled:any;
//   peerConnection:any
//   constructor({ meetingId = null, participantId = null, name = null, metaData = {}, micEnabled = true, webcamEnabled = true }) {
//     this.meetingId = meetingId;
//     this.participantId = participantId;
//     this.name = name;
//     this.metaData = metaData;
//     this.micEnabled = micEnabled;
//     this.webcamEnabled = webcamEnabled;
//     this.peerConnection = null;
//     this.startMeeting();
//   }

//   async startMeeting() {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: this.micEnabled, video: this.webcamEnabled });
//       this.createPeerConnection(stream);
//       console.log('Meeting started with metadata:', this.metaData);
//     } catch (error) {
//       console.error('Error starting meeting:', error);
//     }
//   }

//   createPeerConnection(stream:any) {
//     const configuration = {
//       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Example STUN server
//     };
//     this.peerConnection = new RTCPeerConnection(configuration);
//     stream.getTracks().forEach((track:any )=> this.peerConnection.addTrack(track, stream));
//   }

//   endMeeting() {
//     // Implement cleanup logic if needed
//     this.peerConnection.close();
//     console.log('Meeting ended');
//   }
// }