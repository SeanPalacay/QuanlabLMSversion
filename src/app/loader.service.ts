import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  show(): void {
    console.log('Showing loader');
    this.isLoading.next(true);
    // setTimeout(() => {
    //   this.isLoading.next(false);
    //   console.log('Hiding loader');
    // }, 2000); // Hide after 3 seconds
  }

  hide():void{
    this.isLoading.next(false);
  }
  
}
