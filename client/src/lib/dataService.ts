import { collection, getDocs, doc, getDoc, addDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Centralized data service to maintain consistency across the app
export class DataService {
  private static academicPeriod = 'Spring 2025 Quarter';

  // Course operations - always use course code as the consistent identifier
  static async getCourseDetails(courseCode: string) {
    try {
      const courseDoc = await getDoc(doc(db, 'academicPeriods', this.academicPeriod, 'courses', courseCode));
      
      if (courseDoc.exists()) {
        return { id: courseDoc.id, ...courseDoc.data() };
      } else {
        // Try to find the course by searching all courses in the academic period
        const allCoursesRef = collection(db, 'academicPeriods', this.academicPeriod, 'courses');
        const allCoursesSnapshot = await getDocs(allCoursesRef);
        
        let foundCourse = null;
        allCoursesSnapshot.forEach((doc) => {
          const courseData = doc.data();
          
          if (courseData.code === courseCode || doc.id === courseCode || 
              courseData.code?.replace(/\s+/g, '') === courseCode.replace(/\s+/g, '')) {
            foundCourse = { id: doc.id, ...courseData };
          }
        });
        
        return foundCourse;
      }
    } catch (error) {
      console.error(`Error loading course ${courseCode}:`, error);
      return null;
    }
  }

  static async getUserCourses(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userCourses = userData.courses || [];
        
        if (userCourses.length === 0) {
          return [];
        }
        
        // Load course details for each enrolled course
        const coursePromises = userCourses.map(async (courseCode: string) => {
          const courseDetails = await this.getCourseDetails(courseCode);
          return courseDetails;
        });
        
        const coursesData = (await Promise.all(coursePromises)).filter(Boolean);
        return coursesData;
      } else {
        return [];
      }
    } catch (error) {
      console.error('DataService: Error loading user courses:', error);
      return [];
    }
  }

  // Study session operations - always use course code as path
  static async getStudySessionsForCourse(courseCode: string) {
    try {
      const sessionsRef = collection(db, 'academicPeriods', this.academicPeriod, 'courses', courseCode, 'studySessions');
      const sessionsSnapshot = await getDocs(sessionsRef);
      
      const sessions: any[] = [];
      sessionsSnapshot.forEach((sessionDoc) => {
        const sessionData = { id: sessionDoc.id, ...sessionDoc.data() };
        sessions.push({
          ...sessionData,
          courseCode
        });
      });
      
      return sessions;
    } catch (error) {
      console.error(`Error loading study sessions for ${courseCode}:`, error);
      return [];
    }
  }

  static async getAllStudySessionsForUser(userId: string) {
    try {
      const userCourses = await this.getUserCourses(userId);
      const allSessions: any[] = [];
      
      for (const course of userCourses) {
        const courseSessions = await this.getStudySessionsForCourse(course.code);
        
        // Load complete session details including user profiles
        const sessionsWithDetails = await Promise.all(
          courseSessions.map(async (session) => {
            // Load attendee details
            const attendeeDetails = await Promise.all(
              (session.attendeeIds || []).map(async (attendeeId: string) => {
                try {
                  const attendeeDoc = await getDoc(doc(db, 'users', attendeeId));
                  if (attendeeDoc.exists()) {
                    const attendeeData = attendeeDoc.data();
                    return {
                      id: attendeeId,
                      firstName: attendeeData.firstName || attendeeData.displayName?.split(' ')[0] || 'Unknown',
                      lastName: attendeeData.lastName || attendeeData.displayName?.split(' ').slice(1).join(' ') || '',
                      profileImageUrl: attendeeData.photoURL
                    };
                  }
                  return null;
                } catch (error) {
                  console.error(`Error loading attendee ${attendeeId}:`, error);
                  return null;
                }
              })
            );
            
            // Load creator details
            let creatorDetails = null;
            if (session.creatorId) {
              try {
                const creatorDoc = await getDoc(doc(db, 'users', session.creatorId));
                if (creatorDoc.exists()) {
                  const creatorData = creatorDoc.data();
                  creatorDetails = {
                    id: session.creatorId,
                    firstName: creatorData.firstName || creatorData.displayName?.split(' ')[0] || 'Unknown',
                    lastName: creatorData.lastName || creatorData.displayName?.split(' ').slice(1).join(' ') || '',
                    profileImageUrl: creatorData.photoURL
                  };
                }
              } catch (error) {
                console.error(`Error loading creator ${session.creatorId}:`, error);
              }
            }
            
            return {
              ...session,
              course: course,
              attendees: attendeeDetails.filter(Boolean),
              creator: creatorDetails
            };
          })
        );
        
        allSessions.push(...sessionsWithDetails);
      }
      
      return allSessions;
    } catch (error) {
      console.error('Error loading all study sessions:', error);
      return [];
    }
  }

  static async createStudySession(sessionData: any) {
    try {
      const docRef = await addDoc(
        collection(db, 'academicPeriods', this.academicPeriod, 'courses', sessionData.courseCode, 'studySessions'),
        sessionData
      );
      return docRef.id;
    } catch (error) {
      console.error('Error creating study session:', error);
      throw error;
    }
  }

  static async joinStudySession(sessionId: string, courseCode: string, userId: string) {
    try {
      console.log('DataService: Joining session', sessionId, 'in course', courseCode, 'for user', userId);
      const sessionPath = `academicPeriods/${this.academicPeriod}/courses/${courseCode}/studySessions/${sessionId}`;
      console.log('DataService: Session path:', sessionPath);
      
      const sessionRef = doc(db, 'academicPeriods', this.academicPeriod, 'courses', courseCode, 'studySessions', sessionId);
      
      // First check if session exists
      const sessionDoc = await getDoc(sessionRef);
      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }
      
      const sessionData = sessionDoc.data();
      console.log('DataService: Current session data:', sessionData);
      
      await updateDoc(sessionRef, {
        attendeeIds: arrayUnion(userId)
      });
      
      console.log('DataService: Successfully added user to session');
    } catch (error) {
      console.error('DataService: Error joining study session:', error);
      throw error;
    }
  }

  static async leaveStudySession(sessionId: string, courseCode: string, userId: string) {
    try {
      const sessionRef = doc(db, 'academicPeriods', this.academicPeriod, 'courses', courseCode, 'studySessions', sessionId);
      await updateDoc(sessionRef, {
        attendeeIds: arrayRemove(userId)
      });
    } catch (error) {
      console.error('Error leaving study session:', error);
      throw error;
    }
  }

  // Classmate operations - scan all users for shared courses
  static async getClassmatesForUser(userId: string) {
    try {
      const userCourses = await this.getUserCourses(userId);
      const userCoursesList = userCourses.map(c => c.code);
      
      if (userCoursesList.length === 0) return [];
      
      // Get all users and find those with shared courses
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const classmates: any[] = [];
      
      usersSnapshot.docs.forEach((userDoc) => {
        const otherUserData = userDoc.data();
        const otherUserId = userDoc.id;
        
        // Skip current user
        if (otherUserId === userId) return;
        
        // Check if other user has courses enrolled
        if (otherUserData.courses && Array.isArray(otherUserData.courses)) {
          // Find shared courses
          const sharedCourses = otherUserData.courses.filter((courseCode: string) => 
            userCoursesList.includes(courseCode)
          );
          
          if (sharedCourses.length > 0) {
            // Get course details for shared courses
            const sharedCourseDetails = userCourses.filter(course => 
              sharedCourses.includes(course.code)
            );
            
            classmates.push({
              id: otherUserId,
              email: otherUserData.email,
              firstName: otherUserData.firstName || otherUserData.displayName?.split(' ')[0] || 'Unknown',
              lastName: otherUserData.lastName || otherUserData.displayName?.split(' ').slice(1).join(' ') || '',
              year: otherUserData.year,
              major: otherUserData.major,
              profileImageUrl: otherUserData.photoURL,
              sharedCourses: sharedCourseDetails
            });
          }
        }
      });
      
      return classmates;
    } catch (error) {
      console.error('Error loading classmates:', error);
      return [];
    }
  }

  static async getClassmatesForCourse(userId: string, courseCode: string) {
    try {
      const allClassmates = await this.getClassmatesForUser(userId);
      return allClassmates.filter(classmate => 
        classmate.sharedCourses.some((course: any) => course.code === courseCode)
      );
    } catch (error) {
      console.error(`Error loading classmates for course ${courseCode}:`, error);
      return [];
    }
  }
}