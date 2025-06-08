import { collection, addDoc, setDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Sample student data for Santa Clara University
const sampleStudents = [
  {
    id: 'student1',
    email: 'jsmith@scu.edu',
    firstName: 'John',
    lastName: 'Smith',
    displayName: 'John Smith',
    photoURL: null,
    year: 'sophomore',
    major: 'Computer Science & Engineering',
    courses: ['CSEN 146-1', 'MATH 53-2', 'PHYS 31-1']
  },
  {
    id: 'student2', 
    email: 'mjohnson@scu.edu',
    firstName: 'Maria',
    lastName: 'Johnson',
    displayName: 'Maria Johnson',
    photoURL: null,
    year: 'junior',
    major: 'Electrical & Computer Engineering',
    courses: ['ECEN 50-2', 'MATH 53-2', 'CSEN 146-1']
  },
  {
    id: 'student3',
    email: 'dlee@scu.edu',
    firstName: 'David',
    lastName: 'Lee',
    displayName: 'David Lee',
    photoURL: null,
    year: 'senior',
    major: 'Mathematics',
    courses: ['MATH 53-2', 'MATH 103-1', 'CSEN 146-1']
  },
  {
    id: 'student4',
    email: 'sgarcia@scu.edu',
    firstName: 'Sofia',
    lastName: 'Garcia',
    displayName: 'Sofia Garcia',
    photoURL: null,
    year: 'freshman',
    major: 'Biology',
    courses: ['BIOL 5-3', 'CHEM 11-1', 'MATH 11-2']
  },
  {
    id: 'student5',
    email: 'awilson@scu.edu',
    firstName: 'Alex',
    lastName: 'Wilson',
    displayName: 'Alex Wilson',
    photoURL: null,
    year: 'junior',
    major: 'Business',
    courses: ['ACTG 11-1', 'ECON 1-2', 'MATH 11-2']
  },
  {
    id: 'student6',
    email: 'rmartinez@scu.edu',
    firstName: 'Rosa',
    lastName: 'Martinez',
    displayName: 'Rosa Martinez',
    photoURL: null,
    year: 'sophomore',
    major: 'Psychology',
    courses: ['PSYC 1-1', 'PSYC 40-2', 'BIOL 5-3']
  },
  {
    id: 'student7',
    email: 'tbrown@scu.edu',
    firstName: 'Tyler',
    lastName: 'Brown',
    displayName: 'Tyler Brown',
    photoURL: null,
    year: 'senior',
    major: 'Mechanical Engineering',
    courses: ['MECH 45-3', 'PHYS 31-1', 'MATH 53-2']
  },
  {
    id: 'student8',
    email: 'kchen@scu.edu',
    firstName: 'Kevin',
    lastName: 'Chen',
    displayName: 'Kevin Chen',
    photoURL: null,
    year: 'junior',
    major: 'Chemistry',
    courses: ['CHEM 11-1', 'CHEM 50-2', 'MATH 11-2']
  },
  {
    id: 'student9',
    email: 'lpatel@scu.edu',
    firstName: 'Lila',
    lastName: 'Patel',
    displayName: 'Lila Patel',
    photoURL: null,
    year: 'sophomore',
    major: 'Art & Art History',
    courses: ['ARTS 32-1', 'ARTS 63-1', 'ARTH 11-1']
  },
  {
    id: 'student10',
    email: 'nthompson@scu.edu',
    firstName: 'Nathan',
    lastName: 'Thompson',
    displayName: 'Nathan Thompson',
    photoURL: null,
    year: 'freshman',
    major: 'Political Science',
    courses: ['POLI 1-1', 'HIST 82A-1', 'ENGL 1A-2']
  },
  {
    id: 'student11',
    email: 'erodriguez@scu.edu',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    displayName: 'Emma Rodriguez',
    photoURL: null,
    year: 'junior',
    major: 'Communications',
    courses: ['COMM 2-1', 'ENGL 1A-2', 'PSYC 1-1']
  },
  {
    id: 'student12',
    email: 'cwang@scu.edu',
    firstName: 'Chris',
    lastName: 'Wang',
    displayName: 'Chris Wang',
    photoURL: null,
    year: 'sophomore',
    major: 'Finance',
    courses: ['FNCE 121-1', 'ECON 1-2', 'ACTG 11-1']
  },
  {
    id: 'student13',
    email: 'ianderson@scu.edu',
    firstName: 'Isabella',
    lastName: 'Anderson',
    displayName: 'Isabella Anderson',
    photoURL: null,
    year: 'senior',
    major: 'Environmental Science',
    courses: ['ENVS 21-1', 'BIOL 5-3', 'CHEM 11-1']
  },
  {
    id: 'student14',
    email: 'mkim@scu.edu',
    firstName: 'Michael',
    lastName: 'Kim',
    displayName: 'Michael Kim',
    photoURL: null,
    year: 'freshman',
    major: 'Civil Engineering',
    courses: ['CENG 7-1', 'MATH 53-2', 'PHYS 31-1']
  },
  {
    id: 'student15',
    email: 'ataylor@scu.edu',
    firstName: 'Ava',
    lastName: 'Taylor',
    displayName: 'Ava Taylor',
    photoURL: null,
    year: 'junior',
    major: 'English',
    courses: ['ENGL 1A-2', 'ENGL 154-1', 'HIST 82A-1']
  },
  {
    id: 'student16',
    email: 'jmorales@scu.edu',
    firstName: 'Juan',
    lastName: 'Morales',
    displayName: 'Juan Morales',
    photoURL: null,
    year: 'sophomore',
    major: 'Theatre Arts',
    courses: ['THTR 8-1', 'ARTS 32-1', 'MUSC 1A-1']
  },
  {
    id: 'student17',
    email: 'srobinson@scu.edu',
    firstName: 'Samantha',
    lastName: 'Robinson',
    displayName: 'Samantha Robinson',
    photoURL: null,
    year: 'senior',
    major: 'Bioengineering',
    courses: ['BIOE 10-1', 'CHEM 11-1', 'MATH 103-1']
  },
  {
    id: 'student18',
    email: 'bclark@scu.edu',
    firstName: 'Brandon',
    lastName: 'Clark',
    displayName: 'Brandon Clark',
    photoURL: null,
    year: 'freshman',
    major: 'Economics',
    courses: ['ECON 1-2', 'MATH 11-2', 'POLI 1-1']
  },
  {
    id: 'student19',
    email: 'zwhite@scu.edu',
    firstName: 'Zoe',
    lastName: 'White',
    displayName: 'Zoe White',
    photoURL: null,
    year: 'junior',
    major: 'Philosophy',
    courses: ['PHIL 9-1', 'PHIL 15-1', 'ENGL 1A-2']
  },
  {
    id: 'student20',
    email: 'dmiller@scu.edu',
    firstName: 'Daniel',
    lastName: 'Miller',
    displayName: 'Daniel Miller',
    photoURL: null,
    year: 'sophomore',
    major: 'Marketing',
    courses: ['MKTG 181-1', 'ECON 1-2', 'COMM 2-1']
  }
];

// Sample study sessions
const sampleStudySessions = [
  {
    courseCode: 'CSEN 146-1',
    title: 'Algorithm Design Study Group',
    description: 'Working on dynamic programming problems and graph algorithms',
    location: 'Engineering Library Study Room 201',
    startTime: '2025-01-15T14:00:00',
    endTime: '2025-01-15T16:00:00',
    creatorId: 'student1',
    attendeeIds: ['student2', 'student3']
  },
  {
    courseCode: 'MATH 53-2',
    title: 'Multivariable Calculus Help Session',
    description: 'Review for upcoming midterm - focusing on partial derivatives and multiple integrals',
    location: 'Orradre Library Group Study Area',
    startTime: '2025-01-16T19:00:00',
    endTime: '2025-01-16T21:00:00',
    creatorId: 'student2',
    attendeeIds: ['student1', 'student3', 'student7']
  },
  {
    courseCode: 'PHYS 31-1',
    title: 'Physics Lab Prep',
    description: 'Going over experimental procedures and data analysis techniques',
    location: 'Daly Science Center Room 208',
    startTime: '2025-01-17T16:30:00',
    endTime: '2025-01-17T18:30:00',
    creatorId: 'student7',
    attendeeIds: ['student1']
  },
  {
    courseCode: 'BIOL 5-3',
    title: 'Ecology Field Study Group',
    description: 'Preparing for field work and discussing ecosystem concepts',
    location: 'Alumni Science Hall Study Room',
    startTime: '2025-01-18T13:00:00',
    endTime: '2025-01-18T15:00:00',
    creatorId: 'student4',
    attendeeIds: ['student6']
  },
  {
    courseCode: 'CHEM 11-1',
    title: 'General Chemistry Problem Solving',
    description: 'Working through stoichiometry and chemical bonding problems',
    location: 'Daly Science Center Study Lounge',
    startTime: '2025-01-19T10:00:00',
    endTime: '2025-01-19T12:00:00',
    creatorId: 'student8',
    attendeeIds: ['student4']
  },
  {
    courseCode: 'ARTS 32-1',
    title: 'Two-Dimensional Design Portfolio Review',
    description: 'Peer feedback session for design projects and portfolio development',
    location: 'Edward M. Dowd Art Building Studio 315',
    startTime: '2025-01-20T15:00:00',
    endTime: '2025-01-20T17:00:00',
    creatorId: 'student9',
    attendeeIds: ['student16']
  },
  {
    courseCode: 'PSYC 1-1',
    title: 'Introduction to Psychology Study Group',
    description: 'Review of research methods and cognitive psychology concepts',
    location: 'Bannan Hall Study Room 142',
    startTime: '2025-01-21T18:00:00',
    endTime: '2025-01-21T20:00:00',
    creatorId: 'student6',
    attendeeIds: ['student11']
  },
  {
    courseCode: 'ECON 1-2',
    title: 'Microeconomics Problem Session',
    description: 'Working through supply and demand graphs and market analysis',
    location: 'Lucas Hall Conference Room',
    startTime: '2025-01-22T14:30:00',
    endTime: '2025-01-22T16:30:00',
    creatorId: 'student5',
    attendeeIds: ['student12', 'student18', 'student20']
  },
  {
    courseCode: 'MATH 11-2',
    title: 'Calculus 1 Workshop',
    description: 'Practice with limits, derivatives, and integration basics',
    location: 'Mathematics Building Room 105',
    startTime: '2025-01-23T15:00:00',
    endTime: '2025-01-23T17:00:00',
    creatorId: 'student4',
    attendeeIds: ['student5', 'student8', 'student18']
  },
  {
    courseCode: 'ENGL 1A-2',
    title: 'Essay Writing Workshop',
    description: 'Peer review of argumentative essays and writing techniques',
    location: 'Kenna Hall Writing Center',
    startTime: '2025-01-24T11:00:00',
    endTime: '2025-01-24T13:00:00',
    creatorId: 'student15',
    attendeeIds: ['student10', 'student11', 'student19']
  },
  {
    courseCode: 'ACTG 11-1',
    title: 'Financial Accounting Study Session',
    description: 'Review of journal entries and financial statement preparation',
    location: 'Lucas Hall Study Room 225',
    startTime: '2025-01-25T16:00:00',
    endTime: '2025-01-25T18:00:00',
    creatorId: 'student12',
    attendeeIds: ['student5']
  },
  {
    courseCode: 'COMM 2-1',
    title: 'Public Speaking Practice',
    description: 'Practice presentations and get feedback on delivery',
    location: 'Communications Building Room 150',
    startTime: '2025-01-26T14:00:00',
    endTime: '2025-01-26T16:00:00',
    creatorId: 'student11',
    attendeeIds: ['student20']
  },
  {
    courseCode: 'MATH 103-1',
    title: 'Linear Algebra Problem Session',
    description: 'Working through matrix operations and vector spaces',
    location: 'Mathematics Building Conference Room',
    startTime: '2025-01-27T13:30:00',
    endTime: '2025-01-27T15:30:00',
    creatorId: 'student3',
    attendeeIds: ['student17']
  },
  {
    courseCode: 'HIST 82A-1',
    title: 'American History Discussion Group',
    description: 'Analyzing primary sources and preparing for upcoming exam',
    location: 'Varsi Hall Study Lounge',
    startTime: '2025-01-28T17:00:00',
    endTime: '2025-01-28T19:00:00',
    creatorId: 'student10',
    attendeeIds: ['student15']
  },
  {
    courseCode: 'CHEM 50-2',
    title: 'Organic Chemistry Lab Review',
    description: 'Review of reaction mechanisms and lab techniques',
    location: 'Daly Science Center Lab 310',
    startTime: '2025-01-29T10:30:00',
    endTime: '2025-01-29T12:30:00',
    creatorId: 'student8',
    attendeeIds: []
  },
  {
    courseCode: 'POLI 1-1',
    title: 'Introduction to Politics Study Group',
    description: 'Discussion of political theories and current events analysis',
    location: 'Kenna Hall Conference Room',
    startTime: '2025-01-30T18:30:00',
    endTime: '2025-01-30T20:30:00',
    creatorId: 'student18',
    attendeeIds: ['student10']
  },
  {
    courseCode: 'BIOE 10-1',
    title: 'Bioengineering Fundamentals Workshop',
    description: 'Problem-solving in biomechanics and biomedical applications',
    location: 'Engineering Building Lab 204',
    startTime: '2025-01-31T12:00:00',
    endTime: '2025-01-31T14:00:00',
    creatorId: 'student17',
    attendeeIds: []
  },
  {
    courseCode: 'PHIL 9-1',
    title: 'Critical Thinking Workshop',
    description: 'Analyzing logical arguments and philosophical reasoning',
    location: 'Kenna Hall Philosophy Lounge',
    startTime: '2025-02-01T15:30:00',
    endTime: '2025-02-01T17:30:00',
    creatorId: 'student19',
    attendeeIds: []
  },
  {
    courseCode: 'MKTG 181-1',
    title: 'Marketing Strategies Case Study',
    description: 'Analyzing real marketing campaigns and developing strategies',
    location: 'Lucas Hall Marketing Lab',
    startTime: '2025-02-02T13:00:00',
    endTime: '2025-02-02T15:00:00',
    creatorId: 'student20',
    attendeeIds: []
  },
  {
    courseCode: 'THTR 8-1',
    title: 'Acting Technique Workshop',
    description: 'Scene work and character development exercises',
    location: 'Fess Parker Studio Theatre',
    startTime: '2025-02-03T19:00:00',
    endTime: '2025-02-03T21:00:00',
    creatorId: 'student16',
    attendeeIds: []
  }
];

export async function populateDatabase(currentUserId: string) {
  try {
    console.log('Starting database population...');
    
    // Note: Skip adding sample students due to security rules
    // Only the authenticated user can create their own user document
    console.log('Skipping student creation due to security rules...');

    // Add sample study sessions with current user as creator
    console.log('Adding sample study sessions...');
    const academicPeriod = 'Spring 2025 Quarter';
    
    if (!currentUserId) {
      throw new Error('Must be authenticated to populate database');
    }
    
    let sessionsAdded = 0;
    for (const session of sampleStudySessions.slice(0, 10)) { // Limit to 10 sessions
      try {
        const sessionRef = collection(db, 'academicPeriods', academicPeriod, 'courses', session.courseCode, 'studySessions');
        
        await addDoc(sessionRef, {
          title: session.title,
          description: session.description,
          location: session.location,
          startTime: session.startTime,
          endTime: session.endTime,
          creatorId: currentUserId, // Use current user as creator
          attendeeIds: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`Added study session: ${session.title} for ${session.courseCode}`);
        sessionsAdded++;
      } catch (error) {
        console.warn(`Failed to add session for ${session.courseCode}:`, error);
        // Continue with other sessions even if one fails
      }
    }

    console.log('Database population completed successfully!');
    console.log(`Added ${sessionsAdded} study sessions`);
    
    return {
      success: true,
      studentsAdded: 0,
      sessionsAdded: sessionsAdded
    };
    
  } catch (error) {
    console.error('Error populating database:', error);
    throw error;
  }
}

// Function to check current database state
export async function checkDatabaseState() {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`Current users in database: ${usersSnapshot.size}`);
    
    return {
      totalUsers: usersSnapshot.size
    };
  } catch (error) {
    console.error('Error checking database state:', error);
    return { totalUsers: 0 };
  }
}