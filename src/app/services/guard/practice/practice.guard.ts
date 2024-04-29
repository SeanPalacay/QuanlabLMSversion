import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { APIService } from '../../API/api.service';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PracticeGuard implements CanActivate {
  constructor( private location: Location, private API:APIService, private route:ActivatedRoute){ }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(this.route.snapshot.paramMap.get('lang') == undefined){
      return false;
    }
    return true;
  }
}
