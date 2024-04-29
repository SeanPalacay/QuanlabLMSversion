import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UploadLessonComponent } from '../modal/upload-lesson/upload-lesson.component';
import { APIService } from 'src/app/services/API/api.service';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent implements OnInit{

  constructor(private modalService:NgbModal, private API:APIService){}

  speechlabs:any[]=[]
  selectedLab = 0;
  ngOnInit(): void {
    this.loadLabs();
  }

  modules:any[] =[];
  lessons:any[] =[];
  loadLabs(){
    this.API.showLoader()
    const $obs =  this.API.loadSpeechLabs().subscribe(data=>{
      if(data.success){
        this.speechlabs = data.output;
        if(this.speechlabs.length){
          this.loadModules();
        }else{
          this.API.hideLoader();
        }
       
      }else{
        this.API.hideLoader();
      } 
  
      $obs.unsubscribe();
    })
  }

  loadModules(){
    const $obs =  this.API.loadSpeechAllModules().subscribe( data=>{
      if(data.success){
        this.lessons = [];
        this.modules = data.output;
        this.loadLessons()
      }else{
        this.API.hideLoader();
      } 
      $obs.unsubscribe();
    })
  }

  loadLessons(){
    const $obs =  this.API.loadSpeechAllLessons().subscribe( data=>{
      if(data.success){
        this.lessons = data.output;
        this.API.hideLoader();
      }else{
        this.API.hideLoader();
      } 
      $obs.unsubscribe();
    })
  }

  // loadLesson:any[] = [{
  //   id: 1,
  //   lessonFile: 'Lesson 1 example',
  //   quizFile: 'lesson1.pdf',
  // },
  // {
  //   id: 2,
  //   lessonFile: 'Lesson 2 example',
  //   quizFile: 'lesson2.pdf',
  // }]

  openModal() {
    const modalRef = this.modalService.open(UploadLessonComponent);
    modalRef.componentInstance.modules = this.modules;
    modalRef.componentInstance.lessons = this.lessons;
    const obs$= modalRef.dismissed.subscribe(data=>{
      if(data == 'saved'){
        this.API.successSnackbar('Lesson Added')
        this.loadLessons();
      }
      obs$.unsubscribe();
    })
  }

  openModalModule() {
    // const modalRef = this.modalService.open(UploadLessonComponent);
    // modalRef.componentInstance.isModule = true;
  }

  addModule(){
    
    const obs=  this.API.createSpeechModule(`Module ${this.modules.length+1}` ).subscribe(data=>{
      this.API.successSnackbar("Module Added!")
      obs.unsubscribe();
      this.loadModules();
    })
    
  }

  deleteModule(moduleID:string){
    if(!confirm("Are you sure you want to delete this module")) return;
    const obs=  this.API.deleteSpeechModule(moduleID).subscribe(data=>{
      this.API.successSnackbar("Module deleted!")
      obs.unsubscribe();
      this.loadModules();
    })
  }
  deleteLesson(lesson:any){
    if(!confirm("Are you sure you want to delete this lesson")) return;
    const obs=  this.API.deleteSpeechLesson(lesson.id).subscribe(data=>{
      this.API.deleteFile(lesson.lessonfile.split(">")[0])
      this.API.deleteFile(lesson.quizfile.split(">")[0])
      this.API.successSnackbar("Lesson deleted!")
      obs.unsubscribe();
      this.loadLessons();
    })
  }
  editLesson(lesson:any){
    const modalRef = this.modalService.open(UploadLessonComponent);
    modalRef.componentInstance.modules = this.modules;
    modalRef.componentInstance.lessons = this.lessons;
    modalRef.componentInstance.lesson = lesson;
    const obs$= modalRef.dismissed.subscribe(data=>{
      if(data == 'saved'){
        this.API.successSnackbar('Lesson Updated')
        this.loadLessons();
      }
      obs$.unsubscribe();
    })
  }
  showForm = false;
  moduleName: string = ''; // This variable will hold the value of the input field

  toggleForm() {
    this.showForm = !this.showForm;
  }

  submitForm() {
    // You can access the input values here, for example:
    console.log('Module Name:', this.moduleName);

    // Add further logic for form submission as needed

    // Reset the form and hide it
    this.moduleName = '';
    this.showForm = false;
  }
}
