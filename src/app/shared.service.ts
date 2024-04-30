import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(private fs: Firestore) { }

  getModules() {
    let modulesCollection = collection(this.fs, 'modules');
    return collectionData(modulesCollection, { idField: 'id' });
  }
  getLessons() {
    let lessonsCollection = collection(this.fs, 'lessons');
    return collectionData(lessonsCollection, { idField: 'id' });
  }

  addModule(moduleData: any) {
    let modulesCollection = collection(this.fs, 'modules');
    return addDoc(modulesCollection, moduleData);
  }

  deleteModule(id: string) {
    let moduleRef = doc(this.fs, 'modules/' + id);
    return deleteDoc(moduleRef);
  }

  addLessonToModule(moduleId: string, lessonData: any) {
    let lessonsCollection = collection(this.fs, `modules/${moduleId}/lessons`);
    return addDoc(lessonsCollection, lessonData);
  }

  deleteLessonFromModule(moduleId: string, lessonId: string) {
    let lessonRef = doc(this.fs, `modules/${moduleId}/lessons/${lessonId}`);
    return deleteDoc(lessonRef);
  }

  addQuizToLesson(moduleId: string, lessonId: string, quizData: any) {
    let quizzesCollection = collection(this.fs, `modules/${moduleId}/lessons/${lessonId}/quizzes`);
    return addDoc(quizzesCollection, quizData);
  }

  deleteQuizFromLesson(moduleId: string, lessonId: string, quizId: string) {
    let quizRef = doc(this.fs, `modules/${moduleId}/lessons/${lessonId}/quizzes/${quizId}`);
    return deleteDoc(quizRef);
  }
}
