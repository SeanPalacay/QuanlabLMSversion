import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/API/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';

import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  username =  this.API.getSavedEmail() ?? '';
  password = '';
  showPassword: boolean = false;
  constructor(
    private API: APIService,
    private router: Router,
    private modalService: NgbModal
  ) {}
  rememberMe:boolean = this.API.isLocalStorage();

  ngOnInit(): void {
    // console.log(this.API.getSavedEmail());
  }
  
  openModal() {
    const modalRef = this.modalService.open(ModalComponent);
    // You might pass data or perform any other operations here.
  }
  usernameHandler(event: any) {
    this.username = event.target.value;
  }
  passwordHandler(event: any) {
    this.password = event.target.value;
  }

  login() {
    if(this.rememberMe){
      this.API.useLocalStorage();
    }else{
      this.API.useSessionStorage();
    }
    this.API.login(this.username, this.password);
  }
  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }
}
