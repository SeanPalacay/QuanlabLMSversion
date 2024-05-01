import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, DocumentReference, DocumentData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { runTransaction } from 'firebase/firestore';
import {
  Storage,
  getDownloadURL,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
interface Module {
  id: string;
  name: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  imageUrl?: string; // New field for image URL
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  constructor(private fs: Firestore, private storage: Storage) { }

  getModules(): Observable<Module[]> {
    let modulesCollection = collection(this.fs, 'modules');
    return collectionData(modulesCollection, { idField: 'id' }) as Observable<Module[]>;
  }

  createModule(moduleData: { name: string, lessons: Lesson[] }): Promise<DocumentReference<DocumentData>> {
    let modulesCollection = collection(this.fs, 'modules');
    return addDoc(modulesCollection, moduleData);
  }

  deleteModule(moduleId: string): Promise<void> {
    let moduleRef = doc(this.fs, 'modules/' + moduleId);
    return deleteDoc(moduleRef);
  }

  createLesson(moduleId: string, lessonData: { title: string, content: string, imageFile: File }): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const filePath = `lesson-images/${lessonData.imageFile.name}`;
      const storageRef = ref(this.storage, filePath);

      uploadBytes(storageRef, lessonData.imageFile)
        .then(snapshot => {
          getDownloadURL(storageRef)
            .then(imageUrl => {
              const lessonId = doc(collection(this.fs, 'dummy')).id;
              const lesson: Lesson = {
                id: lessonId,
                title: lessonData.title,
                content: lessonData.content,
                imageUrl: imageUrl
              };

              const moduleRef = doc(this.fs, 'modules/' + moduleId);
              updateDoc(moduleRef, {
                lessons: arrayUnion(lesson)
              }).then(() => resolve())
              .catch(error => reject(error));
            })
            .catch(error => reject(error));
        })
        .catch(error => reject(error));
    });
  }

  deleteLesson(moduleId: string, lessonId: string): Promise<void> {
    const moduleRef = doc(this.fs, 'modules/' + moduleId);
    return runTransaction(this.fs, async (transaction) => {
      const moduleDoc = await transaction.get(moduleRef);
      if (!moduleDoc.exists) {
        throw new Error('Module document does not exist');
      }
      
      const moduleData = moduleDoc.data() as Module;
      const updatedLessons = moduleData.lessons.filter(lesson => lesson.id !== lessonId);
      
      transaction.update(moduleRef, { lessons: updatedLessons });
    });
  }
  
  
  
  
}