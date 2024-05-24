import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewclassComponent } from '../modals/newclass/newclass.component';
import { APIService } from 'src/app/services/API/api.service';
import { __classPrivateFieldIn } from 'tslib';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manageclass',
  templateUrl: './manageclass.component.html',
  styleUrls: ['./manageclass.component.css'],
  
})
export class ManageclassComponent implements OnInit {


  getURL(file: string) {
    if (file.includes('http')) {
      return file;
    } else {
      return this.API.getURL(file);
    }
  }
  
  courses:Map<string, any> = new Map();;
  classes:any
  selectedClass:any;
  selectedStudent:any;
  constructor (
    private modalService: NgbModal,
    private API:APIService
  ){}
    openModal() {
      const modalRef = this.modalService.open(NewclassComponent);
      modalRef.componentInstance.courses = this.courses;
      modalRef.closed.subscribe(data=>{
        if(data=='update'){
          this.loadClasses();
        }
      });
      // You might pass data or perform any other operations here.
    }
    openEditModal(classID: string, className: string, classCode: string, daySchedule: string, timeSchedule: string, courseID: string) {
      const modalRef = this.modalService.open(NewclassComponent);
      modalRef.componentInstance.courses = this.courses;
      modalRef.componentInstance.data = {
        classID: classID,
        className: className,
        classCode: classCode,
        daySchedule: daySchedule,
        timeSchedule: timeSchedule,
        courseID: courseID
      };
      modalRef.closed.subscribe(data => {
        if (data === 'update') {
          this.loadClasses();
        }
      });
    }


    // start ton
    editing = false;
    students:any[]= [];
    student: any;
    


    ngOnInit(): void {
      this.loadClasses();
      this.loadCourses();
      this.loadStudents();
    }


    toggleEdit() {
      this.editing = !this.editing;
      if (!this.editing) {
        const obs$ = this.API.updateFromTeacher(
          this.student.id,
          this.student.firstname,
          this.student.lastname
        ).subscribe(()  => {
          this.API.successSnackbar("Updated");
          obs$.unsubscribe();
        });
      }
    }
    
    loadStudents(){
      const obs$ = this.API.getStudentsTeacher().subscribe((data) => {
        if (data.success) {
          this.students = data.output;
        } else {
          this.API.failedSnackbar('Unable to load student data');
        }
        obs$.unsubscribe();
      });
    }
  

    
   
    studentModal: boolean = false;
    editStudentModal: boolean = false;
    confirmDelete: boolean = false;
    editStudentProfile: boolean = false;

    openStudentModal() {
      this.studentModal = true;
    }

    closeStudentModal() {
      this.studentModal = false;
    }

    openEditStudentModal() {
      this.editStudentModal = true;
    }

    closeEditStudentModal() {
      this.editStudentModal = false;
    }

   

    editStudentProfileModal() {
      this.editStudentProfile = true;
    }

    closeStudentProfileModal() {
      this.editStudentProfile = false; 
    }

    yesEditProfile() {
      this.editStudentProfile = false;
    }

    ekisEditProfile() {
      this.editStudentProfile = false;
    }

    editProfileInfo() {
      if (this.editing) {
          this.editing = false;
      } else {
          this.editing = true;
      }
  }

  

    selectedStudentId: string | null = null;

    viewStudentProfile(student: any) {
      this.selectedStudentId = student.id;
      this.student = student;
      this.editStudentProfile = true;
    }

 

    openConfirmDelete(student: any) {
      this.confirmDelete = true;
      this.student = student;
    }

    noConfirmDelete() {
      this.confirmDelete = false;
    }

    yesConfirmDelete() {
      this.API.deleteStudentFromCourse(this.student.class_id, this.student.id).subscribe(data => {
        this.confirmDelete = false;
        this.loadStudents();
        this.loadClasses();
        this.API.successSnackbar("Delete");
      })
    }
    



    editingEmail = false;

    

    noProfile() {
      return this.API.noProfile();
    }


   
  
  
 
   
    // end ton
    
    
    selectClass(selected:string){
      this.selectedClass = selected; 
    }

    deleteClass(classID:string){

      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success"
          });
          this.API.deleteClass(classID).subscribe(data=>{
            this.loadClasses();
          });
        }
      });

    }

    parsetime(schedule:string){
      const datetime = schedule.split("(");
      const days = datetime[0].trim();
      const time = datetime[1].replaceAll(")", "").trim();
      return [days,time];
    }
  

    loadCourses(){
      this.API.showLoader();
      this.API.teacherAllCourses().subscribe(data=>{
        if(data.success){
          for(let _class of data.output){
              this.courses.set(_class.id, _class);
          }
        }else{
          this.API.failedSnackbar('Failed loading courses');
        }
      });
    }

    loadClasses(){
      this.API.showLoader();
      this.API.teacherAllClasses().subscribe(data=>{
        if(data.success){
          this.classes = data.output;
        }else{
          this.API.failedSnackbar('Unable to connect to the server.', 3000);
        }
        this.API.hideLoader();
      });
     
    }


    missingInput  (classID: string, className: string, classCode: string, daySchedule: string, timeSchedule: string, courseID: string) {
   
      if (!classID || !className || !classCode || !daySchedule || !timeSchedule || !courseID) {
      
        this.API.failedSnackbar('Missing Input');
        return;
      }
    
   
    }
}
