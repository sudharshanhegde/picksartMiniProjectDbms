create database college;
use college;
drop database college;

create table student(
   usn varchar(20) primary key,
   sname varchar(20),
   address varchar(20),
   phone varchar(12),
   gender char(1));
   
   create table semsec(
    ssid varchar(5) primary key,
    sem int not null,
    sec char(1)
    );
    
    create table class(
    usn varchar(20),
    ssid varchar(5),
    primary key(usn,ssid),
    foreign key (usn) references student(usn) on delete cascade,
    foreign key (ssid) references semsec (ssid) on delete cascade);
    
    create table subject(
    subcode varchar(8) primary key,
    title varchar(10),
    sem int,
    credits int
   );
    
    create table iamarks(
    usn varchar(20),
    subcode varchar(8),
    ssid varchar(5),
    primary key(usn,subcode,ssid),
    test1 integer(2),
    test2 integer(2),
    test3 integer(2),
    finalia int
    );
    
INSERT INTO student VALUES ('1CR21CS001', 'Alice', 'Bangalore', 9876543210, 'F');
INSERT INTO student VALUES ('1CR21CS002', 'Bob', 'Mysore', 9876543211, 'M');
INSERT INTO student VALUES ('1CR21CS003', 'Charlie', 'Hubli', 9876543212, 'M');
INSERT INTO student VALUES ('1CR21CS004', 'Daisy', 'Mangalore', 9876543213, 'F');
INSERT INTO student VALUES ('1CR21CS005', 'Ethan', 'Belgaum', 9876543214, 'M');

    
    
INSERT INTO semsec VALUES ('A1', 3, 'A');
INSERT INTO semsec VALUES ('B1', 3, 'B');
INSERT INTO semsec VALUES ('C1', 4, 'A');
INSERT INTO semsec VALUES ('D1', 4, 'B');
INSERT INTO semsec VALUES ('E1', 5, 'A');


INSERT INTO class VALUES ('1CR21CS001', 'A1');
INSERT INTO class VALUES ('1CR21CS002', 'A1');
INSERT INTO class VALUES ('1CR21CS003', 'B1');
INSERT INTO class VALUES ('1CR21CS004', 'C1');
INSERT INTO class VALUES ('1CR21CS005', 'D1');

	INSERT INTO subject VALUES ('CS301', 'DSA', 3, 4);
INSERT INTO subject VALUES ('CS302', 'OOP', 3, 4);
INSERT INTO subject VALUES ('CS401', 'DBMS', 4, 4);
INSERT INTO subject VALUES ('CS402', 'OS', 4, 4);
INSERT INTO subject VALUES ('CS501', 'AI', 5, 3);


INSERT INTO iamarks VALUES ('1CR21CS001', 'CS301', 'A1', 18, 19, 20, 19);
INSERT INTO iamarks VALUES ('1CR21CS002', 'CS302', 'A1', 16, 17, 18, 17);
INSERT INTO iamarks VALUES ('1CR21CS003', 'CS301', 'B1', 15, 14, 16, 15);
INSERT INTO iamarks VALUES ('1CR21CS004', 'CS401', 'C1', 19, 20, 20, 20);
INSERT INTO iamarks VALUES ('1CR21CS005', 'CS402', 'D1', 17, 16, 18, 17);


--selecting all the students from 4th sem and c section
select s.* 
from student s,semsec ss,class c
where s.usn = c.usn and ss.ssid = c.ssid and ss.sem = 4 and ss.sec = 'A'; 

--creating view for the students usn
create view student_marks as 
select subcode,test1 from iamarks where usn = '1CR21CS001';
select * from student_marks;

select ss.sem,ss.sec,s.gender,count(*) as count
from student s,semsec ss,class c
where s.usn = c.usn and ss.ssid = c.ssid
group by ss.sem,ss.sec,s.gender
order by ss.sem;


update iamarks
set finalia = (test1 + test2 + test3 - least(test1,test2,test3))/2;
select * from iamarks;