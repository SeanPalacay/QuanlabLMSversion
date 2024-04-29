import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';
import { Location } from '@angular/common'; // Import Location service

@Component({
  selector: 'app-module-parent',
  templateUrl: './module-parent.component.html',
  styleUrls: ['./module-parent.component.css']
})
export class ModuleParentComponent implements OnInit {
  
  constructor(private API:APIService, private router:Router, private location: Location){} // Inject Location service
  selectedLab = 0;
  speechLabs:any[] = [];
  denied = true;
  isTeacher = this.API.getUserType() =='1';

  ngOnInit(): void {
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
    this.API.showLoader();
    const obs = this.API.loadSpeechAllModules().subscribe((data)=>{
      if(data.success){
        this.array = [];
        for(let module of data.output){
          this.API.hideLoader();
          // Check if the current route includes "/teacher/speechlab/"
          const isTeacherRoute = this.API.getUserType() == '1';
  
          this.array.push({
            desc:  module.description ??  'Default Description',
            title: module.name,
            image: 'assets/login/school.png',
            // Modify the route based on the condition
            route: isTeacherRoute ? '/teacher/speechlab/module' : '/student/speechlab/module',
            id: module.id,
            disabled: module.disabled == 'T' ? true :  false
          })
        }
      }else{
        this.API.hideLoader();
      }
      obs.unsubscribe();
    })
  }
  

  array: any[] = []


  openModule(module:any){
    this.router.navigate([module.route, {m:module.id}])
  }
  
}
