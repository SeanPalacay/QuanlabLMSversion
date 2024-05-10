import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';
import { Course } from 'src/app/shared/model/models';
import { Location } from '@angular/common';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.css']
})
export class LessonsComponent implements OnInit {
  lessons: any = [];
  hideMarkAsDone: boolean = false;

  constructor(private API: APIService, private router: Router, private route: ActivatedRoute, private location: Location) { }

  navigateBack(): void {
    this.location.back();
  }
  markAsDone(lesson: any) {
    lesson.progress = 100;
    const mark$ = this.API.lessonProgress(lesson.id, 100).subscribe(() => {
      mark$.unsubscribe();
    })
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.hideMarkAsDone = params['hideMarkAsDone'] === 'true';
    });

    this.API.showLoader();
    this.API.getLessons().subscribe(data => {
      this.lessons = data.output;
      console.log(this.lessons);
      this.API.hideLoader();
    });
  }

  isDone(lesson: any) {
    return Number(lesson.progress) > 0;
  }

  getURL(file: string) {
    return this.API.getURL(file);
  }

  parseTime(time: string) {
    var t = time.split(/[- :]/) as unknown as Array<number>;
    return (new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]))).toLocaleString();
  }

  openFile(file: string) {
    this.API.openFile(file);
  }
}
