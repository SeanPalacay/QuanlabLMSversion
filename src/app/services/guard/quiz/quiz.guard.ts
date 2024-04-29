import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { APIService } from '../../API/api.service';

@Injectable({
  providedIn: 'root'
})
export class QuizGuard implements CanActivate {
  constructor( private location: Location, private API:APIService){ }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(this.API.currentPractice == null && this.API.quizID == null){
      this.location.back();
      return false;
    }
    return true;
  }
  
}
