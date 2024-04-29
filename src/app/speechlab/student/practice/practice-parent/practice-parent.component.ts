import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';

@Component({
  selector: 'app-practice-parent',
  templateUrl: './practice-parent.component.html',
  styleUrls: ['./practice-parent.component.css']
})
export class PracticeParentComponent  implements OnInit {
  
  constructor(private API:APIService, private router:Router){}
  selectedLab = 0;
  speechLabs:any[] = [];
  // modules:any[] = [];

  isTeacher = this.API.getUserType() =='1';
  denied = true;
  ngOnInit(): void {
    if(this.isTeacher){
      this.API.resetStudents();
    }
    this.API.showLoader();
    const obs$ = this.API.getStudentAssignedLab().subscribe(data=>{
      if(data.success){
        this.loadModules();
        this.denied = false;
      }else{
        this.API.failedSnackbar('Failed to connect the server...');
        this.API.hideLoader();
      }
      obs$.unsubscribe();
    })
  }
  loadModules(){
    const obs = this.API.loadSpeechAllModules(true).subscribe((data)=>{
      if(data.success){
        this.API.hideLoader();
        this.array = [];
        for(let module of data.output){
          this.array.push({
            desc:  module.description ??  'Default Description',
            title: module.name,
            image: 'assets/login/school.png',
            route: this.isTeacher ? '/teacher/speechlab/practice' : '/student/speechlab/practice',
            id: module.id,
            disabled: module.disabled == 'T' ? true :  false
          })
        }
      }
      obs.unsubscribe();
    })
  }

  array: any[] = []


  openModule(module:any){
    this.router.navigate([module.route, {m:module.id}])
  }
  
//   [{
//     desc: 'Unit 1: Speech Communication',
//     title: 'Module 1',
//     image: 'assets/login/school.png',
//     route: '/student/speechlab/module',
//     disabled : false,
//   },
//   {
//     desc: 2,
//     title: 'Module 2',
//     image: 'assets/login/school.png',
//     route: '/student/speechlab/modules',
//     disabled : true,
//   },
// ];

  
}
