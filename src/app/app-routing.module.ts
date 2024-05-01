import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CoursesComponent } from './components/student/courses/courses.component';
import { PracticeComponent } from './components/student/practice/practice.component';
import { LessonsComponent } from './components/student/lessons/lessons.component';
import { AssessmentComponent } from './components/student/assessment/assessment.component';
import { AssignmentComponent } from './components/student/assignment/assignment.component';
import { MaterialsComponent } from './components/student/materials/materials.component';
import { PerformanceComponent } from './components/student/performance/performance.component';
import { DictionaryComponent } from './components/student/dictionary/dictionary.component';
import { LabComponent } from './components/student/lab/lab.component';
import { SelfstudylabComponent } from './components/student/selfstudylab/selfstudylab.component';
import { LabfocusComponent } from './components/student/labfocus/labfocus.component';
import { HomeComponent } from './components/student/home/home.component';
import { QuizPageComponent } from './components/student/quiz-page/quiz-page.component';
import { QuizWritingComponent } from './components/student/quiz-writing/quiz-writing.component';
import { QuizSpeakingComponent } from './components/student/quiz-speaking/quiz-speaking.component';
import { QuanhubComponent } from './components/quanhub/quanhub.component';
import { VideoZoomComponent } from './components/video-zoom/video-zoom.component';

import { TexttospeechComponent } from './components/teacher/texttospeech/texttospeech.component';
import { PortalGuard } from './services/guard/student/portal.guard';
import { LoginGuard } from './services/guard/login/login.guard';
import { LoaderGuard } from './loader.guard';
import { ThomeComponent } from './components/teacher/thome/thome.component';
import { TlabComponent } from './components/teacher/tlab/tlab/tlab.component';
import { QuizAnalyticsComponent } from './components/teacher/quiz-analytics/quiz-analytics.component';
import { ManageclassComponent } from './components/teacher/manageclass/manageclass.component';
import { StudentAandDComponent } from './components/teacher/student-aand-d/student-aand-d.component';
import { CommunicationComponent } from './components/teacher/communication/communication.component';
import { TaskManagementComponent } from './components/teacher/task-management/task-management.component';
import { QuizManagementComponent } from './components/teacher/quiz-management/quiz-management.component';
import { LessoncontentsComponent } from './components/lessoncontents/lessoncontents.component';
import { GradingPageComponent } from './components/student/grading-page/grading-page.component';
import { TportalGuard } from './services/guard/teacher/tportal.guard';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { UsersPageComponent } from './components/admin/users-page/users-page.component';
import { AdminCourseComponent } from './components/admin/admin-course/admin-course.component';
import { CountComponent } from './components/admin/count/count.component';
import { EditAdmincourseComponent } from './components/admin/edit-admincourse/edit-admincourse.component';
import { ManageCourseComponent } from './components/teacher/managecourse/managecourse.component';
import { QuizGuard } from './services/guard/quiz/quiz.guard';
import { PracticeGuard } from './services/guard/practice/practice.guard';
import { TlessonsComponent } from './components/teacher/tlab/tlessons/tlessons.component';
import { VerificationGuard } from './services/guard/verification/verification.guard';
import { StudentProfileComponent } from './components/student/student-profile/student-profile.component';
import { VerificationPageComponent } from './components/verification-page/verification-page.component';
import { IntroComponent } from './intro/intro.component';
import { LoaderComponent } from './loader/loader.component';
import { TeacherViewComponent } from './components/teacher/teacher-view/teacher-view.component';
import { TeacherViewGuardGuard } from './services/guard/teacher-view-guard/teacher-view-guard.guard';
import { GradeListComponent } from './components/teacher/grade-list/grade-list.component';
import { LessonPageComponent } from './offlineModules/lesson-page/lesson-page.component';
import { TdashboardComponent } from './speechlab/teacher/tdashboard/tdashboard.component';
import { PracticeContainerComponent } from './speechlab/student/practice/practice-container/practice-container.component';
import { LabContainerComponent } from './speechlab/student/lab/lab-container/lab-container.component';
import { ModuleContainerComponent } from './speechlab/student/module/module-container/module-container.component';
import { LearningModulesComponent } from './speechlab/student/module/learning-modules/learning-modules.component';
import { LabContainerTeacherComponent } from './speechlab/teacher/lab/lab-container-teacher/lab-container-teacher.component';
import { TsdashboardComponent } from './speechlab/student/tsdashboard/tsdashboard.component';
import { Module1Component } from './speechlab/student/module/module1/module1.component';
import { LabVidsComponent } from './speechlab/teacher/lab/lab-vids/lab-vids.component';
import { ModuleParentComponent } from './speechlab/student/module/module-parent/module-parent.component';
import { ModulesComponent } from './components/admin/speechlab/modules/modules.component';
import { Drag1Component } from './speechlab/student/module/drag1/drag1.component';
import { AdashboardComponent } from './components/admin/speechlab/adashboard/adashboard.component';
import { AlabComponent } from './components/admin/speechlab/alab/alab.component';
import { Practice1Component } from './speechlab/student/practice/practice1/practice1.component';
import { DrillsComponent } from './components/admin/speechlab/drills/drills.component';
import {PracticeParentComponent } from './speechlab/student/practice/practice-parent/practice-parent.component'
import { QuizTemplateComponent } from './speechlab/student/module/quiz-template/quiz-template.component';
import { ModuleComponent } from './teacher/module/module.component';
const routes: Routes = [
  { path: 'loader', component: LoaderComponent },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoaderGuard, LoginGuard], // Add LoaderGuard here
  },
  {
    path: 'modules',
    component: LessonPageComponent,
  },
  {
    path: 'intro',
    component: IntroComponent,
    canActivate: [LoginGuard], // Add LoaderGuard here
  },
  // {
  //   path: 'verify',
  //   component: LoginComponent,
  //   canActivate: [VerificationGuard],
  // },
  {
    path: 'admin',
    component: DashboardComponent,
    canActivate: [LoaderGuard],

    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'adminProfile', component: StudentProfileComponent },
      { path: 'users', component: UsersPageComponent },
      { path: 'courses', component: AdminCourseComponent },
      { path: 'count', component: CountComponent },
      { path: 'edit-admincourse', component: EditAdmincourseComponent },
      {
        path: 'speechlab', component:AdashboardComponent,
        children: [
          {path: '', redirectTo: 'Modules', pathMatch: 'full'},
          {path: 'Modules', component: ModulesComponent},
          {path: 'Lab', component: AlabComponent},
          {path: 'drills', component: DrillsComponent},
          {path: 'drag1', component: Drag1Component},
          {path: 'quiz-template', component: QuizTemplateComponent}
       
        ]
      },
    ],
  },
  {
    path: 'student',
    component: DashboardComponent,
    canActivate: [PortalGuard, LoaderGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: HomeComponent },
      { path: 'lab', component: LabComponent },
      { path: 'selfstudylab', component: SelfstudylabComponent },
      { path: 'labfocus', component: LabfocusComponent },
      { path: 'quanhub', component: QuanhubComponent },
      { path: 'video-zoom', component: VideoZoomComponent },
      { path: 'courses', component: CoursesComponent },
      { path: 'practice', component: PracticeComponent },
      { path: 'to-do', component: AssignmentComponent },
      { path: 'materials', component: MaterialsComponent },
      { path: 'lessonscontent', component: LessoncontentsComponent },
      { path: 'lessons', component: LessonsComponent },
      { path: 'assessment', component: AssessmentComponent },
      { path: 'performance', component: PerformanceComponent },
      { path: 'texttospeech', component: TexttospeechComponent },
      { path: 'dictionary', component: DictionaryComponent },
      {
        path: 'quiz-page',
        component: QuizPageComponent,
        canActivate: [QuizGuard],
      },
      { path: 'grading-page', component: GradingPageComponent },
      { path: 'studentProfile', component: StudentProfileComponent },
      {
        path: 'quiz-page',
        component: QuizPageComponent,
        canActivate: [QuizGuard],
      },
      {
        path: 'quiz-writing',
        component: QuizWritingComponent,
        canActivate: [QuizGuard],
      },
      { path: 'grading-page', component: GradingPageComponent },
      {
        path: 'quiz-speaking',
        component: QuizSpeakingComponent,
        canActivate: [QuizGuard],
      },
      { path: 'grading-page', component: GradingPageComponent },
      {
        path: 'speechlab', component:TsdashboardComponent,
        children: [
          {path: '', redirectTo: 'lab', pathMatch: 'full'},
        {path: 'practice', component: PracticeContainerComponent},
        {path: 'lab', component:LabContainerComponent},
        {path: 'module' , component: ModuleContainerComponent},
        {path: 'learning_module' , component: LearningModulesComponent},
        {path: 'module1' , component: Module1Component},
        {path: 'videos' , component: LabVidsComponent},
        {path: 'modules' , component: ModuleParentComponent},
        {path: 'practice1' , component: Practice1Component},
        {path: 'quiztemplate', component: QuizTemplateComponent},
        {path: 'paractice-parent', component:PracticeParentComponent},
        {path: 'drag1', component:Drag1Component},
        {path: 'quiz-template', component: QuizTemplateComponent}
        ]
      },
    ],
  },
  {
    path: 'teacher',
    component: DashboardComponent,
    canActivate: [TportalGuard, LoaderGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: ThomeComponent,
      },
      { path: 'texttospeech', component: TexttospeechComponent },
      { path: 'teacherProfile', component: StudentProfileComponent },
      { path: 'dictionary', component: DictionaryComponent },
      { path: 'manageclass', component: ManageclassComponent },
      // { path: 'studentA&D', component: StudentAandDComponent },
      {path: 'quiz-analytics', component: QuizAnalyticsComponent},
      { path: 'task-management', component: TaskManagementComponent },
      { path: 'quanhub', component: QuanhubComponent },
      { path: 'communication', component: CommunicationComponent },
      { path: 'managecourse', component: ManageCourseComponent },
      { path: 'quiz-management', component: QuizManagementComponent },
      { path: 'manage-lessons', component: TlessonsComponent },
      { path: 'manage-module', component: ModuleComponent },
      { path: 'lessons', component: LessonsComponent },
      {
        path: 'teacher-view',
        canActivate: [TeacherViewGuardGuard],
        component: TeacherViewComponent,
      },
      { path: 'grade-list', component: GradeListComponent },
      {
        path: 'speechlab', component: TdashboardComponent,
        children: [
          {path: '',redirectTo:'lab',pathMatch:'full'},
          {path: 'lab', component: LabContainerTeacherComponent},
          {path: 'module' , component: ModuleContainerComponent},
          {path: 'modules' , component: ModuleParentComponent},
          {path: 'learning_module' , component: LearningModulesComponent},
          {path: 'modules' , component: ModuleParentComponent},
          {path: 'practice1' , component: Practice1Component},
          {path: 'paractice-parent', component:PracticeParentComponent},
          {path: 'practice', component: PracticeContainerComponent},
          {path: 'quiztemplate', component: QuizTemplateComponent},
        
        ]
      },
    ],
  },

  { path: '**', redirectTo: 'intro', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
