import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, User } from "lucide-react";

interface ClassmateCardProps {
  classmate: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    sharedCourses: Array<{
      id: number;
      code: string;
      name: string;
    }>;
  };
}

export default function ClassmateCard({ classmate }: ClassmateCardProps) {
  const handleEmail = () => {
    window.location.href = `mailto:${classmate.email}`;
  };

  const getRandomMajor = () => {
    const majors = ["Computer Science", "Mathematics", "Philosophy", "Engineering", "Business", "Psychology"];
    return majors[Math.floor(Math.random() * majors.length)];
  };

  const getRandomYear = () => {
    const years = ["Freshman", "Sophomore", "Junior", "Senior"];
    return years[Math.floor(Math.random() * years.length)];
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={classmate.profileImageUrl} alt={`${classmate.firstName} ${classmate.lastName}`} />
            <AvatarFallback>
              {classmate.firstName?.[0]}{classmate.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">
              {classmate.firstName} {classmate.lastName}
            </h3>
            <p className="text-sm text-gray-600">
              {getRandomMajor()} • {getRandomYear()}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Shared Courses</p>
          <div className="flex flex-wrap gap-1">
            {classmate.sharedCourses.map((course) => (
              <Badge key={course.id} variant="secondary" className="text-xs">
                {course.code}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={handleEmail}
            className="flex-1 bg-scu-red text-white hover:bg-scu-dark-red"
          >
            <Mail className="w-4 h-4 mr-1" />
            Email
          </Button>
          <Button variant="outline" size="sm">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
