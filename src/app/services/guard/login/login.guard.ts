import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { APIService } from '../../API/api.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if(this.API.isLoggedIn()){
        switch(this.API.getUserType()){
          case '0':
            this.router.navigate(['/student/dashboard']);
            break;
          case '1':
            this.router.navigate(['/teacher/dashboard']);
            break;
          case '2':
            this.router.navigate(['/admin/dashboard']);
            break;
        }
      }
      return true;
  }
  constructor(
    private API: APIService,
    private router:Router, 
  ){}
}
