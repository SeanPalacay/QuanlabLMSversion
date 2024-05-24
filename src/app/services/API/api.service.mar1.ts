// import { Injectable } from '@angular/core';
// import { LifecycleService } from './services-includes/lifecycle.service';
// import { UserService } from './services-includes/user.service';
// import { NotificationService } from './services-includes/notification.service';
// import { MessagingService } from './services-includes/messaging.service';
// import { CourseService } from './services-includes/course.service';
// import { ClassService } from './services-includes/class.service';
// import { LessonService } from './services-includes/lesson.service';
// import { QuizService } from './services-includes/quiz.service';
// import { ModuleService } from './services-includes/module.service';
// import { FileService } from './services-includes/file.service';
// import { MediaService } from './services-includes/media.service';
// import { MeetingService } from './services-includes/meeting.service';
// import { AttendanceService } from './services-includes/attendance.service';
// import { ComputerService } from './services-includes/computer.service';
// import { AssessmentService } from './services-includes/assessment.service';
// import { UtilityService } from './services-includes/utility.service';
// import { DictionaryService } from './services-includes/dictionary.service';
// import { environment } from 'src/environments/environment';
// import { BehaviorSubject, Observable, Subject } from 'rxjs';
// import { MessageObject, ParticipantObject } from 'src/app/shared/model/models';
// import { HttpClient } from '@angular/common/http';

// @Injectable({
//   providedIn: 'root',
// })
// export class APIService {
//   public usedStorage = this.isLocalStorage() ? localStorage : sessionStorage;
//   public speechComparison$: Subject<any> = new Subject<any>();
//   public downloadProgress$: Subject<number> = new Subject<number>();

//   public userData = this.getUserData();
//   public socket: WebSocket;
//   public inbox: number = 0;
//   public joinWithMic?: boolean;
//   public joinWithCamera?: boolean;
//   public search: string = '';
//   public currentPractice: any;
//   public currentTask: any;
//   public quizID: string | null = null;
//   public messages: any = [];
//   public convos: any = [];
//   public chat: any;
//   public interests: string[] = [];
//   public meetingInfo: any;
//   public notifications: any = [];

//   meeting: any;
//   meetingID?: string;
//   isMicOn = false;
//   sessionID?: string;

//   labID?: string;
//   backgroundID: any = 0;
//   verificationNotifier = new BehaviorSubject<any>(null);
//   participantsAudio: Map<string, ParticipantObject> = new Map();
//   labMessages: Array<MessageObject> = [];
//   labNotifiier = new BehaviorSubject<any>(null);
//   currentLabLesson: string | boolean = false;

//   chosenPCs: any = false;
//   micLoading = false;
//   online = true;

//   constructor(
//     private http: HttpClient,

//     private lifecycleService: LifecycleService,
//     private userService: UserService,
//     private notificationService: NotificationService,
//     private messagingService: MessagingService,
//     private courseService: CourseService,
//     private classService: ClassService,
//     private lessonService: LessonService,
//     private quizService: QuizService,
//     private moduleService: ModuleService,
//     private fileService: FileService,
//     private mediaService: MediaService,
//     private meetingService: MeetingService,
//     private attendanceService: AttendanceService,
//     private computerService: ComputerService,
//     private assessmentService: AssessmentService,
//     private utilityService: UtilityService,
//     private dictionaryService: DictionaryService
//   ) {
//     this.socket = new WebSocket(environment.socket);
//     this.socket.binaryType = 'arraybuffer';
//   }

//   // LifecycleService methods
//   ngOnInit() {
//     this.lifecycleService.ngOnInit();
//   }

//   ngOnDestroy() {
//     this.lifecycleService.ngOnDestroy();
//   }

//   // UserService methods
//   getUserData(logout?: boolean): any {
//     return this.userService.getUserData(logout);
//   }

//   getUserAccountType() {
//     return this.userService.getUserAccountType();
//   }

//   getFullName() {
//     return this.userService.getFullName();
//   }

//   updateLocalUserData(userData: any) {
//     return this.userService.updateLocalUserData(userData);
//   }

//   useLocalStorage() {
//     return this.userService.useLocalStorage();
//   }

//   useSessionStorage() {
//     return this.userService.useSessionStorage();
//   }

//   // isLocalStorage() {
//   //   return this.userService.isLocalStorage();
//   // }

//   isLoggedIn() {
//     return this.userService.isLoggedIn();
//   }

//   getUserType() {
//     return this.userService.getUserType();
//   }

//   login(username: string, password: string) {
//     return this.userService.login(username, password);
//   }

//   logout() {
//     return this.userService.logout();
//   }

//   getSavedEmail() {
//     return this.userService.getSavedEmail();
//   }

//   checkIfPendingVerification(email: string) {
//     return this.userService.checkIfPendingVerification(email);
//   }

//   pushVerification(data: any) {
//     return this.userService.pushVerification(data);
//   }

//   sendVerification(details: any) {
//     return this.userService.sendVerification(details);
//   }

//   adminVerifyToken(token: string) {
//     return this.userService.adminVerifyToken(token);
//   }

//   adminRejectToken(token: string) {
//     return this.userService.adminRejectToken(token);
//   }

//   verifyEmail(token: string) {
//     return this.userService.verifyEmail(token);
//   }

//   removeFromVerification(email: string) {
//     return this.userService.removeFromVerification(email);
//   }

//   register(details: any) {
//     return this.userService.register(details);
//   }

//   checkEmailExists(email: string, domain: string) {
//     return this.userService.checkEmailExists(email, domain);
//   }

//   updateAdminName(id: string, firstname: string, lastname: string) {
//     return this.userService.updateAdminName(id, firstname, lastname);
//   }

//   updateTeacherName(id: string, firstname: string, lastname: string) {
//     return this.userService.updateTeacherName(id, firstname, lastname);
//   }

//   updateStudentName(id: string, firstname: string, lastname: string) {
//     return this.userService.updateStudentName(id, firstname, lastname);
//   }

//   updateTeacherStudentName(id: string, firstname: string, lastname: string) {
//     return this.userService.updateTeacherStudentName(id, firstname, lastname);
//   }

//   updateAdminEmail(id: string, email: string) {
//     return this.userService.updateAdminEmail(id, email);
//   }

//   updateTeacherEmail(id: string, email: string) {
//     return this.userService.updateTeacherEmail(id, email);
//   }

//   updateStudentEmail(id: string, email: string) {
//     return this.userService.updateStudentEmail(id, email);
//   }

//   updateForStudentName(id: string, firstname: string, lastname: string) {
//     return this.userService.updateForStudentName(id, firstname, lastname);
//   }

//   updateForStudentEmail(id: string, email: string) {
//     return this.userService.updateForStudentEmail(id, email);
//   }

//   updateProfileImage(id: string, url: string) {
//     return this.userService.updateProfileImage(id, url);
//   }

//   updateStudentPassword(id: string, password: string) {
//     return this.userService.updateStudentPassword(id, password);
//   }

//   updateTeacherPassword(id: string, password: string) {
//     return this.userService.updateTeacherPassword(id, password);
//   }

//   updateAdminPassword(id: string, password: string) {
//     return this.userService.updateAdminPassword(id, password);
//   }

//   deleteAccount(accountID: string, type: string) {
//     return this.userService.deleteAccount(accountID, type);
//   }

//   // NotificationService methods
//   notifyParticipants(message: string) {
//     return this.notificationService.notifyParticipants(message);
//   }

//   pushNotifications(title: string, message: string, recipientID: string) {
//     return this.notificationService.pushNotifications(
//       title,
//       message,
//       recipientID
//     );
//   }

//   getNotifications() {
//     return this.notificationService.getNotifications();
//   }

//   markAllAsInbox() {
//     return this.notificationService.markAllAsInbox();
//   }

//   markAllAsRead() {
//     return this.notificationService.markAllAsRead();
//   }

//   markAsRead(id: string) {
//     return this.notificationService.markAsRead(id);
//   }

//   notifyStudentsInCourse(title: string, message: string, courseID: string) {
//     return this.notificationService.notifyStudentsInCourse(
//       title,
//       message,
//       courseID
//     );
//   }

//   notifyStudentsInClass(title: string, message: string, clsID?: string) {
//     return this.notificationService.notifyStudentsInClass(
//       title,
//       message,
//       clsID
//     );
//   }

//   // MessagingService methods
//   sendMessage(message: string, recipientID: string) {
//     return this.messagingService.sendMessage(message, recipientID);
//   }

//   getConversations() {
//     return this.messagingService.getConversations();
//   }

//   getLastMessage(themID: string) {
//     return this.messagingService.getLastMessage(themID);
//   }

//   // messagesMarkAllAsRead(otherID: string) {
//   //   return this.messagingService.messagesMarkAllAsRead(otherID);
//   // }

//   getMessages(themID: string) {
//     return this.messagingService.getMessages(themID);
//   }

//   // CourseService methods
//   teacherAllCourses() {
//     return this.courseService.teacherAllCourses();
//   }

//   getCourses(limit?: number, filter?: string) {
//     return this.courseService.getCourses(limit, filter);
//   }

//   matchCourseCode(courseID: string, classCode: string) {
//     return this.courseService.matchCourseCode(courseID, classCode);
//   }

//   enrollCourse(classID: string) {
//     return this.courseService.enrollCourse(classID);
//   }

//   checkIfEnrolled(courseID: string) {
//     return this.courseService.checkIfEnrolled(courseID);
//   }

//   getLessons() {
//     return this.courseService.getLessons();
//   }

//   lessonProgress(lessonID: string, progress: number) {
//     return this.courseService.lessonProgress(lessonID, progress);
//   }

//   getEnrolledCourses() {
//     return this.courseService.getEnrolledCourses();
//   }

//   getCourseClasses() {
//     return this.courseService.getCourseClasses();
//   }

//   teacherAllClasses() {
//     return this.courseService.teacherAllClasses();
//   }

//   teacherCoursesAndEnrolled() {
//     return this.courseService.teacherCoursesAndEnrolled();
//   }

//   randomCourseCover(language: string) {
//     return this.courseService.randomCourseCover(language);
//   }

//   checkMaxRegistrations() {
//     return this.courseService.checkMaxRegistrations();
//   }

//   getCourseProgress(courseID: string) {
//     return this.courseService.getCourseProgress(courseID);
//   }

//   createCourse(
//     courseID: string,
//     title: string,
//     description: string,
//     mode: string,
//     languageID: string
//   ) {
//     return this.courseService.createCourse(
//       courseID,
//       title,
//       description,
//       mode,
//       languageID
//     );
//   }

//   updateCourse(
//     courseID: string,
//     title: string,
//     description: string,
//     mode: string,
//     languageID: string
//   ) {
//     return this.courseService.updateCourse(
//       courseID,
//       title,
//       description,
//       mode,
//       languageID
//     );
//   }

//   deleteCourse(courseID: string) {
//     return this.courseService.deleteCourse(courseID);
//   }

//   teacherGetCoursebyID(courseID: string) {
//     return this.courseService.teacherGetCoursebyID(courseID);
//   }

//   // ClassService methods
//   createClass(
//     courseID: string,
//     className: string,
//     code: string,
//     schedule: string
//   ) {
//     return this.classService.createClass(courseID, className, code, schedule);
//   }

//   editClass(
//     classID: string,
//     className: string,
//     code: string,
//     schedule: string
//   ) {
//     return this.classService.editClass(classID, className, code, schedule);
//   }

//   deleteClass(classID: string) {
//     return this.classService.deleteClass(classID);
//   }

//   getStudentsInClass(classID: string) {
//     return this.classService.getStudentsInClass(classID);
//   }

//   getStudents() {
//     return this.classService.getStudents();
//   }

//   getStudentsTeacher() {
//     return this.classService.getStudentsTeacher();
//   }

//   deleteStudentFromCourse(classID: string, studentID: string) {
//     return this.classService.deleteStudentFromCourse(classID, studentID);
//   }

//   updateStudentInfoFromTeacher(
//     id: string,
//     firstname: string,
//     lastname: string
//   ) {
//     return this.classService.updateStudentInfoFromTeacher(
//       id,
//       firstname,
//       lastname
//     );
//   }

//   getClasses() {
//     return this.classService.getClasses();
//   }

//   teacherGetClassesByCourse(courseID: string) {
//     return this.classService.teacherGetClassesByCourse(courseID);
//   }

//   teacherCourseLessons(courseID: string) {
//     return this.classService.teacherCourseLessons(courseID);
//   }

//   // LessonService methods
//   createLesson(
//     courseID: string,
//     title: string,
//     description: string,
//     complexity: number,
//     attachments?: string,
//     image?: string
//   ) {
//     return this.lessonService.createLesson(
//       courseID,
//       title,
//       description,
//       complexity,
//       attachments,
//       image
//     );
//   }

//   updateLesson(
//     courseID: string,
//     lessonID: string,
//     title: string,
//     description: string,
//     complexity: number,
//     attachments?: string,
//     image?: string
//   ) {
//     return this.lessonService.updateLesson(
//       courseID,
//       lessonID,
//       title,
//       description,
//       complexity,
//       attachments,
//       image
//     );
//   }

//   deleteLesson(lessonID: string) {
//     return this.lessonService.deleteLesson(lessonID);
//   }

//   // QuizService methods
//   teacherGetQuizzes() {
//     return this.quizService.teacherGetQuizzes();
//   }

//   studentGetQuizzes() {
//     return this.quizService.studentGetQuizzes();
//   }

//   teacherGradeTask(submissionID: string, grade: string, comment?: string) {
//     return this.quizService.teacherGradeTask(submissionID, grade, comment);
//   }

//   studentQuizPoints() {
//     return this.quizService.studentQuizPoints();
//   }

//   studentGetQuiz(taskID: string) {
//     return this.quizService.studentGetQuiz(taskID);
//   }

//   createQuiz(
//     CourseID: string,
//     ID: string,
//     title: string,
//     details: string,
//     timelimit: number,
//     deadline: string,
//     attachments?: string,
//     settings?: string
//   ) {
//     return this.quizService.createQuiz(
//       CourseID,
//       ID,
//       title,
//       details,
//       timelimit,
//       deadline,
//       attachments,
//       settings
//     );
//   }

//   createQuizItem(
//     QuizID: string,
//     type: string,
//     question: string,
//     answer: string,
//     options?: string
//   ) {
//     return this.quizService.createQuizItem(
//       QuizID,
//       type,
//       question,
//       answer,
//       options
//     );
//   }

//   deleteQuiz(quizID: string) {
//     return this.quizService.deleteQuiz(quizID);
//   }

//   getQuizAverage(quizID: string) {
//     return this.quizService.getQuizAverage(quizID);
//   }

//   getQuizData() {
//     return this.quizService.getQuizData();
//   }

//   // ModuleService methods
//   getAllLanguages() {
//     return this.moduleService.getAllLanguages();
//   }

//   getLanguages() {
//     return this.moduleService.getLanguages();
//   }

//   getCoursesByLanguage(languageID: string) {
//     return this.moduleService.getCoursesByLanguage(languageID);
//   }

//   getCurrentLevel(language: string, mode: string) {
//     return this.moduleService.getCurrentLevel(language, mode);
//   }

//   createLevelEntry(language: string, mode: string) {
//     return this.moduleService.createLevelEntry(language, mode);
//   }

//   updateLevel(practiceID: string, level: number, mode: string) {
//     return this.moduleService.updateLevel(practiceID, level, mode);
//   }

//   createSpeechModule(name: string, practice: boolean = false) {
//     return this.moduleService.createSpeechModule(name, practice);
//   }

//   editSpeechModule(id: string, name: string, practice: boolean = false) {
//     return this.moduleService.editSpeechModule(id, name, practice);
//   }

//   deleteSpeechModule(id: string, practice: boolean = false) {
//     return this.moduleService.deleteSpeechModule(id, practice);
//   }

//   createSpeechLesson(
//     moduleID: string,
//     name: string,
//     description: string,
//     lessonType: string,
//     lessonFile?: File,
//     jsonQuiz?: File,
//     practice: boolean = false
//   ) {
//     return this.moduleService.createSpeechLesson(
//       moduleID,
//       name,
//       description,
//       lessonType,
//       lessonFile,
//       jsonQuiz,
//       practice
//     );
//   }

//   updateSpeechLesson(
//     lessonID: string,
//     moduleID: string,
//     name: string,
//     description: string,
//     lessonType: string,
//     lessonFile?: File,
//     jsonQuiz?: File,
//     practice: boolean = false
//   ) {
//     return this.moduleService.updateSpeechLesson(
//       lessonID,
//       moduleID,
//       name,
//       description,
//       lessonType,
//       lessonFile,
//       jsonQuiz,
//       practice
//     );
//   }

//   deleteSpeechLesson(id: string, practice: boolean = false) {
//     return this.moduleService.deleteSpeechLesson(id, practice);
//   }

//   loadSpeechLabs() {
//     return this.moduleService.loadSpeechLabs();
//   }

//   loadSpeechAllModules(practice: boolean = false) {
//     return this.moduleService.loadSpeechAllModules(practice);
//   }

//   loadSpeechLessons(moduleID: string, practice: boolean = false) {
//     return this.moduleService.loadSpeechLessons(moduleID, practice);
//   }

//   loadSpeechAllLessons(practice: boolean = false) {
//     return this.moduleService.loadSpeechAllLessons(practice);
//   }

//   checkIfOffline(lessonID: string) {
//     return this.moduleService.checkIfOffline(lessonID);
//   }

//   downloadCourses() {
//     return this.moduleService.downloadCourses();
//   }

//   loadOffline() {
//     return this.moduleService.loadOffline();
//   }

//   // FileService methods
//   getServerFileAsBase64(link: string) {
//     return this.fileService.getServerFileAsBase64(link);
//   }

//   getServerFile(link: string) {
//     return this.fileService.getServerFile(link);
//   }

//   uploadFile(file: File, filename: string) {
//     return this.fileService.uploadFile(file, filename);
//   }

//   deleteFile(file: string) {
//     return this.fileService.deleteFile(file);
//   }

//   uploadImage(image: File, filename: string) {
//     return this.fileService.uploadImage(image, filename);
//   }

//   uploadBase64(file: string, name: string) {
//     return this.fileService.uploadBase64(file, name);
//   }

//   uploadBase64Async(file: string, name: string) {
//     return this.fileService.uploadBase64Async(file, name);
//   }

//   uploadFileAsync(file: File, location: string) {
//     return this.fileService.uploadFileAsync(file, location);
//   }

//   uploadJson(json: string, name: string) {
//     return this.fileService.uploadJson(json, name);
//   }

//   uploadProfilePicture(file: string, name: string) {
//     return this.fileService.uploadProfilePicture(file, name);
//   }

//   getBaseAsync(file: Blob) {
//     return this.fileService.getBaseAsync(file);
//   }

//   getURL(file: string) {
//     return this.fileService.getURL(file);
//   }

//   // MediaService methods
//   speechToText(audioData: any, check: string, language: string) {
//     return this.mediaService.speechToText(audioData, check, language);
//   }

//   pronounce(word: string) {
//     return this.mediaService.pronounce(word);
//   }

//   fetchSRAPI(url: string, language: string) {
//     return this.mediaService.fetchSRAPI(url, language);
//   }

//   tts(text: string, lang: string) {
//     return this.mediaService.tts(text, lang);
//   }

//   // SpeechService methods
//   similarity(s1: string, s2: string) {
//     return this.mediaService.similarity(s1, s2);
//   }

//   editDistance(s1: string, s2: string) {
//     return this.mediaService.editDistance(s1, s2);
//   }

//   // MeetingService methods
//   startMeeting(uniqID: string, teacherID: string, meetingCode: string) {
//     return this.meetingService.startMeeting(uniqID, teacherID, meetingCode);
//   }

//   updateParticipantCount(sessionID: string, participants: number) {
//     return this.meetingService.updateParticipantCount(sessionID, participants);
//   }

//   loadMeetingSessions() {
//     return this.meetingService.loadMeetingSessions();
//   }

//   getMeeting(studentID: string) {
//     return this.meetingService.getMeeting(studentID);
//   }

//   endMeeting(teacherID: string) {
//     return this.meetingService.endMeeting(teacherID);
//   }

//   startSpeechMeeting(
//     uniqID: string,
//     teacherID: string,
//     meetingCode: string,
//     lab: string
//   ) {
//     return this.meetingService.startSpeechMeeting(
//       uniqID,
//       teacherID,
//       meetingCode,
//       lab
//     );
//   }

//   getOpenLabMeeting(lab: string) {
//     return this.meetingService.getOpenLabMeeting(lab);
//   }

//   getSpeechMeeting(studentID: string, lab: string) {
//     return this.meetingService.getSpeechMeeting(studentID, lab);
//   }

//   getTeacherMeeting() {
//     return this.meetingService.getTeacherMeeting();
//   }

//   startLab(lab: string) {
//     return this.meetingService.startLab(lab);
//   }

//   validateSpeechMeeting(meetingId: string) {
//     return this.meetingService.validateSpeechMeeting(meetingId);
//   }

//   createSpeechMeeting(lab: string) {
//     return this.meetingService.createSpeechMeeting(lab);
//   }

//   joinSpeechMeeting() {
//     return this.meetingService.joinSpeechMeeting();
//   }

//   leaveSpeechMeeting() {
//     return this.meetingService.leaveSpeechMeeting();
//   }

//   // AttendanceService methods
//   getAttendanceHistory() {
//     return this.attendanceService.getAttendanceHistory();
//   }

//   recordSpeechLabAttendance(id: string) {
//     return this.attendanceService.recordSpeechLabAttendance(id);
//   }

//   // ComputerService methods
//   changeLocalAddress(ip_addr: string) {
//     return this.computerService.changeLocalAddress(ip_addr);
//   }

//   changePCAddress(speechLabId: string, pc: any) {
//     return this.computerService.changePCAddress(speechLabId, pc);
//   }

//   loadComputerAddresses() {
//     return this.computerService.loadComputerAddresses();
//   }

//   loadComputers() {
//     return this.computerService.loadComputers();
//   }

//   // AssessmentService methods
//   teacherGetStudentQuizzes() {
//     return this.assessmentService.teacherGetStudentQuizzes();
//   }

//   teacherGetLabQuizzes() {
//     return this.assessmentService.teacherGetLabQuizzes();
//   }

//   recordAssessment(
//     practiceID: string,
//     level: number,
//     takenPoints: number,
//     totalPoints: number,
//     mode: string
//   ) {
//     return this.assessmentService.recordAssessment(
//       practiceID,
//       level,
//       takenPoints,
//       totalPoints,
//       mode
//     );
//   }

//   recordQuiz(assessmentID: string, takenPoints: number, totalPoints: number) {
//     return this.assessmentService.recordQuiz(
//       assessmentID,
//       takenPoints,
//       totalPoints
//     );
//   }

//   updateQuizScore(assessmentID: string, takenPoints: number) {
//     return this.assessmentService.updateQuizScore(assessmentID, takenPoints);
//   }

//   recordLabQuiz(lessonID: string, takenPoints: number, totalPoints: number) {
//     return this.assessmentService.recordLabQuiz(
//       lessonID,
//       takenPoints,
//       totalPoints
//     );
//   }

//   searchStudentInQuiz(search: string, id: string) {
//     return this.assessmentService.searchStudentInQuiz(search, id);
//   }

//   // UtilityService methods
//   updateLastSeen() {
//     return this.utilityService.updateLastSeen();
//   }

//   parseDate(date: string) {
//     return this.utilityService.parseDate(date);
//   }

//   parseDateTime(date: string) {
//     return this.utilityService.parseDateTime(date);
//   }

//   parseTime(date: string) {
//     return this.utilityService.parseTime(date);
//   }

//   parseDateFromNow(date: string) {
//     return this.utilityService.parseDateFromNow(date);
//   }

//   failedSnackbar(message: string, timer?: number) {
//     return this.utilityService.failedSnackbar(message, timer);
//   }

//   successSnackbar(message: string, timer?: number) {
//     return this.utilityService.successSnackbar(message, timer);
//   }

//   showSnackbar(message: string, action: string, duration: number) {
//     return this.utilityService.showSnackbar(message, action, duration);
//   }

//   justSnackbar(message: string, timer?: number) {
//     return this.utilityService.justSnackbar(message, timer);
//   }

//   post(method: string, body: {}) {
//     return this.utilityService.post(method, body);
//   }

//   localPost(method: string, body: {}) {
//     return this.utilityService.localPost(method, body);
//   }

//   socketSend(data: object) {
//     return this.utilityService.socketSend(data);
//   }

//   setMeetPermissions(cam: boolean, mic: boolean) {
//     return this.utilityService.setMeetPermissions(cam, mic);
//   }

//   joinMeet() {
//     return this.utilityService.joinMeet();
//   }

//   resetMeetOptions() {
//     return this.utilityService.resetMeetOptions();
//   }

//   escapeHtml(input: string) {
//     return this.utilityService.escapeHtml(input);
//   }

//   getCNSCPresident() {
//     return this.utilityService.getCNSCPresident();
//   }

//   checkInputs(inputs: Array<any>) {
//     return this.utilityService.checkInputs(inputs);
//   }

//   checkAtLeastOneInput(inputs: Array<any>) {
//     return this.utilityService.checkAtLeastOneInput(inputs);
//   }

//   convertToTimeZone(date: Date, timeZone: string) {
//     return this.utilityService.convertToTimeZone(date, timeZone);
//   }

//   // DictionaryService methods
//   dictionary(word: string) {
//     return this.dictionaryService.dictionary(word);
//   }

//   getWord(word: string) {
//     return this.dictionaryService.getWord(word);
//   }

//   saveDictionary(word: string, dictionary?: string) {
//     return this.dictionaryService.saveDictionary(word, dictionary);
//   }

//   fetchDictionaryAPI(word: string) {
//     return this.dictionaryService.fetchDictionaryAPI(word);
//   }

//   // rand
//   createID36() {
//     return this.utilityService.createID36();
//   }

//   createID32() {
//     return this.utilityService.createID32();
//   }

//   createTask(
//     courseID: string,
//     title: string,
//     description: string,
//     deadline: string,
//     attachments?: string
//   ): Observable<any> {
//     return this.classService.createTask(
//       courseID,
//       title,
//       description,
//       deadline,
//       attachments
//     );
//   }

//   showLoader() {
//     this.utilityService.showLoader();
//   }

//   hideLoader() {
//     this.utilityService.hideLoader();
//   }

//   isLocalStorage() {
//     return this.utilityService.isLocalStorage();
//   }

//   textToSpeech(phrase: string, language: string): Observable<any> {
//     return this.mediaService.textToSpeech(phrase, language);
//   }

//   updateEsign(filename: string): Observable<any> {
//     return this.utilityService.updateEsign(filename);
//   }

//   noProfile() {
//     return 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg';
//   }

//   searchPeople(search: string) {
//     return this.userService.searchPeople(search);
//   }

//   openFile(file: string) {
//     return this.fileService.openFile(file);
//   }

//   getStudentAssignedLab() {
//     return this.attendanceService.getStudentAssignedLab();
//   }

//   checkStudentLabAttempt() {
//     return this.attendanceService.checkStudentLabAttempt();
//   }
//   goOffline() {
//     return this.utilityService.goOffline();
//   }

//   setCourse(courseID: string) {
//     return this.courseService.setCourse(courseID);
//   }

//   openLocalFile(file: string) {
//     return this.fileService.openLocalFile(file);
//   }

//   updateAdmin(newAdmin: any) {
//     return this.userService.updateAdmin(newAdmin);
//   }

//   updateTeacher(newTeacher: any) {
//     return this.userService.updateTeacher(newTeacher);
//   }

//   sendDirectLabMessage(message: string, destination: string, action: string) {
//     return this.meeting.sendDirectLabMessage(message, destination, action);
//   }

//   sendLabAction(action: string) {
//     return this.meeting.sendLabAction(action);
//   }

//   messsagesMarkAllAsRead(otherID: string) {
//     return this.messagingService.messsagesMarkAllAsRead(otherID);
//   }

//   toggleMic(): void {
//     return this.meeting.toggleMic();
//   }

//   getTeachers() {
//     return this.userService.getTeachers();
//   }

//   loadWordSearches() {
//     return this.dictionaryService.loadWordSearches();
//   }

//   addAdmin(newAdmin: any): Observable<any> {
//     return this.userService.addAdmin(newAdmin);
//   }

//   updateStudentInfo(student: any) {
//     return this.userService.updateStudentInfo(student);
//   }

//   addTeacher(newTeacher: any): Observable<any> {
//     return this.userService.addTeacher(newTeacher);
//   }

//   getPendingStudents() {
//     return this.userService.getPendingStudents();
//   }

//   getAdmins() {
//     return this.userService.getAdmins();
//   }

//   updateTeacherApproval(teacherId: string, approved: boolean) {
//     return this.http.put(`/api/teachers/${teacherId}/approval`, { approved });
//   }

//   studentGetAssignments() {
//     return this.userService.studentGetAssignments();
//   }

//   studentGetAssignmentByID(taskID: string) {
//     return this.userService.studentGetAssignmentByID(taskID);
//   }

//   studentSubmitAssignment(
//     assignID: string,
//     comments?: string,
//     attachments?: string
//   ) {
//     return this.userService.studentSubmitAssignment(
//       assignID,
//       comments,
//       attachments
//     );
//   }

//   studentAssignSubmitted(assignID: string) {
//     return this.userService.studentAssignSubmitted(assignID);
//   }

//   returnSuccess(data: any, errorMsg: string) {
//     return this.utilityService.returnSuccess(data, errorMsg);
//   }

//   setClass(classID: string) {
//     this.usedStorage.setItem('classID', classID);
//   }

//   teacherGetAllSubmissions() {
//     return this.userService.teacherGetAllSubmissions();
//   }

//   updateFromTeacher(id: string, firstname: string, lastname: string) {
//     return this.userService.updateFromTeacher(id, firstname, lastname);
//   }

//   teacherGetTasks() {
//     return this.userService.teacherGetTasks();
//   }

//   teacherGetAssignment(taskID: string) {
//     return this.userService.teacherGetAssignment(taskID);
//   }

//   teacherGetStudentAssignment(subID: string) {
//     return this.userService.teacherGetStudentAssignment(subID);
//   }

//   resetStudents() {
//     return this.userService.resetStudents();
//   }

//   sendLabMessage(message: string) {
//     return this.meeting.sendLabMessage(message);
//   }

//   getLessonData(): Observable<any> {
//     return this.http.get<any>('assets/jsons/speechlab/module1/lesson1.json');
//   }
// }
