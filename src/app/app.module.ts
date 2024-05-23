import { NgModule, importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { SharedService } from 'src/app/shared.service';
import {provideStorage, getStorage } from '@angular/fire/storage';
const firebaseConfig = {
  apiKey: "AIzaSyDAd8uGtbwzUvEqiOeC2TW_kRHFEGtw38Q",
  authDomain: "quanbylms-b4b15.firebaseapp.com",
  projectId: "quanbylms-b4b15",
  storageBucket: "quanbylms-b4b15.appspot.com",
  messagingSenderId: "542875331963",
  appId: "1:542875331963:web:4955ee9d892325421361de"
  // measurementId: "G-9C89V814XJ"
};


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { ModalComponent } from './components/modal/modal.component';
import { CardComponent } from './components/card/card.component';
import { ButtonzComponent } from './components/buttonz/buttonz.component';
import { HeaderzComponent } from './components/headerz/headerz.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CoursesComponent } from './components/student/courses/courses.component';
import { PracticeComponent } from './components/student/practice/practice.component';
import { AssessmentComponent } from './components/student/assessment/assessment.component';
import { PerformanceComponent } from './components/student/performance/performance.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LabComponent } from './components/student/lab/lab.component';
import { SelfstudylabComponent } from './components/student/selfstudylab/selfstudylab.component';
import { LabfocusComponent } from './components/student/labfocus/labfocus.component';
import { HomeComponent } from './components/student/home/home.component';
import { FooterComponent } from './components/footer/footer.component';
import { TexttospeechComponent } from './components/teacher/texttospeech/texttospeech.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { LoadingSnackbarComponent } from './components/popups/loadingsnackbar/loadingsnackbar.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DictionaryComponent } from './components/student/dictionary/dictionary.component';
import { ThomeComponent } from './components/teacher/thome/thome.component';
import { TlabComponent } from './components/teacher/tlab/tlab/tlab.component';
import { QuanhubComponent } from './components/quanhub/quanhub.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ManageclassComponent } from './components/teacher/manageclass/manageclass.component';
import { NewclassComponent } from './components/teacher/modals/newclass/newclass.component';
import { AssignmentComponent } from './components/student/assignment/assignment.component';
import { MaterialsComponent } from './components/student/materials/materials.component';
import { CommunicationComponent } from './components/teacher/communication/communication.component';
import { StudentAandDComponent } from './components/teacher/student-aand-d/student-aand-d.component';
import { ProblemreportComponent } from './components/modals/problemreport/problemreport.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CoursecontentComponent } from './components/student/modals/coursecontent/coursecontent.component';
import { TaskManagementComponent } from './components/teacher/task-management/task-management.component';
import { CreatemeetComponent } from './components/teacher/modals/createmeet/createmeet.component';
import { TaskcreationComponent } from './components/teacher/modals/taskcreation/taskcreation.component';
import { QuizPageComponent } from './components/student/quiz-page/quiz-page.component';
import { FormsModule } from '@angular/forms';
import { CreateFeedbackComponent } from './components/teacher/modals/create-feedback/create-feedback.component';
import { MeetpopComponent } from './components/student/modals/meetpop/meetpop.component';
import { ChatsComponent } from './components/modal/chats/chats.component';
import { LessoncontentsComponent } from './components/lessoncontents/lessoncontents.component';
import { GradingPageComponent } from './components/student/grading-page/grading-page.component';
import { ProfileComponent } from './components/student/profile/profile.component';
import { QuizManagementComponent } from './components/teacher/quiz-management/quiz-management.component';
import { QuizCreationComponent } from './components/teacher/tlab/modals/quiz-creation/quiz-creation.component';
import { CreateCourseComponent } from './components/teacher/modals/create-course/create-course.component';
import { MatIconModule } from '@angular/material/icon';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { UsersPageComponent } from './components/admin/users-page/users-page.component';
import { ManageCourseComponent } from './components/teacher/managecourse/managecourse.component';
import { VideoZoomComponent } from './components/video-zoom/video-zoom.component';


import { AddTeachersComponent } from './components/admin/modals/add-teachers/add-teachers.component';
import { AddStudentsComponent } from './components/admin/modals/add-students/add-students.component';
import { LessonsComponent } from './components/student/lessons/lessons.component';
import { NotificationboxComponent } from './components/notificationbox/notificationbox.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StudentProfileComponent } from './components/student/student-profile/student-profile.component';
import { TlessonsComponent } from './components/teacher/tlab/tlessons/tlessons.component';
import { ViewerComponent } from './components/viewer/viewer.component';
import { SafePipe } from './pipes/safe/safe.pipe';
import { VerificationPageComponent } from './components/verification-page/verification-page.component';
import { EditCourseComponent } from './components/teacher/modals/edit-course/edit-course.component';
import { CountComponent } from './components/admin/count/count.component';
import { EditDetailsComponent } from './components/admin/modals/edit-details/edit-details.component';
import { QuizWritingComponent } from './components/student/quiz-writing/quiz-writing.component';
import { IntroComponent } from './intro/intro.component';
import { LoaderComponent } from './loader/loader.component';
import { LoaderGuard } from './loader.guard';
import { TeacherViewComponent } from './components/teacher/teacher-view/teacher-view.component';
import { QuizSpeakingComponent } from './components/student/quiz-speaking/quiz-speaking.component';
import { DASHBOARD } from './components/student/dashboard/dashboard.component';
import { GradeListComponent } from './components/teacher/grade-list/grade-list.component';
import { LessonPageComponent } from './offlineModules/lesson-page/lesson-page.component';

import { TdashboardComponent } from './speechlab/teacher/tdashboard/tdashboard.component';
import { LabContainerTeacherComponent } from './speechlab/teacher/lab/lab-container-teacher/lab-container-teacher.component';
import { LabLaptopTeacherComponent } from './speechlab/teacher/lab/lab-laptop-teacher/lab-laptop-teacher.component';
import { ActiveBarComponent } from './speechlab/student/lab/active-bar/active-bar.component';
import { LabButtonsComponent } from './speechlab/student/lab/lab-buttons/lab-buttons.component';
import { LabContainerComponent } from './speechlab/student/lab/lab-container/lab-container.component';
import { LabLaptopComponent } from './speechlab/student/lab/lab-laptop/lab-laptop.component';
import { LearningModulesComponent } from './speechlab/student/module/learning-modules/learning-modules.component';
import { ModuleContainerComponent } from './speechlab/student/module/module-container/module-container.component';
import { PracticeContainerComponent } from './speechlab/student/practice/practice-container/practice-container.component';
import { TsdashboardComponent } from './speechlab/student/tsdashboard/tsdashboard.component';
import { ModalsComponent } from './speechlab/components/modals/modals.component';
import { ModulePlaceholderComponent } from './speechlab/components/module-placeholder/module-placeholder.component';
import { Module1Component } from './speechlab/student/module/module1/module1.component';
import { LabVidsComponent } from './speechlab/teacher/lab/lab-vids/lab-vids.component';
import { Drag1Component } from './speechlab/student/module/drag1/drag1.component';
import { Drag2Component } from './speechlab/student/module/drag2/drag2.component';
import { ModuleParentComponent } from './speechlab/student/module/module-parent/module-parent.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { QuizTemplateComponent } from './speechlab/student/module/quiz-template/quiz-template.component';
import { AdashboardComponent } from './components/admin/speechlab/adashboard/adashboard.component';
import { ModulesComponent } from './components/admin/speechlab/modules/modules.component';
import { UploadlessonquizComponent } from './components/admin/speechlab/uploadlessonquiz/uploadlessonquiz.component';
import { UploadLessonComponent } from './components/admin/speechlab/modal/upload-lesson/upload-lesson.component';
import { AlabComponent } from './components/admin/speechlab/alab/alab.component';
import { Practice1Component } from './speechlab/student/practice/practice1/practice1.component';
import { DrillsComponent } from './components/admin/speechlab/drills/drills.component';
import { UploadDrillComponent } from './components/admin/speechlab/modal/upload-drill/upload-drill.component';
import { PracticeParentComponent } from './speechlab/student/practice/practice-parent/practice-parent.component';
import { MeetViewComponent } from './speechlab/components/meet-view/meet-view.component';
import { GroupComponent } from './speechlab/components/group/group.component';
import { QuizAnalyticsComponent } from './components/teacher/quiz-analytics/quiz-analytics.component';
import { AddPrincipalComponent } from './components/admin/modals/add-principal/add-principal.component';
import { SurveyCertComponent } from './components/student/modals/survey-cert/survey-cert.component';
import { ModuleComponent } from './teacher/module/module.component';




@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ModalComponent,
    CardComponent,
    LessonsComponent,
    ButtonzComponent,
    HeaderzComponent,
    DashboardComponent,
    CoursesComponent,
    PracticeComponent,
    AssessmentComponent,
    PerformanceComponent,
    SidebarComponent,
    LabComponent,
    SelfstudylabComponent,
    LabfocusComponent,
    HomeComponent,
    FooterComponent,
    TexttospeechComponent,
    LoadingSnackbarComponent,
    DictionaryComponent,
    ThomeComponent,
    ManageCourseComponent,
    TlessonsComponent,
    TlabComponent,
    QuanhubComponent,
    ManageclassComponent,
    AssignmentComponent,
    NewclassComponent,
    MaterialsComponent,
    CommunicationComponent,
    StudentAandDComponent,
    ProblemreportComponent,
    CoursecontentComponent,
    TaskManagementComponent,
    CreatemeetComponent,
    TaskcreationComponent,
    QuizPageComponent,
    CreateFeedbackComponent,
    MeetpopComponent,
    ChatsComponent,
    LessoncontentsComponent,
    GradingPageComponent,
    ProfileComponent,
    QuizManagementComponent,
    QuizCreationComponent,
    CreateCourseComponent,
    AdminDashboardComponent,
    UsersPageComponent,
    AddTeachersComponent,
    AddStudentsComponent,
    VideoZoomComponent,
    NotificationboxComponent,
    StudentProfileComponent,
    ViewerComponent,
    SafePipe,
    VerificationPageComponent,
    EditCourseComponent,
    CountComponent,
    EditDetailsComponent,
    QuizWritingComponent,
    IntroComponent,
    LoaderComponent,
    TeacherViewComponent,
    QuizSpeakingComponent,
    DASHBOARD,
    GradeListComponent,
    LessonPageComponent,
    TdashboardComponent,
    LabContainerTeacherComponent,
    LabLaptopTeacherComponent,
    ActiveBarComponent,
    LabButtonsComponent,
    LabContainerComponent,
    LabLaptopComponent,
    LearningModulesComponent,
    ModuleContainerComponent,
    PracticeContainerComponent,
    TsdashboardComponent,
    ModalsComponent,
    ModulePlaceholderComponent,
    Module1Component,
    LabVidsComponent,
    Drag1Component,
    Drag2Component,
    ModuleParentComponent,
    QuizTemplateComponent,
    AdashboardComponent,
    ModulesComponent,
    UploadlessonquizComponent,
    UploadLessonComponent,
    AlabComponent,
    Practice1Component,
    DrillsComponent,
    UploadDrillComponent,
    PracticeParentComponent,
    MeetViewComponent,
    GroupComponent,
    AddPrincipalComponent,
    QuizAnalyticsComponent,
    SurveyCertComponent,
    ModuleComponent
  ],
  
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    NgbModule,
    FormsModule,
    MatDialogModule,
    NgxChartsModule,
    MatIconModule,
    BrowserAnimationsModule,
    DragDropModule,
    PdfViewerModule,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
  providers: [SharedService],
  bootstrap: [AppComponent],
  
})
export class AppModule {}
