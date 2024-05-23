import { Component, HostListener, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/API/api.service';
import { CoursecontentComponent } from '../modals/coursecontent/coursecontent.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses: any = [];
  showDropdown: boolean = false;
  selectedDifficulty: string | null = null;
  selectedValue!: any;

  constructor(
    private API: APIService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.getCourses();
  }

  toggleDropdown(selectedDifficulty: string) {
    this.showDropdown = !this.showDropdown;
  }

  selectDifficulty(difficulty: string | null) {
    this.selectedDifficulty = difficulty;
    this.showDropdown = false; // Close dropdown after selection

    switch (difficulty) {
      case 'Beginner':
        // Beginner courses have complexity between 1 and 2
        this.selectedValue = { min: 1, max: 2 };
        break;
      case 'Intermediate':
        // Intermediate courses have complexity between 3 and 4
        this.selectedValue = { min: 3, max: 4 };
        break;
      case 'Advanced':
        // Advanced courses have complexity 5
        this.selectedValue = { min: 5, max: 5 };
        break;
      default:
        console.log("Invalid difficulty selected");
        break;
    }
  }

  checkComplexity(complexity: number) {
    if (!this.selectedValue) {
      return false;
    }
    // Check if the course complexity falls within the selected range
    return complexity >= this.selectedValue.min && complexity <= this.selectedValue.max;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Check if the click event target is not inside the dropdown
    if (!this.isInsideDropdown(event.target as HTMLElement)) {
      this.showDropdown = false; // Hide the dropdown
    }
  }

  isInsideDropdown(target: HTMLElement | null): boolean {
    // Check if the target element or any of its parents have the 'dropdown' class
    while (target) {
      if (target.classList.contains('dropdown')) {
        return true;
      }
      target = target.parentElement;
    }
    return false;
  }

  getCourses() {
    this.API.showLoader();
    this.API.getCourses().subscribe(data => {
      const courses = []
      for (let course of data.output) {
        var _course = course;
        if (_course.complexity == null) {
          _course.complexity = 1;
        }
        _course.enrolled = Number(course.enrolled)
        _course.cover = this.API.randomCourseCover(course.language.toLowerCase());
        courses.push(_course);
      }
      this.courses = this.filterCourses(courses);
      this.API.hideLoader();
      // console.log(this.courses);
    });
  }

  filterCourses(courses: any[]): any[] {
    const excludedNames = ['Agnes Abunio', 'Sigfred Aler', 'Dev 101', 'Teacher Sample1'];
    return courses.filter(course => {
      const fullName = `${course.firstname} ${course.lastname}`;
      return !excludedNames.includes(fullName);
    });
  }

  openCourse(courseID: string) {
    this.API.setCourse(courseID);
    this.router.navigate(['/student/lessons']);
  }

  checkIfEnrolled(course: any) {
    // console.log(course);
    if (course.enrolled) {
      this.openCourse(course.id);
    } else {
      this.openModal(course);
    }
  }

  getUrl(file: string) {
    return this.API.getURL(file) ?? this.API.noProfile();
  }

  openModal(course: any) {
    const ref = this.modalService.open(CoursecontentComponent);
    ref.componentInstance.course = course;
    const obs$ = ref.closed.subscribe(enrolled => {
      if (enrolled) {
        this.getCourses();
      }
      obs$.unsubscribe();
    })
    // You might pass data or perform any other operations here.
  }
}
