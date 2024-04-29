import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { APIService } from '../../API/api.service';

@Injectable({
  providedIn: 'root'
})
export class PortalGuard{
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
      if(!this.API.isLoggedIn() ||this.API.getUserType() != '0'){
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
