import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, UrlSegment } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    templateUrl: './dashboard.component.html'
  })
export class DASHBOARD implements OnInit {
  shouldShowHeader: boolean = true;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const urlSegments: UrlSegment[] = this.activatedRoute.snapshot.url;
        const url: string = urlSegments.map(segment => segment.path).join('/');

        // Check if the URL includes '/student/quiz-page'
        this.shouldShowHeader = !url.includes('student/quiz-page');
      });
  }
}
