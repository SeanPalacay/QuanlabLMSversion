import { Component, OnInit, Renderer2 } from '@angular/core';
import { APIService } from 'src/app/services/API/api.service';
import { Course } from 'src/app/shared/model/models';

@Component({
  selector: 'app-lesson-page',
  templateUrl: './lesson-page.component.html',
  styleUrls: ['./lesson-page.component.css']
})
export class LessonPageComponent {

  lessons:any = [];

  constructor(private API: APIService, private renderer: Renderer2) {}

  ngOnInit() {
    this.API.loadOffline().subscribe(data=>{
      this.lessons = data.output;
    });
  }

  getURL(file:string){
    return this.API.getURL(file);
  }

  parseTime(time:string){
    var t = time.split(/[- :]/) as unknown as Array<number>;

// Apply each element to the Date function
  return (new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]))).toLocaleString();
  }

  openFile(file:string){
    this.API.openLocalFile(file);
  }

}
