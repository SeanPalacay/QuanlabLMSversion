import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-practice-container',
  templateUrl: './practice-container.component.html',
  styleUrls: ['./practice-container.component.css']
})
export class PracticeContainerComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private API: APIService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    const moduleID = this.route.snapshot.paramMap.get('m');
    if (moduleID == null) {
      this.API.failedSnackbar('Module not Found');
      return;
    }

    const obs = this.API.loadSpeechLessons(moduleID, true).subscribe(data => {
      if (data.success) {
        this.array = [];
        for (let lesson of data.output) {
          const isTeacherRoute = this.API.getUserType() == '1';
          this.array.push({
            id: lesson.id,
            title: lesson.description,
            // desc: lesson.description,
            image: 'assets/login/school.png',
            route: isTeacherRoute ? '/teacher/speechlab/practice1' : '/student/speechlab/practice1',
            lesson: lesson.drillfile.split('>')[0],
            quiz: lesson.audiofile.split('>')[0],
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
    // this.router.navigate
  }

  redirectToOtherPage(route: string, lesson: string, quiz: string) {
    if(this.API.getUserType() =='1' && this.API.meeting){
      if(this.API.chosenPCs){
        for(let chosen of this.API.chosenPCs){
          this.API.sendDirectLabMessage('',chosen.ip,`select:${lesson};${quiz}`)
          const studentAudio =  this.API.participantsAudio.get(chosen.ip);
          studentAudio!.muted = false;
          this.API.participantsAudio.set(chosen.ip, studentAudio!);
        }
      }
      else{
        this.API.sendLabAction(`select:${lesson};${quiz}`)
      }
    }
    this.router.navigate([route, { m: lesson, q: quiz }]);
  }
}
