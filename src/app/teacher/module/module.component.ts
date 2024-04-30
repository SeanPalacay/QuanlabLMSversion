import { Component } from '@angular/core';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-module',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.css']
})
export class ModuleComponent {
  modules: any[] = [];
  lessons: any[] = []; // Initialize the lessons property with an empty array

  constructor(private service: SharedService) {}

  refreshModules() {
    this.service.getModules().subscribe((res) => {
      this.modules = res;
    });
  }

  refreshLessons() {
    this.service.getLessons().subscribe((lessons) => {
      this.modules = lessons;
    });
  }

  ngOnInit() {
    this.refreshModules();
    this.refreshLessons();
  }

  addModule(moduleData: any) {
    this.service.addModule(moduleData).then((res) => {
      console.log(res);
      this.refreshModules();
    });
  }

  deleteModule(id: string) {
    this.service.deleteModule(id).then((res) => {
      console.log(res);
      this.refreshModules();
    });
  }

  addLessonToModule(moduleId: string, lessonData: any) {
    this.service.addLessonToModule(moduleId, lessonData).then((res) => {
      console.log(res);
      this.refreshModules();
    });
  }

  deleteLessonFromModule(moduleId: string, lessonId: string) {
    this.service.deleteLessonFromModule(moduleId, lessonId).then((res) => {
      console.log(res);
      this.refreshModules();
    });
  }

  addQuizToLesson(moduleId: string, lessonId: string, quizData: any) {
    this.service.addQuizToLesson(moduleId, lessonId, quizData).then((res) => {
      console.log(res);
      this.refreshModules();
    });
  }

  deleteQuizFromLesson(moduleId: string, lessonId: string, quizId: string) {
    this.service.deleteQuizFromLesson(moduleId, lessonId, quizId).then((res) => {
      console.log(res);
      this.refreshModules();
    });
  }
}
