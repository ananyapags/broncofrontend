import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Users, Check, Share } from "lucide-react";

interface StudySessionCardProps {
  session: {
    id: string;
    title: string;
    description?: string;
    location: string;
    startTime: string;
    endTime: string;
    course: {
      id: string;
      code: string;
      name: string;
    };
    creator: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
    attendees: Array<{
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    }>;
  };
  onJoin: (sessionId: string) => void;
  onLeave: (sessionId: string) => void;
  isLoading: boolean;
}

export default function StudySessionCard({ session, onJoin, onLeave, isLoading }: StudySessionCardProps) {
  const { user } = useFirebaseAuth();
  
  const isCreator = user?.uid === session.creator.id;
  const isAttendee = session.attendees.some(attendee => attendee.id === user?.uid);
  const canJoin = !isCreator && !isAttendee;
  const canLeave = !isCreator && isAttendee;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: session.title,
        text: `Join this study session for ${session.course.code}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{session.title}</h3>
                <p className="text-sm text-gray-600">{session.course.code} - {session.course.name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="text-gray-400 w-4 h-4" />
                <span className="text-sm text-gray-600">{formatDate(session.startTime)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="text-gray-400 w-4 h-4" />
                <span className="text-sm text-gray-600">
                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="text-gray-400 w-4 h-4" />
                <span className="text-sm text-gray-600">{session.location}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Organizer</p>
              <div className="flex items-center space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={session.creator.profileImageUrl} alt={`${session.creator.firstName} ${session.creator.lastName}`} />
                  <AvatarFallback className="text-xs">
                    {session.creator.firstName?.[0]}{session.creator.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">
                  {session.creator.firstName} {session.creator.lastName}
                </span>
              </div>
            </div>
            
            {session.description && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
                <p className="text-sm text-gray-600">{session.description}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Attendees ({session.attendees.length + 1})
              </p>
              <div className="flex -space-x-2">
                {/* Show creator first */}
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarImage src={session.creator.profileImageUrl} alt={`${session.creator.firstName} ${session.creator.lastName}`} />
                  <AvatarFallback className="text-xs">
                    {session.creator.firstName?.[0]}{session.creator.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                {/* Show attendees */}
                {session.attendees.slice(0, 5).map((attendee) => (
                  <Avatar key={attendee.id} className="w-8 h-8 border-2 border-white">
                    <AvatarImage src={attendee.profileImageUrl} alt={`${attendee.firstName} ${attendee.lastName}`} />
                    <AvatarFallback className="text-xs">
                      {attendee.firstName?.[0]}{attendee.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
                
                {/* Show count if more than 5 attendees */}
                {session.attendees.length > 5 && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-gray-600">+{session.attendees.length - 5}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="ml-6 flex flex-col space-y-2">
            {canJoin && (
              <Button
                onClick={() => onJoin(session.id)}
                disabled={isLoading}
                className="bg-green-600 text-white hover:bg-green-700"
                size="sm"
              >
                <Check className="w-4 h-4 mr-1" />
                Join
              </Button>
            )}
            
            {canLeave && (
              <Button
                onClick={() => onLeave(session.id)}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                Leave
              </Button>
            )}
            
            {isCreator && (
              <div className="text-xs text-gray-500 px-2 py-1 bg-blue-50 rounded">
                Your session
              </div>
            )}
            
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
            >
              <Share className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
