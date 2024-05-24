import { Component, ElementRef, Renderer2, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/API/api.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProblemreportComponent } from '../modals/problemreport/problemreport.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  isSidebarMinimized: boolean = false;
  isStudent = this.API.getUserType() == '0';
  constructor(
    private API: APIService,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private modalService: NgbModal,
    private router: Router
  ) {}
  openModal() {
    const modalRef = this.modalService.open(ProblemreportComponent);
  }
  // Insert here sidenav content specific to teacher, student, etc
  studentDashboardItems = {
    DASHBOARD: {
      redirect: 'student/dashboard',
      icon: 'bx-border-all',
      routerLink: '/student/dashboard',
    },
    LAB: {
      redirect: 'student/lab',
      icon: 'bx-extension',
      routerLink: '/student/lab',
    },
    MEET: {
      redirect: 'student/quanhub',
      icon: 'bx-video',
      routerLink: '/student/quanhub',
    },

    TASKS: {
      redirect: '/student/to-do',
      icon: 'bx-notepad',
      routerLink: '/student/to-do',
    },
    // 'SPEECH LAB': {
    //   redirect: '/student/speechlab',
    //   icon: 'bx-notepad',
    //   routerLink: '/student/speechlab',
    // },
    // "PERFORMANCE" :  {
    //   redirect: 'student/performance',
    //   icon : 'bx-line-chart',
    //   routerLink: '/student/performance'
    // },
  };

  teacherDashboardItems = {
    DASHBOARD: {
      redirect: 'teacher/dashboard',
      icon: 'bx-border-all',
      routerLink: '/teacher/dashboard',
    },
    // "MANAGE QUIZZES" :  {
    //   redirect: "teacher/quiz-management",
    //   icon : 'bx-extension',
    //   routerLink:"/teacher/quiz-management"
    // },
    'MANAGE COURSES': {
      redirect: 'teacher/managecourse',
      icon: 'bx-book-reader',
      routerLink: '/teacher/managecourse',
    },
    'MANAGE CLASS': {
      redirect: 'teacher/manageclass',
      icon: 'bx-chalkboard',
      routerLink: '/teacher/manageclass',
    },
    MEET: {
      redirect: 'teacher/quanhub',
      icon: 'bx-video',
      routerLink: '/teacher/quanhub',
    },

    GRADES: {
      redirect: 'teacher/grade-list',
      icon: 'bx-spreadsheet',
      routerLink: '/teacher/grade-list',
    },
    // 'SPEECH LAB': {
    //   redirect: 'teacher/speechlab',
    //   icon: 'bx-spreadsheet',
    //   routerLink: '/teacher/speechlab',
    // },
    // "COMMUNICATION": {
    //   redirect: 'teacher/communication',
    //   icon : 'bx-message-rounded-detail',
    //   routerLink:"/teacher/communication"
    // },
  };

  adminDashboardItems = {
    DASHBOARD: {
      redirect: 'admin/dashboard',
      icon: 'bx-border-all',
      routerLink: '/admin/dashboard',
    },
    USERS: {
      redirect: 'admin/users',
      icon: 'bx-user',
      routerLink: '/admin/users',
    },
    COUNT: {
      redirect: 'admin/count',
      icon: 'bxs-time-five',
      routerLink: '/admin/count',
    },
    // SPEECHLAB: {
    //   redirect: 'admin/speechlab',
    //   icon: 'bxs-time-five',
    //   routerLink: '/admin/speechlab',
    // },
  };



  principalDashboardItems = {
    DASHBOARD: {
      redirect: 'admin/dashboard',
      icon: 'bx-border-all',
      routerLink: '/admin/dashboard',
    },
    USERS: {
      redirect: 'admin/users',
      icon: 'bx-user',
      routerLink: '/admin/users',
    },
    COUNT: {
      redirect: 'admin/count',
      icon: 'bxs-time-five',
      routerLink: '/admin/count',
    },
    // SPEECHLAB: {
    //   redirect: 'admin/speechlab',
    //   icon: 'bxs-time-five',
    //   routerLink: '/admin/speechlab',
    // },
  };

  displayedItems: any;
  itemKeys: any;

  checkAccount() {
    return this.API.getUserType();
  }

  ngOnInit(): void {
    this.API.downloadCourses();
    this.API.downloadProgress$.subscribe((progress) => {
      this.progress = progress;
    });
    switch (this.API.getUserData().accountType) {
      case 0:
        this.displayedItems = this.studentDashboardItems;
        break;
      case 1:
        this.displayedItems = this.teacherDashboardItems;
        break;
      case 2:
        this.displayedItems = this.adminDashboardItems;
        break;
        case 3:
        this.displayedItems = this.principalDashboardItems
        break;
      default:
        this.API.failedSnackbar('System Error');
    }
    this.itemKeys = Object.keys(this.displayedItems);

    // Retrieving elements from the DOM using ElementRef
    const body: HTMLElement = this.elRef.nativeElement;
    const sidebar: HTMLElement = body.querySelector('nav') as HTMLElement;
    const toggle: HTMLElement = body.querySelector('.toggle') as HTMLElement;
    this.renderer.addClass(document.body, 'custom:ml-64');

    // Adding a click event listener to the toggle button
    toggle.addEventListener('click', () => {
      // Toggling the 'close' class on the sidebar
      sidebar.classList.toggle('close');

      // Toggling the class for the icon transformation
      const toggleIcon: HTMLElement = body.querySelector(
        '.bx-chevron-left.toggle'
      ) as HTMLElement;
      toggleIcon.classList.toggle('rotate');

      // Add transition styles using Renderer2 for the body element
      const transitionDuration = 300; // in milliseconds
      this.renderer.setStyle(
        document.body,
        'transition',
        `margin-left ${transitionDuration}ms ease-in-out`
      );

      // Set the 'margin-left' property based on whether the sidebar is closed or open
      if (sidebar.classList.contains('close')) {
        this.renderer.removeClass(document.body, 'custom:ml-64');
        this.renderer.addClass(document.body, 'custom:ml-20');
      } else {
        this.renderer.removeClass(document.body, 'custom:ml-20');
        this.renderer.addClass(document.body, 'custom:ml-64');
      }

      this.isSidebarMinimized = !this.isSidebarMinimized;
    });
  }
  confirmBox() {
    Swal.fire({
      title: 'Are you sure want to Logout?',
      text: 'You will be redirected to login',
      icon: 'warning',
      confirmButtonColor: 'rgb(116, 254, 189)',
      cancelButtonColor: '#7F7F7F',
      showCancelButton: true,
      confirmButtonText: 'Logout!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.value) {
        Swal.fire({
          title: 'Logout Successfully!',
          text: 'Thank you for your time. :)',
          icon: 'success',
          confirmButtonColor: '#0172AF',
        }).then(() => {
          this.logout();
          this.renderer.removeClass(document.body, 'custom:ml-20');
          this.renderer.removeClass(document.body, 'custom:ml-64'); // Remove the margin-left style
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cancelled',
          text: 'We are happy you stayed :)',
          icon: 'error',
          confirmButtonColor: '#0172AF', // Replace 'yourColor' with your preferred color
        });
      }
    });
  }

  progress: number = 0;
  navigate(location: string) {
    this.router.navigate([location]);
  }

  goOffline() {
    this.API.goOffline();
  }
  logout() {
    this.renderer.removeClass(document.body, 'min-[768px]:ml-64'); // Remove the margin-left style
    this.API.logout(); // Call the logout method from your API service
  }
}
