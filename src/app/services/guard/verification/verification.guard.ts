import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { APIService } from '../../API/api.service';

@Injectable({
  providedIn: 'root'
})
export class VerificationGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const token =route.paramMap.get('token');
    if(token == null){
      this.router.navigate(['login']);
    }else{
      this.API.verifyEmail(token).subscribe(data=>{
        if(data.success){
          this.API.register(data.response).subscribe(data2=>{
            // console.log(data2);
          });
          this.API.successSnackbar('Your email is now verified!');
          this.router.navigate(['login']);
        }else{
          this.API.failedSnackbar('Invalid verification token');
          this.router.navigate(['login']);
        }
      });
    }
    return true;
  }
  constructor(
    private API: APIService,
    private router:Router
  ){}
}
