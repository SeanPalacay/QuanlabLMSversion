import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { APIService } from 'src/app/services/API/api.service';

@Component({
  selector: 'app-upload-drill',
  templateUrl: './upload-drill.component.html',
  styleUrls: ['./upload-drill.component.css']
})
export class UploadDrillComponent implements OnInit {

  constructor (private modalController:NgbActiveModal, private API:APIService){}
  drillTitle!:string;
  data:any;
  drillFile!: File|string;
  audioFile!: File|string;
  selectedModule: string|null = null;
  practices:any[]=[];
  drills:any[]=[];
  drill:any;
  drillName:string ='';

  selectModule(event:any){
    this.selectedModule= event.target.value;
  }

  ngOnInit(): void {
    // console.log(this.practices);
    if(this.drill){
      this.drillFile = this.drill.drillfile;
      this.audioFile = this.drill.audiofile;
      this.selectedModule = this.drill.practiceid;
      this.drillName = this.drill.description;
      
    }
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

  onLessonSelected(event: Event){
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      this.drillFile = inputElement.files[0];
    }
  }
  onQuizSelected(event: Event){
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      this.audioFile = inputElement.files[0];
    }
  }
  onSubmit() {
    // You can access the selected files here (this.lessonFile and this.quizFile)
   if( !this.API.checkInputs([this.selectedModule, this.drillFile,this.audioFile, this.drillName])){
    this.API.failedSnackbar('Fill all field')
    return;
   }

   this.API.justSnackbar('Uploading Drill.....', 999999999)

  if(this.drill){
    this.API.updateSpeechLesson( this.drill.id,this.selectedModule!, 
      `Drill ${this.drills.filter((lesson)=>lesson.moduleid == this.selectedModule).length + 1}`, 
      this.drillName,
      'PDF', 
      (this.drillFile instanceof File) ? this.drillFile: undefined, 
      (this.audioFile instanceof File) ? this.audioFile: undefined,
      true 
      ).then((data=>{
        this.modalController.dismiss('saved');
      }))
    
  }else{
    this.API.createSpeechLesson(this.selectedModule!, 
      `Drill ${this.drills.filter((lesson)=>lesson.drillid == this.selectedModule).length + 1}`, 
      this.drillName,
      'PDF', 
      (this.drillFile instanceof File) ? this.drillFile: undefined, 
      (this.audioFile instanceof File) ? this.audioFile: undefined,
      true 
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