import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { APIService } from 'src/app/services/API/api.service';

import {v4 as uuidv4} from 'uuid';
import Swal from 'sweetalert2';
interface Lesson {
  id?:string,
  lessonName: string;
  coverImage:File|string|null;
  fileupload: File|string|null;
  description: string;
  complexity: number;
}

@Component({
  selector: 'app-edit-course',
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.css']
})
export class EditCourseComponent  implements OnInit{
  @Input() myCustomClass: string = '';
  @Input() languages:Map<string, any> = new Map<string, any>();
  @Input() info:any = null;
  lessons: Lesson[] = [];
  selectedFileName: string | undefined;
  audioDescription: string = ''; // Added property for audio description

  // form
  language:string='';
  mode:any = {}
  courseTitle:string = '';
  courseDesc:string = '';

  constructor(public activeModal: NgbActiveModal, private API:APIService) {
    
  }

  ngOnInit(): void {
    this.courseTitle = this.info.title;
    this.courseDesc = this.info.description;
    this.language = Array.from(this.languages.values()).filter(value=> value.id == this.info.lang)[0].language;
    this.mode = {
      listen:this.info.mode?.includes('L')?'on' :'off',
      read:this.info.mode?.includes('R')?'on':'off',
      speak:this.info.mode?.includes('S')?'on' :'off',
      write:this.info.mode?.includes('W')?'on':'off',
    }
    this.API.teacherCourseLessons(this.info.id).subscribe(data=>{
 
      for(let lesson of data.output){
        console.log(lesson);
        this.lessons.push({
          id:lesson.id,
          lessonName: lesson.title,
          coverImage: lesson.background,
          fileupload: lesson.attachments,
          description:lesson.details,
          complexity: (Math.round((Number(lesson.difficulty)*(3/5))-1)),
        });
      }
      console.log(this.lessons);
    })
  }

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

  deleteQueue:any = [];


  delete(lesson: any) {
    if (this.lessons.length <= 1) {
      this.API.failedSnackbar('This course should at least have one lesson');
      return;
    }
  
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Remove it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteQueue.push(lesson.id);
        const index = this.lessons.indexOf(lesson);
        if (index > -1) {
          this.lessons.splice(index, 1);
        }
        Swal.fire({
          title: "Removed!",
          text: "Your file has been deleted.",
          icon: "success"
        });
      }
    });
  }
  

  getGradient(): string {
    return 'linear-gradient(to right, #ff9a9e, #fad0c4)';
  }
  
  listen(e:any){
    this.mode.listen = e.target.value;
  }
  read(e:any){
    this.mode.read = e.target.value;
  }
  speak(e:any){
    this.mode.speak = e.target.value;
  }
  write(e:any){
    this.mode.write = e.target.value;
  }

  onFileSelected(event: Event, lesson:Lesson){
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      lesson.fileupload = inputElement.files[0];
    }
  }

  importImage(event: Event, lesson:Lesson){
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
      if(!validImageTypes.includes(inputElement.files[0].type)){
        this.API.failedSnackbar('Select valid image file type!');
        return;
      }
      lesson.coverImage = inputElement.files[0];
    }
  }

  setComplexity(complexity:number, lesson:Lesson){
    lesson.complexity =  complexity;
  }


  complexityOptions = ['Beginner', 'Intermediate', 'Advanced'];
  selectedcomplexity: string = 'Beginner';

  async submit() {
    // Handle form submission logic, including using this.audioDescription
    var modeString = '';
    modeString += (this.mode.listen == 'on'||this.mode.listen == true)? 'L' : ''; 
    modeString += (this.mode.read == 'on'||this.mode.listen == true)? 'R' : ''; 
    modeString += (this.mode.speak == 'on'||this.mode.listen == true)? 'S' : ''; 
    modeString += (this.mode.write == 'on'||this.mode.listen == true)? 'W' : ''; 

    if(this.courseTitle == ''){
      this.API.failedSnackbar('Course title should not be empty!');
      return;
    }
    if(this.courseDesc == ''){
      this.courseDesc = '[NONE]'
    }
    if(this.language == ''){
      this.API.failedSnackbar('Please select course language!');
      return;
    }
    if(modeString == ''){
      this.API.failedSnackbar('Should contain at least one mode of learning!');
      return;
    }    

    for(let lesson of this.lessons){
      if(lesson.lessonName.trim() == ''){
        this.API.failedSnackbar('Lesson titles should be completely filled.');
        return;
      }
    }
    const genID = this.info.id;
    this.API.justSnackbar('Updating course, Please Wait...', 99999999999999);
    await firstValueFrom(this.API.updateCourse(genID,this.courseTitle, this.courseDesc, modeString, this.languages.get(this.language).id))
    for(let lesson of this.lessons){
      var attachments = undefined;
      var imageupload = undefined;
      const complexity =   (Number(lesson.complexity )+ 1) * (5/3)

      if(lesson.description.trim() == ''){  
        lesson.description = '[NONE]';
      }
      if(lesson.fileupload != undefined && !(typeof lesson.fileupload == 'string')){
        var fileparse = (lesson.fileupload as File).name.split(".");
        var serverLocation = uuidv4()+ '.' + fileparse[fileparse.length-1];
        this.API.uploadFile((lesson.fileupload as File), serverLocation);
        var filelocation = 'files/' + serverLocation;
        var filename = (lesson.fileupload as File).name;
        attachments = filelocation+'>'+filename; 
      }

      if(lesson.coverImage != undefined && !(typeof lesson.coverImage == 'string')){
        var fileparse = (lesson.coverImage as  File).name.split(".");
        var serverLocation = uuidv4()+ '.' + fileparse[fileparse.length-1];
        this.API.uploadImage((lesson.coverImage as File), serverLocation);
        var filelocation =  'image_upload/' + serverLocation;
        imageupload = filelocation; 
      }
      
      if(lesson.id){
        await firstValueFrom(this.API.updateLesson(genID,lesson.id!,lesson.lessonName, lesson.description, complexity,attachments, imageupload));
      }else{
        await firstValueFrom(this.API.createLesson(genID,lesson.lessonName, lesson.description, complexity,attachments, imageupload));
      }
    }

    for(let lesson of this.deleteQueue){
      await firstValueFrom(this.API.deleteLesson(lesson));
    }

    this.API.successSnackbar('Done!');
    this.activeModal.close('update');
  }

  addLesson() {
    this.thisLesson();
  }

  
  getFilename(file:any){
    if((typeof file == 'string')){
      return file.split('>')[1];
    }else{
      return file.name;
    }
  }

  selectLanguage(langID:string){
    this.language = langID!;
  }

  closeModal() {
    this.activeModal.close();

  }
}
