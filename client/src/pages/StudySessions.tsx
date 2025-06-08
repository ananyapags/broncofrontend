import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Plus, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DataService } from "@/lib/dataService";
import StudySessionCard from "@/components/StudySessionCard";

const createSessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  courseCode: z.string().min(1, "Course is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().min(1, "Location is required"),
});

type CreateSessionForm = z.infer<typeof createSessionSchema>;

export default function StudySessions() {
  const { toast } = useToast();
  const { user, isLoading } = useFirebaseAuth();
  const [studySessions, setStudySessions] = useState<any[]>([]);
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm<CreateSessionForm>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      title: "",
      description: "",
      courseCode: "",
      startTime: "",
      endTime: "",
      location: "",
    },
  });

  useEffect(() => {
    if (user && !isLoading) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Load user's courses
      const coursesData = await DataService.getUserCourses(user.uid);
      setUserCourses(coursesData);
      
      // Load all study sessions for the user
      const allSessions = await DataService.getAllStudySessionsForUser(user.uid);
      setStudySessions(allSessions);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (data: CreateSessionForm) => {
    if (!user) return;

    try {
      const sessionData = {
        title: data.title,
        description: data.description || '',
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        courseCode: data.courseCode,
        creatorId: user.uid,
        attendees: [user.uid],
        createdAt: new Date(),
      };

      await DataService.createStudySession(sessionData);

      toast({
        title: "Success",
        description: "Study session created successfully",
      });
      
      setIsCreateDialogOpen(false);
      form.reset();
      loadData();
    } catch (error) {
      console.error('Error creating study session:', error);
      toast({
        title: "Error",
        description: "Failed to create study session",
        variant: "destructive",
      });
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    if (!user) {
      console.log('No user found for join session');
      return;
    }

    const session = studySessions.find(s => s.id === sessionId);
    if (!session) {
      console.log('Session not found:', sessionId);
      return;
    }

    console.log('Attempting to join session:', sessionId, 'for course:', session.courseCode, 'user:', user.uid);

    try {
      await DataService.joinStudySession(sessionId, session.courseCode, user.uid);
      console.log('Successfully joined session');
      toast({
        title: "Success",
        description: "Joined study session",
      });
      loadData();
    } catch (error) {
      console.error('Error joining session:', error);
      toast({
        title: "Error",
        description: "Failed to join study session",
        variant: "destructive",
      });
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    if (!user) return;

    const session = studySessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      await DataService.leaveStudySession(sessionId, session.courseCode, user.uid);
      toast({
        title: "Success",
        description: "Left study session",
      });
      loadData();
    } catch (error) {
      console.error('Error leaving session:', error);
      toast({
        title: "Error",
        description: "Failed to leave study session",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: CreateSessionForm) => {
    createSession(data);
  };

  if (isLoading || loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Study Sessions</h1>
            <p className="text-muted-foreground">Loading your study sessions...</p>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Study Sessions</h1>
            <p className="text-muted-foreground">Join or create study sessions with your classmates</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Study Session</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Study session title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="courseCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {userCourses.map((course) => (
                              <SelectItem key={course.id} value={course.code}>
                                {course.code} - {course.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="What will you be studying?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Library Study Room 2A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Session</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Study Sessions Grid */}
        {studySessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No study sessions yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first study session to start collaborating with classmates
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Study Session
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studySessions.map((session) => (
              <StudySessionCard
                key={session.id}
                session={session}
                onJoin={handleJoinSession}
                onLeave={handleLeaveSession}
                isLoading={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}