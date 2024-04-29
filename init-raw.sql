

CREATE TABLE IF NOT EXISTS students (
  ID varchar(32) NOT NULL,
  FirstName varchar(50)  NOT NULL,
  LastName varchar(50)  NOT NULL,
  Username varchar(20) NOT NULL,
  Password varchar(255) NOT NULL,
  Profile varchar(255) DEFAULT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS teachers(
  ID varchar(32) NOT NULL,
  FirstName varchar(50)  NOT NULL,
  LastName varchar(50)  NOT NULL,
  Username varchar(20) NOT NULL,
  Password varchar(255) NOT NULL,
  Job varchar(255) NOT NULL,
  Profile varchar(255) DEFAULT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS administrators(
  ID varchar(32) NOT NULL,
  FirstName varchar(50)  NOT NULL,
  LastName varchar(50)  NOT NULL,
  Username varchar(20) NOT NULL,
  Password varchar(255) NOT NULL,
  Profile varchar(255) NOT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS languages (
  Language varchar(50)  NOT NULL,
  ID int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS courses (
  TeacherID varchar(32) NOT NULL,
  LanguageID int NOT NULL,
  Course varchar(255) NOT NULL,
  Difficulty double NOT NULL,
  ID varchar(32) NOT NULL,
  Filter varchar(255) DEFAULT NULL,
  Image varchar(255) DEFAULT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (LanguageID) REFERENCES languages(ID) ON DELETE CASCADE,
  FOREIGN KEY (TeacherID) REFERENCES teachers(ID) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS classes (
  CourseID varchar(32) NOT NULL,
  Class VARCHAR(255) NOT NULL,
  ClassCode varchar(30) NOT NULL,
  Schedule varchar(255) NOT NULL,
  ID int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID),
  FOREIGN KEY (CourseID) REFERENCES courses(ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_class (
  StudentID varchar(32) NOT NULL,
  ClassID int NOT NULL,
  Pending boolean NOT NULL DEFAULT FALSE,
  ID int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID),
  FOREIGN KEY (ClassID) REFERENCES classes(ID) ON DELETE CASCADE,
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS proficiency_stamp (
  StudentID varchar(32) NOT NULL,
  LanguageID int NOT NULL,
  SPoints double NOT NULL DEFAULT 0.0,
  LPoints double NOT NULL DEFAULT 0.0,
  RPoints double NOT NULL DEFAULT 0.0,
  Speaks double NOT NULL DEFAULT 0.0,
  Listens double NOT NULL DEFAULT 0.0,
  `Reads` double NOT NULL DEFAULT 0.0,
  ID int NOT NULL AUTO_INCREMENT,
  Stamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  PRIMARY KEY (ID),
  FOREIGN KEY (LanguageID) REFERENCES languages(ID) ON DELETE CASCADE,
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS practices (
  LanguageID int NOT NULL,
  Practice varchar(255) NOT NULL,
  Description varchar(255) NOT NULL,
  ID int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID),
  FOREIGN KEY (LanguageID) REFERENCES languages(ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS practice_tasks (
  PracticeID int NOT NULL,
  Task varchar(255) NOT NULL,
  Description varchar(255) NOT NULL,
  TotalPoints double NOT NULL,
  ID int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID),
  FOREIGN KEY (PracticeID) REFERENCES practices(ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS practice_tasks_taken (
  StudentID varchar(32) NOT NULL,
  TaskID int NOT NULL,
  TakenPoints double NOT NULL,
  DateTaken timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  ID int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID),
  FOREIGN KEY (TaskID) REFERENCES practice_tasks(ID) ON DELETE CASCADE,
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lessons (
  CourseID varchar(32) NOT NULL,
  Title varchar(255) NOT NULL,
  Details TEXT NOT NULL,
  File varchar(255) DEFAULT NULL,
  Video varchar(255) DEFAULT NULL,
  Audio varchar(255) DEFAULT NULL,
  Image varchar(255) DEFAULT NULL,
  ID int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID),
  FOREIGN KEY (CourseID) REFERENCES courses(ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lessons_taken (
  StudentID varchar(32) NOT NULL,
  LessonID int NOT NULL,
  Progress double NOT NULL DEFAULT 0.0,
  StartTime timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  EndTime timestamp DEFAULT NULL,
  ID int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID),
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE,
  FOREIGN KEY (LessonID) REFERENCES lessons(ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessments (
  ID varchar(255) NOT NULL,
  CourseID varchar(32) NOT NULL,
  Assessment varchar(255) NOT NULL,
  Type varchar(50) NOT NULL,
  TotalPoints double NOT NULL,
  Description varchar(255) NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (CourseID) REFERENCES courses(ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessment_tasks_taken (
  StudentID varchar(32) NOT NULL,
  AssessmentID varchar(255) NOT NULL,
  TakenPoints double NOT NULL,
  DateTaken timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  ID int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID),
  FOREIGN KEY (AssessmentID) REFERENCES assessments(ID) ON DELETE CASCADE,
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE
);

-- NEW TABLES
CREATE TABLE IF NOT EXISTS quiz_items (
  AssessmentID varchar(255) NOT NULL,
  Item int NOT NULL,
  Question text NOT NULL,
  Choices text NOT NULL,
  Answer text NOT NULL,
  ID int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (ID),
  FOREIGN KEY (AssessmentID) REFERENCES assessments(ID) ON DELETE CASCADE
);

INSERT INTO students VALUES ('KFI@KAOZMFS',  'Kenneth James', 'Belga', 'ryukn' , '$2y$10$o65CIFnqKU6EOkOUEdBAYuZ.1MeXNIQ9ylyyli8YclzHFU996gROu','https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg');
INSERT INTO students VALUES ('KFI@KAOZM2S', 'Joshua', 'Corda', 'cordz' , '$2y$10$XlVmaWQ5FXW304F7HkVqNevoxAlf9vx68PkHUi2A4ZSSyZrGGVWZq','https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg');
INSERT INTO students VALUES ('KFI@KA2ZMFS', 'Anton Caesar', 'Cabais', '', '$2y$10$dT5XcC8WlG50tvj.zp0TzuxUcVWlv0.5KK8c2H29.1RdR43/tRLSy','https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg');
INSERT INTO students VALUES ('KFI@KAOZ2FS', 'Sean Jethro', 'Palacay', 'palux' , '$2y$10$XlVmaWQ5FXW304F7HkVqNevoxAlf9vx68PkHUi2A4ZSSyZrGGVWZq','https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg');

INSERT INTO languages VALUES 
  ('Bisakol',1);
INSERT INTO languages VALUES 
  ('English',2);
INSERT INTO languages VALUES 
  ('Frenchy',3);
INSERT INTO languages VALUES 
  ('Japanese',4);

INSERT INTO teachers VALUES 
  ('GFI@KAOZ2FS', 'Lanny', 'Maceda', 'teacher' , '$2y$10$7iZdRK.JmlBymEyS/C.FxuN4WVRaAQoVMy1XvrbTdRvqVw2kuQkve', 'Japanese Teacher' ,'https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg');
INSERT INTO teachers VALUES 
  ('GdI@KAOZ2FS', 'Statuito', 'Cutie', 'teacher2' , '$2y$10$7iZdRK.JmlBymEyS/C.FxuN4WVRaAQoVMy1XvrbTdRvqVw2kuQkve', 'French Teacher' ,'https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg');
INSERT INTO teachers VALUES 
  ('GgI@KAOZ2FS', 'Michael', 'Maxwell', 'teacher3' , '$2y$10$7iZdRK.JmlBymEyS/C.FxuN4WVRaAQoVMy1XvrbTdRvqVw2kuQkve', 'English Teacher' ,'https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg');

INSERT INTO teachers VALUES 
  ('GgI@KsOZ2FS', 'Kenneth', 'Aycardo', 'teacher4' , '$2y$10$7iZdRK.JmlBymEyS/C.FxuN4WVRaAQoVMy1XvrbTdRvqVw2kuQkve', 'Bisakol Expert' ,'https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg');

INSERT INTO courses VALUES 
  ('GFI@KAOZ2FS', 4, 'Supervised Machine Japanese: Natural Language of Japaneseness', 4.5,'@jglshpd2asd', null, null);

INSERT INTO courses VALUES 
  ('GgI@KAOZ2FS', 2, 'English 101: Master Your English in One Day!', 3.0,'@jglohpd2asd', null, null);

INSERT INTO courses VALUES 
  ('GgI@KsOZ2FS', 1, 'Bisakol 101: Bai na Bai', 5.0,'@jgloaps2asd', null, null);

INSERT INTO courses VALUES 
  ('GdI@KAOZ2FS', 3, 'French 101: Master your Taste!', 4.0,'@jgloaad2asd', null, null);


