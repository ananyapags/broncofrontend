import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string | string[];
  section: string;
  schedule?: string;
  meetingPattern?: string;
  location: string;
  units: number;
  studentIds: string[];
}

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [userCourses, setUserCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useFirebaseAuth();

  useEffect(() => {
    if (user) {
      loadCourses();
      loadUserCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      const coursesRef = collection(db, 'academicPeriods', 'Spring 2025 Quarter', 'courses');
      const snapshot = await getDocs(coursesRef);
      const coursesData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Course));
      
      // If no courses from Firestore, use sample data for testing
      if (coursesData.length === 0) {
        const sampleCourses: Course[] = [
          {
            id: 'COEN12',
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
            id: 'COEN20',
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
            id: 'MATH53',
            code: 'MATH 53',
            name: 'Multivariable Calculus',
            instructor: 'Prof. Wilson',
            section: '02',
            schedule: 'MWF 11:45 AM-12:50 PM',
            location: "O'Keefe 110",
            units: 4,
            studentIds: []
          }
        ];
        setCourses(sampleCourses);
      } else {
        setCourses(coursesData);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      // Use sample data if Firestore fails
      const sampleCourses: Course[] = [
        {
          id: 'COEN12',
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
          id: 'COEN20',
          code: 'COEN 20',
          name: 'Embedded Systems',
          instructor: 'Dr. Johnson',
          section: '01',
          schedule: 'TTh 2:15-3:55 PM',
          location: 'Bannan 142',
          units: 4,
          studentIds: []
        }
      ];
      setCourses(sampleCourses);
    } finally {
      setLoading(false);
    }
  };

  const loadUserCourses = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserCourses(userData.courses || []);
      }
    } catch (error) {
      console.error('Error loading user courses:', error);
    }
  };

  const handleEnroll = async (courseCode: string) => {
    if (!user) return;

    try {
      // First ensure user document exists
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          courses: [courseCode],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Update existing user document
        await updateDoc(userRef, {
          courses: arrayUnion(courseCode),
          updatedAt: new Date()
        });
      }

      // Update course studentIds - create document if it doesn't exist
      const courseRef = doc(db, 'academicPeriods', 'Spring 2025 Quarter', 'courses', courseCode);
      const courseDoc = await getDoc(courseRef);
      
      if (!courseDoc.exists()) {
        // Create course document with the selected course data
        const selectedCourse = courses.find(c => c.code === courseCode);
        if (selectedCourse) {
          await setDoc(courseRef, {
            ...selectedCourse,
            studentIds: [user.uid]
          });
        }
      } else {
        // Get current data and ensure studentIds exists
        const currentData = courseDoc.data();
        const currentStudentIds = currentData.studentIds || [];
        
        // Only update if user isn't already in the list
        if (!currentStudentIds.includes(user.uid)) {
          await updateDoc(courseRef, {
            studentIds: arrayUnion(user.uid)
          });
        }
      }

      setUserCourses(prev => [...prev, courseCode]);
      
      toast({
        title: "Enrolled",
        description: `Successfully enrolled in ${courseCode}`,
      });
    } catch (error) {
      console.error('Error enrolling:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive",
      });
    }
  };

  const handleUnenroll = async (courseCode: string) => {
    if (!user) return;

    try {
      // Update course studentIds
      const courseRef = doc(db, 'academicPeriods', 'Spring 2025 Quarter', 'courses', courseCode);
      await updateDoc(courseRef, {
        studentIds: arrayRemove(user.uid)
      });

      // Update user courses
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        courses: arrayRemove(courseCode),
        updatedAt: new Date()
      });

      setUserCourses(prev => prev.filter(c => c !== courseCode));
      
      toast({
        title: "Unenrolled",
        description: `Successfully unenrolled from ${courseCode}`,
      });
    } catch (error) {
      console.error('Error unenrolling:', error);
      toast({
        title: "Error",
        description: "Failed to unenroll from course",
        variant: "destructive",
      });
    }
  };

  const filteredCourses = courses.filter(course => {
    const instructorText = Array.isArray(course.instructor) 
      ? course.instructor.join(' ')
      : (course.instructor || '');
    
    const scheduleText = course.meetingPattern || course.schedule || '';
    
    return course.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           instructorText.toLowerCase().includes(searchQuery.toLowerCase()) ||
           scheduleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
           course.location?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isEnrolled = userCourses.includes(course.code);
          
          return (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>
                  <div className="text-lg font-bold text-red-600">{course.code}</div>
                  <div className="text-sm text-gray-600">{course.section}</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-600">
                    {Array.isArray(course.instructor) 
                      ? course.instructor.join(', ') 
                      : course.instructor}
                  </p>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong>Schedule:</strong> {course.meetingPattern || course.schedule || 'TBA'}</div>
                  <div><strong>Location:</strong> {course.location}</div>
                </div>

                <Button
                  onClick={() => isEnrolled ? handleUnenroll(course.code) : handleEnroll(course.code)}
                  variant={isEnrolled ? "outline" : "default"}
                  className={`w-full ${
                    isEnrolled 
                      ? "border-red-600 text-red-600 hover:bg-red-50" 
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {isEnrolled ? "Unenroll" : "Enroll"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No courses found matching your search.</p>
        </div>
      )}
    </div>
  );
}