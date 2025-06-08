import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Search, BookOpen } from "lucide-react";
import { DataService } from "@/lib/dataService";
import ClassmateCard from "@/components/ClassmateCard";

export default function Classmates() {
  const { toast } = useToast();
  const { user, isLoading } = useFirebaseAuth();
  const [classmates, setClassmates] = useState<any[]>([]);
  const [filteredClassmates, setFilteredClassmates] = useState<any[]>([]);
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  useEffect(() => {
    if (user && !isLoading) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    filterClassmates();
  }, [classmates, searchTerm, selectedCourse]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Load user's courses
      const coursesData = await DataService.getUserCourses(user.uid);
      setUserCourses(coursesData);
      
      // Load classmates
      const classmatesData = await DataService.getClassmatesForUser(user.uid);
      setClassmates(classmatesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClassmates = () => {
    let filtered = classmates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(classmate =>
        `${classmate.firstName} ${classmate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classmate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classmate.major?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by course
    if (selectedCourse !== "all") {
      filtered = filtered.filter(classmate =>
        classmate.sharedCourses.some((course: any) => course.code === selectedCourse)
      );
    }

    setFilteredClassmates(filtered);
  };

  if (isLoading || loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Classmates</h1>
            <p className="text-muted-foreground">Loading your classmates...</p>
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
          <h1 className="text-3xl font-bold">Classmates</h1>
          <p className="text-muted-foreground">Connect with students in your courses</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or major..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {userCourses.map((course) => (
                <SelectItem key={course.id} value={course.code}>
                  {course.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Classmates</p>
                  <p className="text-2xl font-bold">{classmates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Shared Courses</p>
                  <p className="text-2xl font-bold">{userCourses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Search className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Filtered Results</p>
                  <p className="text-2xl font-bold">{filteredClassmates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classmates Grid */}
        {filteredClassmates.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {classmates.length === 0 ? "No classmates found" : "No results match your filters"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {classmates.length === 0 
                ? "Enroll in courses to connect with other students"
                : "Try adjusting your search terms or course filter"
              }
            </p>
            {searchTerm || selectedCourse !== "all" ? (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-blue-600 hover:underline"
                >
                  Clear search
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  onClick={() => setSelectedCourse("all")}
                  className="text-blue-600 hover:underline"
                >
                  Show all courses
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClassmates.map((classmate) => (
              <ClassmateCard key={classmate.id} classmate={classmate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}