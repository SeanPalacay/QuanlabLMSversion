import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CreateCourseComponent } from '../modals/create-course/create-course.component';
import { APIService } from 'src/app/services/API/api.service';
import { Router } from '@angular/router';
import { EditCourseComponent } from '../modals/edit-course/edit-course.component';
import { filter, firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-tlesson',
  templateUrl: './managecourse.component.html',
  styleUrls: ['./managecourse.component.css']
})
export class ManageCourseComponent implements OnInit {
  languages:Map<string, any> = new Map();
  selectedLanguage: string = '';

  constructor( private modalService: NgbModal, 
    private API: APIService,
    private router:Router
  ){}

  courseData:any = [
    // {
    //   title: 'English Mastery Course',
    //   lessons: 10,
    //   mode: 'Online',
    //   description: 'Elevate your English skills with our focused "English Mastery" course. From mastering grammar essentials to honing persuasive writing and confident speaking, unlock your language potential in just a few sessions. This is a long description that exceeds 10 words to test the "Read More" functionality.'
    // },
    // Add more course data as needed
  ];

  ngOnInit(): void {
    this.API.getAllLanguages().subscribe(data=>{
      if(data.success){
        for(let language of data.output){
          this.languages.set(language.language, language);
        }
      }else{
        this.API.failedSnackbar('Failed loading data');
      }
    })
    this.getTeacherCourses();
  }

  languageSelected(language: string) {
    this.selectedLanguage = language;
    // Implement your logic based on the selected language
  }

  getTeacherCourses(){
    this.API.showLoader();
    this.courseData=[];
    this.API.teacherAllCourses().subscribe(data=>{
      if(data.success){
        for(let course of data.output){
          var  mode = 'LRSW';
          if(course.filter != null){
            mode = course.filter;
          }
          this.courseData.push({
            id: course.id,
            lang: course.languageid,
            title : course.course,
            lessons : course.lessons,
            description: course.details,
            image: course.image,
            mode: mode
          });
        }
        this.API.hideLoader();
      }else{
        this.API.failedSnackbar('Failed loading courses');
      }
    })
  }

  removeCourse(courseID: string) {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Remove it!"
    }).then((result) => {
        if (result.isConfirmed) {
            this.API.deleteCourse(courseID).subscribe(() => {
                this.getTeacherCourses();
                Swal.fire({
                    title: "Removed!",
                    text: "Your file has been deleted.",
                    icon: "success"
                });
            });
        }
    });
}

  editCourse(course:any){
    this.router.navigate(['teacher/manage-lessons',{cid: course.id}]);
  }
  openModal() {
    const modalOptions: NgbModalOptions = {
      centered: false
      // You can add other options here if needed
    };

    const modalRef = this.modalService.open(CreateCourseComponent, modalOptions);
    modalRef.componentInstance.myCustomClass = 'custom-modal'; // Pass the custom class name
    modalRef.componentInstance.languages = this.languages;
    modalRef.closed.subscribe(data=>{
      if(data != null){
        this.getTeacherCourses();
      }
    });
    // You might pass data or perform any other operations here.
  }


  openEdit(course:any) {
    const modalOptions: NgbModalOptions = {
      centered: false
    };
    console.log(course)
    const modalRef = this.modalService.open(EditCourseComponent, modalOptions);
    modalRef.componentInstance.myCustomClass = 'custom-modal'; // Pass the custom class name
    modalRef.componentInstance.languages = this.languages;
    modalRef.componentInstance.info = course;
    
    modalRef.closed.subscribe(data=>{
      if(data != null){
        this.getTeacherCourses();
      }
    });
    // You might pass data or perform any other operations here.
  }

  // distributeCertificate(course: any) {
  //   Swal.fire({
  //     title: 'Distribute Certificates',
  //     text: 'Certificates will only be distributed to the students who finished the course.',
  //     icon: 'info',
  //     showCancelButton: true,
  //     confirmButtonText: 'Distribute',
  //     cancelButtonText: 'Cancel'
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       // Perform the certificate distribution logic here
  //       // You can access the course object and distribute certificates accordingly
  //       console.log('Distributing certificates for course:', course);
  //       // Add your certificate distribution code here
        
  //       Swal.fire('Certificates Distributed', 'Certificates have been successfully distributed to eligible students.', 'success');
  //     }
  //   });
  // }

  // async showCertificateModal(course: any) {
  //   const pdfUrl = 'path/to/certificate.pdf'; // Replace with the actual URL or path to the certificate PDF
  
  //   const result = await Swal.fire({
  //     title: 'Certificate Preview',
  //     html: `
  //       <div style="width: 100%;">
  //         <iframe src="${pdfUrl}" width="100%" height="500px" style="border: none;"></iframe>
  //         <button id="distribute-btn" class="swal2-confirm swal2-styled" style="margin-top: 20px;">Distribute</button>
  //       </div>
  //     `,
  //     showConfirmButton: false,
  //     showCancelButton: true,
  //     cancelButtonText: 'Close',
  //     customClass: {
  //       popup: 'wide-popup',
  //     },
  //     width: '800px',
  //   });
  
  //   if (result.isConfirmed) {
  //     // Perform the certificate distribution logic here
  //     console.log('Distributing certificates for course:', course);
  //     // Add your certificate distribution code here
  
  //     Swal.fire('Certificates Distributed', 'Certificates have been successfully distributed to eligible students.', 'success');
  //   }
  // }
  
  async showCertificateModal(course: any) {
    const imageUrl = 'assets/cert/ace-cert.png'; // Replace with the actual URL or path to the certificate image
    const teacherSign = this.API.getUserData().esign;
    const response =  await firstValueFrom(this.API.getCNSCPresident());
    if(response.output.length <= 0){
      this.API.failedSnackbar('Unable to retrieve certificate information');
    }
    const president = response?.output?.[0];
    if(!teacherSign){
      this.API.failedSnackbar('Please sign the certificate on your profile.');
    }
    if(!president?.esign){
      this.API.failedSnackbar('President have not signed the certificate yet.');
    }
    const result = await Swal.fire({
      title: 'Certificate Preview',
      html: `
        <div style="width: 740px;" class='select-none overflow-hidden'>
          <div class='relative w-full h-[500px]'>
            <div class='absolute top-[54%] left-6 w-full flex justify-center z-10 font-semibold text-3xl text-black'>
              JUAN DE LA CRUZ
            </div>

            <div class='absolute top-[64.8%] left-6 w-full flex justify-center z-10 font-bold text-xs text-black'>
              ${course.title.toUpperCase()}
            </div>
            
            
            <div class='absolute bottom-[9.2%] left-[19%] w-full  flex justify-center z-20'>
              <img src ='${ teacherSign ?  this.API.getURL(teacherSign) : ''}' class=' h-24 w-32  object-contain ${teacherSign? '':'hidden'}'>
            </div>
            <div class='absolute bottom-[13%] left-[19%] w-full flex justify-center z-10 font-bold text-xs text-black'>
              ${this.API.getFullName().toUpperCase()}
            </div>
            <div class='absolute bottom-[9.2%] right-[10%] w-full  flex justify-center z-20'>
              <img src ='${ president?.esign ?  this.API.getURL(president?.esign) : ''}' class=' h-24 w-32  object-contain ${president?.esign ? '':'hidden'}'>
            </div>
            <div class='absolute bottom-[13%] right-[10%] w-full flex justify-center z-10 font-bold text-xs text-black'>
              ${president? president.firstname.toUpperCase() + ' ' + president.lastname.toUpperCase() : ''}
            </div>
            
            <img src="${imageUrl}" alt="Certificate" class='absolute' style="height: 100%; width:100%; object-fit: contain;">
          </div>
          <button id="distribute-btn" class="swal2-confirm swal2-styled" style="margin-top: 20px;">Distribute</button>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Close',
      customClass: {
        popup: 'wide-popup',
      },
      width: '800px',
      didOpen: () => {
        const popup = Swal.getPopup();
        if (popup) {
          const distributeBtn = popup.querySelector('#distribute-btn');
          if (distributeBtn) {
            distributeBtn.addEventListener('click', () => {
              Swal.fire({
                title: 'Distribute Certificates',
                text: 'Are you sure you want to distribute certificates to the eligible students?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, distribute',
                cancelButtonText: 'Cancel'
              }).then( async(confirmResult) => {
                if (confirmResult.isConfirmed) {
                  this.API.distributeCertificates(course.id)
                  // Add your certificate distribution code here
                  Swal.fire('Certificates Distributed', 'Certificates have been successfully distributed to eligible students.', 'success');
                }
              });
            });
          }
        }
      },
    });
  
    if (result.dismiss === Swal.DismissReason.cancel) {
      console.log('Certificate preview closed without distribution.');
    }
  }

  redirectToLessons(courseID: string) {
    this.API.setCourse(courseID);
    this.router.navigate(['/teacher/lessons'], { queryParams: { hideMarkAsDone: true } });
  }
  
}

