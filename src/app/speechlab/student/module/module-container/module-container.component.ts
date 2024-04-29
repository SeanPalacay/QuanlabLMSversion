import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';
import { Location } from '@angular/common'; // Import Location service

@Component({
  selector: 'app-module-container',
  templateUrl: './module-container.component.html',
  styleUrls: ['./module-container.component.css']
})
export class ModuleContainerComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private API: APIService,
    private location: Location  // Inject Location service
  ) { }

  ngOnInit(): void {
    const moduleID = this.route.snapshot.paramMap.get('m');
    if (moduleID == null) {
      this.API.failedSnackbar('Module not Found');
      return;
    }
    const obs = this.API.loadSpeechLessons(moduleID).subscribe(data => {
      if (data.success) {
        this.array = [];
        for (let lesson of data.output) {
          const isTeacherRoute = this.router.url.includes("/teacher/speechlab/");
          this.array.push({
            id: lesson.id,
            title: lesson.description,
            image: 'assets/login/school.png',
            route: isTeacherRoute ? '/teacher/speechlab/learning_module' : '/student/speechlab/learning_module',
            lesson: lesson.lessonfile.split('>')[0],
            quiz: lesson.quizfile.split('>')[0],
          });
        }
      }

      obs.unsubscribe();
    });
  }

  title = 'speechLab';

  array: any[] = [];

  goBack(): void {
    this.location.back();
  }

  redirectToOtherPage(route: string, lesson: any) {
    this.API.currentLabLesson = lesson.id;
    this.router.navigate([route, { m: lesson.lesson, q: lesson.quiz }]);
  }
}
