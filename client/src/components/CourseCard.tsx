import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";

interface CourseCardProps {
  course: {
    id: number;
    code: string;
    name: string;
    section: string;
    instructor: string;
    schedule: string;
    location: string;
    units: number;
  };
  isEnrolled: boolean;
  onEnroll: (courseId: number) => void;
  onUnenroll: (courseId: number) => void;
  isLoading: boolean;
}

export default function CourseCard({ course, isEnrolled, onEnroll, onUnenroll, isLoading }: CourseCardProps) {
  return (
    <Card className="hover:bg-gray-50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {course.code} - {course.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Section {course.section} • {course.units} Units
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Instructor</p>
                <p className="text-gray-600">{course.instructor}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Schedule</p>
                <p className="text-gray-600">{course.schedule}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Location</p>
                <p className="text-gray-600">{course.location}</p>
              </div>
            </div>
          </div>
          <div className="ml-6">
            {isEnrolled ? (
              <Button
                variant="outline"
                onClick={() => onUnenroll(course.id)}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Enrolled</span>
              </Button>
            ) : (
              <Button
                onClick={() => onEnroll(course.id)}
                disabled={isLoading}
                className="bg-scu-red text-white hover:bg-scu-dark-red flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Course</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
