  import { Component, OnDestroy, OnInit } from '@angular/core';
  import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
  import { AddTeachersComponent } from '../modals/add-teachers/add-teachers.component';
  import { AddStudentsComponent } from '../modals/add-students/add-students.component';
  import { EditDetailsComponent } from '../modals/edit-details/edit-details.component';
  import { APIService } from 'src/app/services/API/api.service';
  import { Subscription, firstValueFrom } from 'rxjs';
import { AddPrincipalComponent } from '../modals/add-principal/add-principal.component';

  @Component({
    selector: 'app-users-page',
    templateUrl: './users-page.component.html',
    styleUrls: ['./users-page.component.css'],
  })
  export class UsersPageComponent implements OnInit, OnDestroy {
    constructor(private modalService: NgbModal, private API: APIService) {}

    getStudents$?: Subscription;
    getTeachers$?: Subscription;

    students: any[] = [];
    teachers: any[] = [];
    admins: any[] = [];
    selectedUser: any;
    selectedRow: any;

    ngOnInit(): void {
      this.getTeachers();
      this.getAdmins();
      this.API.verificationNotifier.subscribe(()=>{
        this.getStudents();
      })
      
    }


    editDetailsPrincipal() {
      if (this.selectedUser) {
        const id = this.API.getUserData().id;
        if(this.selectedUser.id == 'e571ca08816a41bcbc6f498f510cef12'){
          if(id != 'e571ca08816a41bcbc6f498f510cef12'){
            this.API.failedSnackbar('Only the root administrator can edit this account');
            return;
          }
        }
        const modalRef = this.modalService.open(AddPrincipalComponent);
        modalRef.componentInstance.selectedUser = this.selectedUser;
        modalRef.closed.subscribe(updates=>{
          if(updates){
            this.getAdmins();
            this.API.successSnackbar('Updated admin info!');
            this.selectedUser = null;
            this.selectedRow = null;
          }
        })
      }
    }
    
    // Add Principal
    addPrincipal() {
      const modalRef = this.modalService.open(AddPrincipalComponent);
      modalRef.closed.subscribe(updates=>{
        if(updates){
          this.getAdmins();
          this.API.successSnackbar('Added a new admin!');
        }
      })
    }

    getPending(){
      const pend$ = this.API.getPendingStudents().subscribe((data) => {
        if (data.success) {
          this.students = data.output.concat(this.students);
        } else {
          this.API.failedSnackbar('Unable to load pending data');
        }
        pend$.unsubscribe();
      });
    }

    getStudents(){
      this.getStudents$ = this.API.getStudents().subscribe((data) => {
        if (data.success) {
          this.students = data.output;
          this.getPending();
        } else {
          this.API.failedSnackbar('Unable to load student data');
        }
      });

    }
    getTeachers(){
      this.getTeachers$ = this.API.getTeachers().subscribe((data) => {
        if (data.success) {
          this.teachers = data.output;
        } else {
          this.API.failedSnackbar('Unable to load teachers data');
        }
      });
    }

    getAdmins(){
      const admin$ = this.API.getAdmins().subscribe((data) => {
        if (data.success) {
          this.admins = data.output;
        } else {
          this.API.failedSnackbar('Unable to load admin data');
        }
        admin$.unsubscribe();
      });
    }

    ngOnDestroy(): void {
      this.getStudents$?.unsubscribe();
      this.getTeachers$?.unsubscribe();
    }
    editDetailsTeacher() {
      if (this.selectedUser) {
        const modalRef = this.modalService.open(AddTeachersComponent);
        modalRef.componentInstance.selectedUser = this.selectedUser;
        modalRef.closed.subscribe(updates=>{
          if(updates){
            this.getTeachers();
            this.API.successSnackbar('Updated teacher info!');
            this.selectedUser = null;
            this.selectedRow = null;
          }
        })
      }
    }

    editDetailsStudent() {
      if (this.selectedUser) {
        const modalRef = this.modalService.open(AddStudentsComponent);
        modalRef.componentInstance.selectedUser = this.selectedUser;
        modalRef.closed.subscribe(updates=>{
          if(updates){
            this.getStudents();
            this.API.successSnackbar('Updated student info!');
            this.selectedUser = null;
            this.selectedRow = null;
          }
        })
      }
    }

    addTeachers() {
      const modalRef = this.modalService.open(AddTeachersComponent);
      modalRef.closed.subscribe(updates=>{
        if(updates){
          this.getTeachers();
          this.API.successSnackbar('Added a new teacher!');
        }
      })
      // You might pass data or perform any other operations here.
    }

    addStudents() {
      const modalRef = this.modalService.open(AddStudentsComponent);
      // You might pass data or perform any other operations here.
    }

    delete(){
      if(this.selectedUser){
        if(this.selectedUser.id == 'e571ca08816a41bcbc6f498f510cef12' && this.selectedOption.toLowerCase() =='administrators'){
          this.API.failedSnackbar('This is the root administrator, unable to delete account!')
          return;
        }
        if(!confirm('Are you sure you want to delete this user?')){
          return;
        }
        this.API.justSnackbar('Deleting account ...');
        this.API.deleteAccount(this.selectedUser.id, this.selectedOption.toLowerCase()).subscribe(data=>{
          this.API.failedSnackbar('Deleted Account!')
          if(this.selectedOption == 'Teachers'){
            this.getTeachers();
          }else if(this.selectedOption == 'Students'){
            this.getStudents();
          }else{
            this.getAdmins();
          }

          this.selectedUser = null;
          this.selectedRow = null;
        })
      }
    }

    isDropdownOpen = false;
    selectedOption: string = 'Students';

    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    }

    parseDate(date: string) {
      return this.API.parseDateTime(date);
    }

    selectUser(user: any) {
      this.selectedUser = user;
      this.selectedRow = user; // Added line to track the selected row
    }


    refreshData() {
      this.API.getStudents().subscribe((data) => {
        if (data.success) {
          this.students = data.output;
        } else {
          this.API.failedSnackbar('Unable to load student data');
        }
      });

      this.API.getTeachers().subscribe((data) => {
        if (data.success) {
          this.teachers = data.output;
        } else {
          this.API.failedSnackbar('Unable to load teachers data');
        }
      });
    }

    selectOption(option: string) {
      this.selectedOption = option;
    }

    acceptStudent(student: any) {
      const acc$ =  this.API.adminVerifyToken(student.token).subscribe(data=>{
        if(data.success){
          this.API.register(data.response).subscribe( async data2=>{
            // console.log(data2);
            await firstValueFrom(this.API.removeFromVerification(student.email));
            this.getStudents();
          });
          this.API.successSnackbar('Email verified!');
          student.approved = true;
        }else{
          this.API.failedSnackbar(data.response);
        }
        acc$.unsubscribe();
      });
 
      // this.API.updateStudentApproval(student.id, true).subscribe((data: any) => {
      //   if (data.success) {
      //     this.API.successSnackbar('Student approved!');
      //     this.getStudents();
      //   } else {
      //     this.API.failedSnackbar('Failed to approve student');
      //   }
      // });
    }
  
    async cancelStudent(student: any) {
      // Add your logic for canceling a student here
      if(confirm('Are you sure you want to reject this account?')){

        await firstValueFrom(this.API.removeFromVerification(student.email));
        await firstValueFrom(this.API.adminRejectToken(student.token));
        this.getStudents();
        this.API.failedSnackbar('Account has been rejected.');
      }
    }
  
    acceptTeacher(teacher: any) {
      teacher.approved = true;
      this.API.updateTeacherApproval(teacher.id, true).subscribe((data: any) => {
        if (data.success) {
          this.API.successSnackbar('Teacher approved!');
          this.getTeachers();
        } else {
          this.API.failedSnackbar('Failed to approve teacher');
        }
      });
    }
  
    cancelTeacher(teacher: any) {
      // Add your logic for canceling a teacher here
      console.log('Canceling teacher:', teacher);
    }
  }
