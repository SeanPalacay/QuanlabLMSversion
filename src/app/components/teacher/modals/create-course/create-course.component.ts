import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { APIService } from 'src/app/services/API/api.service';

import {v4 as uuidv4} from 'uuid';

interface Lesson {
  lessonName: string;
  coverImage:File|null;
  fileupload: File|null;
  description: string;
  complexity: number;
}

@Component({
  selector: 'app-create-course',
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.css']
})
export class CreateCourseComponent {
  @Input() myCustomClass: string = '';
  @Input() languages:Map<string, any> = new Map<string, any>();
  lessons: Lesson[] = [{
    lessonName: '',
    coverImage:null,
    fileupload: null,
    description:'',
    complexity:1,
  }];
  selectedFileName: string | undefined;
  audioDescription: string = ''; // Added property for audio description

  // form
  courseTitle:string = '';
  courseDesc:string = '';

  constructor(public activeModal: NgbActiveModal, private API:APIService) {}

  thislessons: Lesson[] = [];

  thisLesson() {
    const newLesson: Lesson = {
      lessonName: '',
      coverImage:null,
      fileupload: null,
      description:'',
      complexity:1,
    };
    this.lessons.push(newLesson);
  }

  
  getGradient(): string {
    return 'linear-gradient(to right, #ff9a9e, #fad0c4)';
  }

  onFileSelected(event: Event, lesson:Lesson){
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      lesson.fileupload = inputElement.files[0];
    }
  }

  // importImage(event: Event, lesson:Lesson){
  //   const inputElement = event.target as HTMLInputElement;
  //   if (inputElement.files) {
  //     const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  //     if(!validImageTypes.includes(inputElement.files[0].type)){
  //       this.API.failedSnackbar('Select valid image file type!');
  //       return;
  //     }
  //     lesson.coverImage = inputElement.files[0];
  //   }
  // }

  setComplexity(complexity:number, lesson:Lesson){
    lesson.complexity =  complexity;
    console.log(lesson.complexity);
  }

  complexityOptions = ['Beginner', 'Intermediate', 'Advanced'];
  selectedcomplexity: string = 'Beginner';

  getFilename(file:any){
    if((typeof file == 'string')){
      return file.split('>')[1];
    }else{
      return file.name;
    }
  }

  async submit() {
    // Set default mode to 'LRSW' (listen, read, speak, write)
    const modeString = 'LRSW';

    if(this.courseTitle == ''){
      this.API.failedSnackbar('Course title should not be empty!');
      return;
    }

    // Set default language to 'English'
    const defaultLanguage = 'English';
    const languageId = this.languages.get(defaultLanguage).id;

    for(let lesson of this.lessons){
      if(lesson.lessonName.trim() == ''){
        this.API.failedSnackbar('Lesson titles should be completely filled.');
        return;
      }
    }

    const genID = this.API.createID32();
    this.API.justSnackbar('Creating course, Please Wait...', 99999999999999);
    await lastValueFrom(this.API.createCourse(genID,this.courseTitle, this.courseDesc, modeString, languageId))

    for(let lesson of this.lessons){
      var attachments = undefined;
      var imageupload = undefined;
      lesson.complexity =   ((Number(lesson.complexity)+ 1) * (5/3))
   
      if(lesson.description.trim() == ''){
        lesson.description = '[NONE]';
      }
      if(lesson.fileupload != undefined){
        var fileparse = lesson.fileupload.name.split(".");
        var serverLocation = uuidv4()+ '.' + fileparse[fileparse.length-1];
        this.API.uploadFile(lesson.fileupload, serverLocation);
        var filelocation = 'files/' + serverLocation;
        var filename = lesson.fileupload.name;
        attachments = filelocation+'>'+filename; 
      }

      if(lesson.coverImage != undefined){
        var fileparse = lesson.coverImage.name.split(".");
        var serverLocation = uuidv4()+ '.' + fileparse[fileparse.length-1];
        this.API.uploadImage(lesson.coverImage, serverLocation);
        var filelocation =  'image_upload/' + serverLocation;
        imageupload = filelocation; 
      }
      await lastValueFrom(this.API.createLesson(genID,lesson.lessonName, lesson.description, lesson.complexity,attachments, imageupload));
    }
    this.API.successSnackbar('Done!');
    this.activeModal.close('update');
  }

  addLesson() {
    this.thisLesson();
  }

  closeModal() {
    this.activeModal.close();
  }
}