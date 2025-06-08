import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Book, Users, Calendar, TrendingUp, Database, ShieldAlert } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { populateDatabase, checkDatabaseState } from "@/utils/populateDatabase";
import { isAdminUser } from "@/lib/adminAuth";

export default function Admin() {
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [instructor, setInstructor] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [dbStats, setDbStats] = useState<{ totalUsers: number } | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  const { user } = useFirebaseAuth();

  useEffect(() => {
    if (user?.email) {
      setIsAuthorized(isAdminUser(user.email));
    }
  }, [user]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !courseName || !instructor) return;

    if (!isAuthorized) {
      toast({
        title: "Access Denied",
        description: "Admin privileges required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const coursesRef = collection(db, 'academicPeriods', 'Spring 2025 Quarter', 'courses');
      await addDoc(coursesRef, {
        code: courseCode,
        name: courseName,
        instructor: instructor,
        section: "001",
        schedule: "TBD",
        location: "TBD",
        units: 4,
        studentIds: [],
        createdAt: new Date(),
      });
      
      toast({
        title: "Course Created",
        description: `${courseCode} has been added successfully.`,
      });
      
      setCourseCode("");
      setCourseName("");
      setInstructor("");
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateDatabase = async () => {
    if (!user?.uid) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to populate the database",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthorized) {
      toast({
        title: "Access Denied",
        description: "Admin privileges required",
        variant: "destructive",
      });
      return;
    }

    setIsPopulating(true);
    try {
      const result = await populateDatabase(user.uid);
      
      toast({
        title: "Database Population Complete",
        description: `Successfully added ${result.sessionsAdded} study sessions`,
      });
      
      await handleCheckDatabase();
    } catch (error) {
      console.error('Error populating database:', error);
      toast({
        title: "Error",
        description: "Failed to populate database. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsPopulating(false);
    }
  };

  const handleCheckDatabase = async () => {
    setIsChecking(true);
    try {
      const stats = await checkDatabaseState();
      setDbStats(stats);
      
      toast({
        title: "Database Status",
        description: `Found ${stats.totalUsers} users in the database`,
      });
    } catch (error) {
      console.error('Error checking database:', error);
      toast({
        title: "Error",
        description: "Failed to check database status",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Show unauthorized message for non-admin users
  if (user && !isAuthorized) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="max-w-md mx-auto mt-20">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Access denied. Admin privileges required to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        {isAuthorized && (
          <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            Admin Access Granted
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStats?.totalUsers || '-'}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Monthly growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Database Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Populate Sample Data</h3>
              <p className="text-sm text-muted-foreground">
                Add multiple study sessions across different courses. You'll be the creator of all sessions.
              </p>
              <Button 
                onClick={handlePopulateDatabase}
                disabled={isPopulating}
                className="w-full"
              >
                {isPopulating ? "Adding Sample Data..." : "Populate Database"}
              </Button>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Database Status</h3>
              <p className="text-sm text-muted-foreground">
                Check current database state and view statistics.
              </p>
              <Button 
                onClick={handleCheckDatabase}
                disabled={isChecking}
                variant="outline"
                className="w-full"
              >
                {isChecking ? "Checking..." : "Check Database Status"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Management */}
      <Card>
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="courseCode">Course Code</Label>
                <Input
                  id="courseCode"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="e.g., COEN 12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g., Data Structures"
                  required
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="e.g., Dr. Smith"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Course"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}