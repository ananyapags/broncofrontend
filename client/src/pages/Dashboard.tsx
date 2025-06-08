import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Users, Calendar, Clock, Plus, Search, CalendarPlus } from "lucide-react";
import { Link } from "wouter";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DataService } from "@/lib/dataService";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isLoading } = useFirebaseAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [studySessions, setStudySessions] = useState<any[]>([]);
  const [classmates, setClassmates] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user && !isLoading) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      // Load user's enrolled courses using centralized service
      const enrolledCoursesData = await DataService.getUserCourses(user.uid);
      setEnrolledCourses(enrolledCoursesData);
      
      // Load all study sessions for the user
      const allSessions = await DataService.getAllStudySessionsForUser(user.uid);
      setStudySessions(allSessions);
      
      // Load classmates
      const classmates = await DataService.getClassmatesForUser(user.uid);
      setClassmates(classmates);
      
      // Create user document if needed
      if (enrolledCoursesData.length === 0) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            courses: [],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  if (isLoading || dataLoading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Loading your data...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user?.displayName?.split(' ')[0] || user?.email}</h1>
          <p className="text-muted-foreground">Here's what's happening with your courses and study groups</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Book className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Enrolled Courses</p>
                  <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Classmates</p>
                  <p className="text-2xl font-bold">{classmates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Study Sessions</p>
                  <p className="text-2xl font-bold">{studySessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">
                    {studySessions.filter(session => new Date(session.startTime) > new Date()).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Find Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Browse and enroll in courses to connect with classmates
              </p>
              <Link href="/courses">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Connect with Classmates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Find and connect with students in your courses
              </p>
              <Link href="/classmates">
                <Button className="w-full" variant="outline">
                  View Classmates
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarPlus className="h-5 w-5 mr-2" />
                Study Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create or join study sessions with your classmates
              </p>
              <Link href="/sessions">
                <Button className="w-full" variant="outline">
                  View Sessions
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Study Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Study Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {studySessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No study sessions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create or join study sessions to collaborate with classmates
                </p>
                <Link href="/sessions">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Study Session
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {studySessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{session.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {session.course?.code} - {session.course?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.startTime).toLocaleDateString()} at {session.startTime.split('T')[1]?.slice(0, 5) || 'TBD'}
                        </p>
                        <p className="text-sm text-muted-foreground">{session.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {session.attendees?.length || 0} attending
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {studySessions.length > 3 && (
                  <Link href="/sessions">
                    <Button variant="outline" className="w-full">
                      View All Sessions
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}