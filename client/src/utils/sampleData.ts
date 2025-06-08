import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const createSampleData = async () => {
  const academicPeriod = 'Spring 2025 Quarter';
  
  const sampleCourses = [
    {
      code: 'COEN 12',
      name: 'Abstract Data Types and Data Structures',
      instructor: 'Dr. Smith',
      section: '01',
      schedule: 'MWF 9:15-10:20 AM',
      location: 'Bannan 130',
      units: 4,
      studentIds: []
    },
    {
      code: 'COEN 20',
      name: 'Embedded Systems',
      instructor: 'Dr. Johnson',
      section: '01',
      schedule: 'TTh 2:15-3:55 PM',
      location: 'Bannan 142',
      units: 4,
      studentIds: []
    },
    {
      code: 'MATH 53',
      name: 'Multivariable Calculus',
      instructor: 'Prof. Wilson',
      section: '02',
      schedule: 'MWF 11:45 AM-12:50 PM',
      location: 'O\'Keefe 110',
      units: 4,
      studentIds: []
    },
    {
      code: 'PHYS 33',
      name: 'Electricity and Magnetism',
      instructor: 'Dr. Brown',
      section: '01',
      schedule: 'TTh 9:15-10:55 AM',
      location: 'Daly Science 206',
      units: 4,
      studentIds: []
    },
    {
      code: 'ENGL 2',
      name: 'Critical Thinking and Writing',
      instructor: 'Prof. Davis',
      section: '03',
      schedule: 'MWF 1:15-2:20 PM',
      location: 'Kenna 205',
      units: 4,
      studentIds: []
    },
    {
      code: 'COEN 79',
      name: 'Object-Oriented Programming',
      instructor: 'Dr. Martinez',
      section: '01',
      schedule: 'TTh 11:45 AM-1:25 PM',
      location: 'Bannan 150',
      units: 4,
      studentIds: []
    }
  ];

  try {
    for (const course of sampleCourses) {
      const courseRef = doc(db, 'academicPeriods', academicPeriod, 'courses', course.code);
      await setDoc(courseRef, course);
    }
    console.log('Sample courses created successfully');
  } catch (error) {
    console.error('Error creating sample courses:', error);
  }
};