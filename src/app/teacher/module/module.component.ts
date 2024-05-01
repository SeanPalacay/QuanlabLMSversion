  import { Component } from '@angular/core';
  import { SharedService } from 'src/app/shared.service';

  interface Module {
    id: string;
    name: string;
    lessons: Lesson[];
  }

  interface Lesson {
    id: string;
    title: string;
    content: string;
    imageUrl?: string; // Add imageUrl property to Lesson interface

  }

  @Component({
    selector: 'app-module',
    templateUrl: './module.component.html',
    styleUrls: ['./module.component.css']
  })
  export class ModuleComponent {
    modules: Module[] = [];
    newModuleName: string = '';
    newLessonTitle: string = '';
    newLessonContent: string = '';
    imageFile: File | null = null;

    constructor(private moduleService: SharedService) {
      this.getModules();
    }

    

    getModules() {
      this.moduleService.getModules().subscribe(modules => {
        this.modules = modules;
      });
    }

    createModule() {
      if (this.newModuleName) {
        const moduleData: { name: string, lessons: Lesson[] } = {
          name: this.newModuleName,
          lessons: []
        };
        this.moduleService.createModule(moduleData).then(() => {
          this.newModuleName = ''; // Reset the input field after successful creation
          this.getModules(); // Refresh the modules list after creation
        }).catch(error => {
          console.error('Error creating module:', error); // Handle any potential errors
        });
      }
    }
    

    deleteModule(moduleId: string) {
      this.moduleService.deleteModule(moduleId).then(() => {
        this.getModules();
      });
    }

    createLesson(moduleId: string) {
  if (this.newLessonTitle && this.newLessonContent && this.imageFile) {
    const lessonData: { title: string, content: string, imageFile: File } = {
      title: this.newLessonTitle,
      content: this.newLessonContent,
      imageFile: this.imageFile
    };
    this.moduleService.createLesson(moduleId, lessonData).then(() => {
      if (this.selectedModule && this.selectedModule.id === moduleId) {
        // Create a new lesson object with the provided data
        const newLesson: Lesson = {
          id: '', // Assign an appropriate ID here
          title: this.newLessonTitle,
          content: this.newLessonContent,
          imageUrl: this.imageFile ? URL.createObjectURL(this.imageFile) : '' // Check if this.imageFile is not null before creating the URL
        };
        this.selectedModule.lessons.push(newLesson);
      }
      this.newLessonTitle = '';
      this.newLessonContent = '';
      this.imageFile = null;
    }).catch(error => {
      console.error('Error creating lesson:', error);
    });
  }
}
    onFileSelected(event: any) {
      if (event.target.files && event.target.files.length > 0) {
        this.imageFile = event.target.files[0];
      }
    }
    
    toggleLessons(module: any) {
      module.showLessons = !module.showLessons;
    }

    deleteLesson(moduleId: string, lessonId: string) {
      console.log("Module Id:", moduleId);
      console.log("Lesson Id:", lessonId);
      this.moduleService.deleteLesson(moduleId, lessonId).then(() => {
        if (this.selectedModule && this.selectedModule.id === moduleId) {
          const index = this.selectedModule.lessons.findIndex(lesson => lesson.id === lessonId);
          if (index !== -1) {
            this.selectedModule.lessons.splice(index, 1);
          }
        }
      }).catch(error => {
        console.error('Error deleting lesson:', error);
      });
    }
    
     selectedModule: Module | null = null;

     openModal(module: Module) {
      this.selectedModule = module;
    }
  
    closeModal() {
      this.selectedModule = null;
    }
    
    
    
  }