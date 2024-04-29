import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { APIService } from 'src/app/services/API/api.service';

@Component({
  selector: 'app-upload-lesson',
  templateUrl: './upload-lesson.component.html',
  styleUrls: ['./upload-lesson.component.css']
})
export class UploadLessonComponent implements OnInit {

  constructor (private modalController:NgbActiveModal, private API:APIService){}
  data:any;
  lessonFile!: File|string;
  quizFile!: File|string;
  selectedModule: string|null = null;
  modules:any[]=[];
  lessons:any[]=[];
  lesson:any;
  lessonName:string = 'Default Description';
  selectModule(event:any){
    this.selectedModule= event.target.value;
  }

  getFilename(file:any){
    if(file == null){
      return '';
    }
    if(file instanceof File){
      return file.name;
    }else{
      return (file as string).split('>')[1];
    }
  }
  ngOnInit(): void {
    if(this.lesson){
      this.lessonFile = this.lesson.lessonfile;
      this.quizFile = this.lesson.quizfile;
      this.selectedModule = this.lesson.moduleid;
      this.lessonName = this.lesson.description;
      
    }
  }

  onLessonSelected(event: Event){
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      this.lessonFile = inputElement.files[0];
    }
  }
  onQuizSelected(event: Event){
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      this.quizFile = inputElement.files[0];
    }
  }
  onSubmit() {
    // You can access the selected files here (this.lessonFile and this.quizFile)
   if( !this.API.checkInputs([this.selectedModule, this.lessonFile,this.quizFile, this.lessonName])){
    this.API.failedSnackbar('Fill all field')
    return;
   }

   this.API.justSnackbar('Uploading Lesson.....', 999999999)

   if(this.lesson){
    this.API.updateSpeechLesson(this.lesson.id,this.selectedModule!, 
      `Lesson ${this.lessons.filter((lesson)=>lesson.moduleid == this.selectedModule).length + 1}`, 
      this.lessonName,
      'PDF', 
      (this.lessonFile instanceof File) ? this.lessonFile: undefined, 
      (this.quizFile instanceof File) ? this.quizFile: undefined,
      ).then((data=>{
        this.modalController.dismiss('saved');
      }))
   }else{
    this.API.createSpeechLesson(this.selectedModule!, 
      `Lesson ${this.lessons.filter((lesson)=>lesson.moduleid == this.selectedModule).length + 1}`, 
      this.lessonName,
      'PDF', 
      (this.lessonFile instanceof File) ? this.lessonFile: undefined, 
      (this.quizFile instanceof File) ? this.quizFile: undefined,
      ).then((data=>{
        this.modalController.dismiss('saved');
      }))
   }
    // console.log(this.selectedModule);
    // console.log('Lesson File:', this.lessonFile);
    // console.log('Quiz File:', this.quizFile);
  
    // Add further logic to handle the form submission, e.g., sending files to a server
  }
}
