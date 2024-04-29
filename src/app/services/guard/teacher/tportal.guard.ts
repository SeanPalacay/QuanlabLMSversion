import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { APIService } from '../../API/api.service';

@Injectable({
  providedIn: 'root'
})
export class TportalGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if(!this.API.isLoggedIn() ||this.API.getUserType() != '1'){
        this.router.navigate(['/login']);
        return false;
      }
      return true;
  }
  
  constructor(
    private API: APIService,
    private router: Router,
  ){}
}
