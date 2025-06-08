import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  addDoc,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

// Type definitions
interface Course extends DocumentData {
  code: string;
  name: string;
  instructor: string;
  section: string;
  schedule: string;
  location: string;
  units: number;
  studentIds: string[];
}

interface User extends DocumentData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  courses: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface StudySession extends DocumentData {
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  creatorId: string;
  courseCode: string;
}

// User operations
export const userService = {
  async getUser(uid: string) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  },

  async updateUserCourses(uid: string, courseCode: string, action: 'add' | 'remove') {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      courses: action === 'add' ? arrayUnion(courseCode) : arrayRemove(courseCode),
      updatedAt: new Date()
    });
  }
};

// Course operations
export const courseService = {
  async searchCourses(academicPeriod: string, searchTerm?: string) {
    const coursesRef = collection(db, 'academicPeriods', academicPeriod, 'courses');
    let q = query(coursesRef, orderBy('code'));
    
    const snapshot = await getDocs(q);
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course & { id: string }));
    
    if (searchTerm) {
      return courses.filter(course => 
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return courses;
  },

  async enrollInCourse(academicPeriod: string, courseCode: string, uid: string) {
    const courseRef = doc(db, 'academicPeriods', academicPeriod, 'courses', courseCode);
    await updateDoc(courseRef, {
      studentIds: arrayUnion(uid)
    });
  },

  async unenrollFromCourse(academicPeriod: string, courseCode: string, uid: string) {
    const courseRef = doc(db, 'academicPeriods', academicPeriod, 'courses', courseCode);
    await updateDoc(courseRef, {
      studentIds: arrayRemove(uid)
    });
  },

  async getCourse(academicPeriod: string, courseCode: string) {
    const courseDoc = await getDoc(doc(db, 'academicPeriods', academicPeriod, 'courses', courseCode));
    return courseDoc.exists() ? { id: courseDoc.id, ...courseDoc.data() } : null;
  }
};

// Classmate operations
export const classmateService = {
  async getClassmates(academicPeriod: string, courseCode: string, currentUserId: string) {
    const course = await courseService.getCourse(academicPeriod, courseCode);
    if (!course || !course.studentIds) return [];

    const classmateIds = course.studentIds.filter((id: string) => id !== currentUserId);
    
    const classmates = [];
    for (const uid of classmateIds) {
      const user = await userService.getUser(uid);
      if (user) {
        classmates.push(user);
      }
    }
    
    return classmates;
  },

  async getSharedClassmates(uid: string) {
    const user = await userService.getUser(uid);
    if (!user || !user.courses) return [];

    const classmatesMap = new Map();
    
    // For each course the user is enrolled in, get classmates
    for (const courseCode of user.courses) {
      // We'll need to check all academic periods - for now assume current period
      const academicPeriod = 'Spring 2025 Quarter'; // This should be dynamic
      const courseClassmates = await this.getClassmates(academicPeriod, courseCode, uid);
      
      courseClassmates.forEach(classmate => {
        if (!classmatesMap.has(classmate.id)) {
          classmatesMap.set(classmate.id, {
            ...classmate,
            sharedCourses: [courseCode]
          });
        } else {
          const existing = classmatesMap.get(classmate.id);
          existing.sharedCourses.push(courseCode);
        }
      });
    }
    
    return Array.from(classmatesMap.values());
  }
};

// Study session operations
export const studySessionService = {
  async createSession(academicPeriod: string, courseCode: string, sessionData: any) {
    const sessionsRef = collection(db, 'academicPeriods', academicPeriod, 'courses', courseCode, 'StudySessions');
    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { id: docRef.id, ...sessionData };
  },

  async getCourseSessions(academicPeriod: string, courseCode: string) {
    const sessionsRef = collection(db, 'academicPeriods', academicPeriod, 'courses', courseCode, 'StudySessions');
    const q = query(sessionsRef, orderBy('date'), orderBy('startTime'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getAllSessions(academicPeriod: string, userCourses: string[]) {
    const allSessions = [];
    
    for (const courseCode of userCourses) {
      const sessions = await this.getCourseSessions(academicPeriod, courseCode);
      allSessions.push(...sessions.map(session => ({ ...session, courseCode })));
    }
    
    return allSessions.sort((a, b) => a.date - b.date);
  }
};

// Academic period operations
export const academicService = {
  async getCurrentPeriod() {
    // For now, return static period - this could be made dynamic
    return 'Spring 2025 Quarter';
  },

  async getAcademicPeriods() {
    const periodsSnapshot = await getDocs(collection(db, 'academicPeriods'));
    return periodsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};