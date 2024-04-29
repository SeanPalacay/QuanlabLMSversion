DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

CREATE TABLE students (
  ID varchar(32) NOT NULL,
  FirstName varchar(50)  NOT NULL,
  LastName varchar(50)  NOT NULL,
  Email varchar(100) NOT NULL,
  Password varchar(255) NOT NULL,
  Profile varchar(255) DEFAULT NULL,
  Address varchar(255) NOT NULL, 
  Nationality varchar(100) NOT NULL, 
  BirthDate varchar(100) NOT NULL, 
  Gender varchar(20) NOT NULL, 
  PRIMARY KEY (ID)
);

CREATE TABLE teachers(
  ID varchar(32) NOT NULL,
  FirstName varchar(50)  NOT NULL,
  LastName varchar(50)  NOT NULL,
  Email varchar(100) DEFAULT NULL,
  Password varchar(255) NOT NULL,
  Job varchar(255) NOT NULL,
  Profile varchar(255) DEFAULT NULL,
  ESign varchar(255) DEFAULT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE administrators(
  ID varchar(32) NOT NULL,
  FirstName varchar(50)  NOT NULL,
  LastName varchar(50)  NOT NULL,
  Email varchar(100) NOT NULL,
  Role varchar(255) Default 'Admin',
  Password varchar(255) NOT NULL,
  Profile varchar(255) DEFAULT NULL,
  ESign varchar(255) DEFAULT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE languages (
  Language varchar(50)  NOT NULL,
  ID serial,
  PRIMARY KEY (ID)
);


CREATE TABLE courses (
  TeacherID varchar(32) NOT NULL,
  LanguageID int NOT NULL,
  Course varchar(255) NOT NULL,
  Difficulty real NOT NULL,
  ID varchar(32) NOT NULL,
  Details varchar(255) DEFAULT NULL,
  Filter varchar(255) DEFAULT NULL,
  Image varchar(255) DEFAULT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (LanguageID) REFERENCES languages(ID) ON DELETE CASCADE,
  FOREIGN KEY (TeacherID) REFERENCES teachers(ID) ON DELETE CASCADE
);


CREATE TABLE classes (
  CourseID varchar(32) NOT NULL,
  Class VARCHAR(255) NOT NULL,
  ClassCode varchar(30) NOT NULL,
  Schedule varchar(255) NOT NULL,
  AutoAccepts boolean NOT NULL DEFAULT TRUE,
  ID serial,
  PRIMARY KEY (ID),
  FOREIGN KEY (CourseID) REFERENCES courses(ID) ON DELETE CASCADE
);

CREATE TABLE student_classes (
  StudentID varchar(32) NOT NULL,
  ClassID int NOT NULL,
  Pending boolean NOT NULL DEFAULT FALSE,
  ID serial,
  PRIMARY KEY (ID),
  FOREIGN KEY (ClassID) REFERENCES classes(ID) ON DELETE CASCADE,
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE
);

CREATE TABLE proficiency_stamp (
  StudentID varchar(32) NOT NULL,
  LanguageID int NOT NULL,
  SPoints real NOT NULL DEFAULT 0.0,
  LPoints real NOT NULL DEFAULT 0.0,
  RPoints real NOT NULL DEFAULT 0.0,
  Speaks real NOT NULL DEFAULT 0.0,
  Listens real NOT NULL DEFAULT 0.0,
  Reads real NOT NULL DEFAULT 0.0,
  ID serial,
  Stamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  PRIMARY KEY (ID),
  FOREIGN KEY (LanguageID) REFERENCES languages(ID) ON DELETE CASCADE,
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE
);

CREATE TABLE practices (
  LanguageID int NOT NULL,
  Practice varchar(255) NOT NULL,
  Description varchar(255) NOT NULL,
  ID serial,
  PRIMARY KEY (ID),
  FOREIGN KEY (LanguageID) REFERENCES languages(ID) ON DELETE CASCADE
);

CREATE TABLE practice_tasks (
  PracticeID int NOT NULL,
  Task varchar(255) NOT NULL,
  Description varchar(255) NOT NULL,
  TotalPoints real NOT NULL,
  ID serial,
  PRIMARY KEY (ID),
  FOREIGN KEY (PracticeID) REFERENCES practices(ID) ON DELETE CASCADE
);

CREATE TABLE practice_tasks_taken (
  StudentID varchar(32) NOT NULL,
  TaskID int NOT NULL,
  TakenPoints real NOT NULL,
  DateTaken timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  ID serial,
  PRIMARY KEY (ID),
  FOREIGN KEY (TaskID) REFERENCES practice_tasks(ID) ON DELETE CASCADE,
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE
);

CREATE TABLE lessons (
  CourseID varchar(32) NOT NULL,
  Title varchar(255) NOT NULL,
  Details TEXT NOT NULL,
  Attachments TEXT DEFAULT NULL,
  Difficulty real NOT NULL DEFAULT 3,
  Background varchar(255) DEFAULT NULL,
  Time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ID serial,
  PRIMARY KEY (ID),
  FOREIGN KEY (CourseID) REFERENCES courses(ID) ON DELETE CASCADE
);

CREATE TABLE lessons_taken (
  StudentID varchar(32) NOT NULL,
  LessonID int NOT NULL,
  Progress real NOT NULL DEFAULT 0.0,
  StartTime timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  EndTime timestamp DEFAULT NULL,
  ID serial,
  PRIMARY KEY (ID),
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE,
  FOREIGN KEY (LessonID) REFERENCES lessons(ID) ON DELETE CASCADE
);

CREATE TABLE assessments (
  CourseID varchar(32) NOT NULL,
  Title varchar(255) NOT NULL,
  Details TEXT NOT NULL,
  Timelimit real NOT NULL DEFAULT 60,
  Deadline varchar(255) NOT NULL,
  Attachments TEXT DEFAULT NULL,
  Settings varchar(255) DEFAULT NULL,
  ID varchar(32) NOT NULL,
  Time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID),
  FOREIGN KEY (CourseID) REFERENCES courses(ID) ON DELETE CASCADE
);


CREATE TABLE assessment_tasks_taken (
  StudentID varchar(32) NOT NULL,
  AssessmentID varchar(32) NOT NULL,
  TakenPoints real NOT NULL,
  DateTaken timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
  ID serial,
  PRIMARY KEY (ID),
  FOREIGN KEY (AssessmentID) REFERENCES assessments(ID) ON DELETE CASCADE,
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE
);

CREATE TABLE word_searches(
    ID serial,
    Search varchar(255) NOT NULL,
    File text DEFAULT NULL,
    PRIMARY KEY (ID)
);

-- NEW TABLES
CREATE TABLE assessment_items (
  AssessmentID varchar(32) NOT NULL,
  Question varchar(255) NOT NULL,
  Type  varchar(30) NOT NULL,
  Answer TEXT NOT NULL,
  Options TEXT DEFAULT NULL,
  ID serial,
  PRIMARY KEY (ID),
  FOREIGN KEY (AssessmentID) REFERENCES assessments(ID) ON DELETE CASCADE
);

CREATE TABLE messages (
  SenderID varchar(32) NOT NULL, 
  RecipientID  varchar(32) NOT NULL,
  Message TEXT NOT NULL, 
  Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Status varchar(30) NOT NULL,
  ID serial NOT NULL,
  PRIMARY KEY (ID)
);
-- REVICE TABLE FOR FUCKING PRACTICES!!

-- CREATE TABLE student_practices (
--   StudentID varchar(32) NOT NULL, 
--   LanguageID int NOT NULL,
--   Mode varchar(32) NOT NULL,
--   Level real NOT NULL DEFAULT 1, 
--   ID serial NOT NULL,
--   PRIMARY KEY (ID),
--   FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE,
--   FOREIGN KEY (LanguageID) REFERENCES languages(ID) ON DELETE CASCADE
-- );
CREATE TABLE student_practices (
  StudentID varchar(32) NOT NULL, 
  LanguageID int NOT NULL,
  Write real NOT NULL DEFAULT 1, 
  Read real NOT NULL DEFAULT 1, 
  Listen real NOT NULL DEFAULT 1, 
  Speak real NOT NULL DEFAULT 1, 
  ID serial NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE,
  FOREIGN KEY (LanguageID) REFERENCES languages(ID) ON DELETE CASCADE
);

CREATE TABLE student_practice_attempts(
  StudentPracticeID int NOT NULL,
  CurrentLevel real NOT NULL,
  TakenPoints real NOT NULL,
  TotalPoints real NOT NULL DEFAULT 10,
  Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ID serial NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (StudentPracticeID) REFERENCES student_practices(ID) ON DELETE CASCADE
);

CREATE TABLE meetings (
  ClassID int NOT NULL,
  TeacherID varchar(32) NOT NULL,
  MeetingCode varchar(100) NOT NULL,
  Participants real NOT NULL DEFAULT 1,
  StartTime timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  EndTime timestamp DEFAULT NULL,
  ID varchar(32) NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (TeacherID) REFERENCES teachers(ID) ON DELETE CASCADE,
  FOREIGN KEY (ClassID) REFERENCES classes(ID) ON DELETE CASCADE
);

CREATE TABLE assignments (
  CourseID varchar(32) NOT NULL,
  Title varchar(255) NOT NULL,
  Details TEXT NOT NULL,
  Deadline varchar(255) NOT NULL,
  Attachments TEXT DEFAULT NULL,
  Time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ID serial,
  PRIMARY KEY (ID),
  FOREIGN KEY (CourseID) REFERENCES courses(ID) ON DELETE CASCADE
);

CREATE TABLE student_assignments (
  AssignmentID int NOT NULL,
  StudentID varchar(32) NOT NULL,
  Attachments varchar(255) NOT NULL,
  Comments TEXT DEFAULT NULL,
  Grade varchar(255) DEFAULT NULL,
  Time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ID serial,
  PRIMARY KEY (ID),
  FOREIGN KEY (AssignmentID) REFERENCES assignments(ID) ON DELETE CASCADE,
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE
);

ALTER TABLE students ADD VisibleID varchar(24) DEFAULT 'Q-6431-304442';

ALTER TABLE teachers
ADD VisibleID varchar(24) DEFAULT 'Q-6431-304442';

ALTER TABLE students
ADD TimeEnrolled timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE students
ADD LastSeen timestamp DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE teachers
ADD LastSeen timestamp DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE administrators
ADD LastSeen timestamp DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE student_assignments
ADD Feedback TEXT DEFAULT NULL;

CREATE TABLE student_assessments(
  AssessmentID varchar(32) NOT NULL,
  StudentID varchar(32) NOT NULL,
  TakenPoints real NOT NULL,
  TotalPoints real NOT NULL DEFAULT 10,
  Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ID serial NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE,
  FOREIGN KEY (AssessmentID) REFERENCES assessments(ID) ON DELETE CASCADE
);


CREATE TABLE notifications (
  SenderID varchar(32) NOT NULL, 
  RecipientID  varchar(32) NOT NULL,
  Title varchar(255) NOT NULL,
  Message TEXT NOT NULL, 
  Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Type varchar(255) NOT NULL DEFAULT 'notif',
  Status varchar(30) NOT NULL,
  ID serial NOT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE interests (
  SenderID varchar(32) NOT NULL, 
  Interest TEXT NOT NULL, 
  Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Status varchar(30) NOT NULL,
  ID serial NOT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE speech_labs(
  Name varchar(255) NOT NULL,
  ID serial NOT NULL,
  Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ID)
);

INSERT INTO speech_labs VALUES('Speech Lab 1');
INSERT INTO speech_labs VALUES('Speech Lab 2');

CREATE TABLE lab_meetings (
  LabID int NOT NULL,
  TeacherID varchar(32) NOT NULL,
  MeetingCode varchar(100) NOT NULL,
  Participants real NOT NULL DEFAULT 1,
  StartTime timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  EndTime timestamp DEFAULT NULL,
  ID varchar(32) NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (TeacherID) REFERENCES teachers(ID) ON DELETE CASCADE,
  FOREIGN KEY (LabID) REFERENCES speech_labs(ID) ON DELETE CASCADE
);


CREATE TABLE speech_modules(
  Name varchar(255) NOT NULL,
  Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ID varchar(32) NOT NULL,
  PRIMARY KEY (ID)
);
CREATE TABLE speech_lessons(
  ModuleID varchar(32) NOT NULL,
  -- Name varchar(255) NOT NULL,
  Description TEXT DEFAULT 'Default Description',
  LessonFile TEXT NOT NULL,
  QuizFile TEXT NOT NULL,
  LessonType varchar(100) NOT NULL,
  Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ID varchar(32) NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (ModuleID) REFERENCES speech_modules(ID) ON DELETE CASCADE
);

CREATE TABLE speech_practices(
  Name varchar(255) NOT NULL,
  Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ID varchar(32) NOT NULL,
  PRIMARY KEY (ID)
);
CREATE TABLE speech_drills(
  PracticeID varchar(32) NOT NULL,
  -- Name varchar(255) NOT NULL,
  DrillFile TEXT NOT NULL,
  Description TEXT DEFAULT 'Default Description',
  AudioFile TEXT NOT NULL,
  Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ID varchar(32) NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (PracticeID) REFERENCES speech_practices(ID) ON DELETE CASCADE
);


CREATE TABLE speech_lab_computers(
  LabID int NOT NULL,
  Name varchar(255) NOT NULL,
  Address varchar(255) NOT NULL,
  Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ID varchar(32) NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (LabID) REFERENCES speech_labs(ID) ON DELETE CASCADE
);

DROP TABLE IF EXISTS admin_options;

CREATE TABLE admin_options (
  Type varchar(255) NOT NULL, 
  Value TEXT NOT NULL, 
  PRIMARY KEY (Type)
);

CREATE TABLE verification (
  Email varchar(255) NOT NULL, 
  Token varchar(255) NOT NULL, 
  PRIMARY KEY (Email)
);

CREATE TABLE speech_attendance (
  StudentID varchar(32) NOT NULL, 
  MeetingID varchar(32) NOT NULL,
  TimeIn timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ID serial NOT NULL,
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE,
  FOREIGN KEY (MeetingID) REFERENCES lab_meetings(ID) ON DELETE CASCADE,
  PRIMARY KEY (ID)
);

CREATE TABLE speech_quizzes(
  LessonID varchar(32) NOT NULL,
  StudentID varchar(32) NOT NULL,
  TakenPoints real NOT NULL,
  TotalPoints real NOT NULL DEFAULT 10,
  Timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ID serial NOT NULL,
  PRIMARY KEY (ID),
  FOREIGN KEY (StudentID) REFERENCES students(ID) ON DELETE CASCADE,
  FOREIGN KEY (LessonID) REFERENCES speech_lessons(ID) ON DELETE CASCADE
);

INSERT INTO admin_options VALUES ('max_students', '50');
INSERT INTO admin_options VALUES ('local_server', 'http://34.80.109.155');

-- INSERT INTO students VALUES ('KFI@KAOZMFS',  'Kenneth James', 'Belga', 'ryukn' , '$2y$10$o65CIFnqKU6EOkOUEdBAYuZ.1MeXNIQ9ylyyli8YclzHFU996gROu','https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg',
-- 'Legazpi City', 'Filipino', '11/17/2001', 'Male'
-- );
-- INSERT INTO students VALUES ('KFI@KAOZM2S', 'Joshua', 'Corda', 'cordz' , '$2y$10$XlVmaWQ5FXW304F7HkVqNevoxAlf9vx68PkHUi2A4ZSSyZrGGVWZq','https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg',
-- 'Legazpi City', 'Filipino', '11/17/2001', 'Male'
-- );
-- INSERT INTO students VALUES ('KFI@KA2ZMFS', 'Anton Caesar', 'Cabais', '', '$2y$10$dT5XcC8WlG50tvj.zp0TzuxUcVWlv0.5KK8c2H29.1RdR43/tRLSy','https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg',
-- 'Legazpi City', 'Filipino', '11/17/2001', 'Male'
-- );
-- INSERT INTO students VALUES ('KFI@KAOZ2FS', 'Sean Jethro', 'Palacay', 'palux' , '$2y$10$XlVmaWQ5FXW304F7HkVqNevoxAlf9vx68PkHUi2A4ZSSyZrGGVWZq','https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg',
-- 'Legazpi City', 'Filipino', '11/17/2001', 'Male'
-- );

INSERT INTO administrators VALUES ('e571ca08816a41bcbc6f498f510cef12',  'Michael', 'Maxwell', 'admin' , '$2y$10$o65CIFnqKU6EOkOUEdBAYuZ.1MeXNIQ9ylyyli8YclzHFU996gROu','https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg');

INSERT INTO languages VALUES 
  ('English',2);
INSERT INTO languages VALUES 
  ('French',3);
INSERT INTO languages VALUES 
  ('Japanese',4);

-- INSERT INTO teachers VALUES 
--   ('GFI@KAOZ2FS', 'Lanny', 'Maceda', 'teacher' , '$2y$10$7iZdRK.JmlBymEyS/C.FxuN4WVRaAQoVMy1XvrbTdRvqVw2kuQkve', 'Japanese Teacher' ,'https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg');
-- INSERT INTO teachers VALUES 
--   ('GdI@KAOZ2FS', 'Cleomark', 'Calitisin', 'teacher2' , '$2y$10$7iZdRK.JmlBymEyS/C.FxuN4WVRaAQoVMy1XvrbTdRvqVw2kuQkve', 'French Teacher' ,'https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg');
-- INSERT INTO teachers VALUES 
--   ('GgI@KAOZ2FS', 'Michael', 'Maxwell', 'teacher3' , '$2y$10$7iZdRK.JmlBymEyS/C.FxuN4WVRaAQoVMy1XvrbTdRvqVw2kuQkve', 'English Teacher' ,'https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg');

-- INSERT INTO teachers VALUES 
--   ('GgI@KsOZ2FS', 'Kenneth', 'Aycardo', 'teacher4' , '$2y$10$7iZdRK.JmlBymEyS/C.FxuN4WVRaAQoVMy1XvrbTdRvqVw2kuQkve', 'French Teacher' ,'https://media.gq-magazine.co.uk/photos/63468efef4f48bee2acb7062/16:9/w_2560%2Cc_limit/Tom-Holland-Spiderman-what-we-know-so-far.jpg');

-- INSERT INTO courses VALUES 
--   ('GFI@KAOZ2FS', 4, 'Japanese Mastery: Navigating Language and Culture', 4.5,'@jglshpd2asd');

-- INSERT INTO courses VALUES 
--   ('GgI@KAOZ2FS', 2, 'English Pro: Elevate Your Language', 3.0,'@jglohpd2asd');

-- INSERT INTO courses VALUES 
--   ('GgI@KsOZ2FS', 2, 'Express English Mastery 101', 5.0,'@jgloaps2asd');

-- INSERT INTO courses VALUES 
--   ('GdI@KAOZ2FS', 3, 'Fluent French Mastery: From Beginner to Bilingual', 4.0,'@jgloaad2asd');

-- INSERT INTO courses VALUES 
--   ('GdI@KAOZ2FS', 3, 'French Express: Accelerated Language Proficiency', 4.0,'@jgloaadaasd');

-- INSERT INTO classes VALUES('@jglshpd2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 1);
-- INSERT INTO classes VALUES('@jglshpd2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 2);
-- INSERT INTO classes VALUES('@jglshpd2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 3);
-- INSERT INTO classes VALUES('@jglshpd2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 4);
-- INSERT INTO classes VALUES('@jglshpd2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 5);
-- INSERT INTO classes VALUES('@jglshpd2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 6);
-- INSERT INTO classes VALUES('@jglshpd2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 14);
-- INSERT INTO classes VALUES('@jglshpd2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 15);
-- INSERT INTO classes VALUES('@jglshpd2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 16);
-- INSERT INTO classes VALUES('@jglshpd2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 17);
-- INSERT INTO classes VALUES('@jgloaad2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 18);
-- INSERT INTO classes VALUES('@jgloaad2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 10);
-- INSERT INTO classes VALUES('@jgloaad2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 11);
-- INSERT INTO classes VALUES('@jgloaad2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 12);
-- INSERT INTO classes VALUES('@jgloaad2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 13);
-- INSERT INTO classes VALUES('@jglshpd2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 7);
-- INSERT INTO classes VALUES('@jglohpd2asd', 'Class-A','12345', 'MWF ( 10:30AM -12:30PM )',TRUE, 9);

-- INSERT INTO student_classes VALUES('KFI@KAOZMFS', 1);
-- INSERT INTO student_classes VALUES('KFI@KAOZM2S', 1);
-- INSERT INTO student_classes VALUES('KFI@KA2ZMFS', 1);
-- INSERT INTO student_classes VALUES('KFI@KAOZ2FS', 1);
-- INSERT INTO student_classes VALUES('KFI@KAOZMFS', 2);
-- INSERT INTO student_classes VALUES('KFI@KAOZMFS', 3);

-- INSERT INTO lessons VALUES ('@jgloaps2asd', 'Taste Test','This is a long text text');

-- INSERT INTO lessons VALUES ('@jgloaadaasd', 'Taste Test Better!','This is a long text text');

