import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GraduationCap, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdminUser } from "@/lib/adminAuth";

export default function Header() {
  const { user } = useFirebaseAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", current: location === "/" },
    { name: "My Courses", href: "/courses", current: location === "/courses" },
    { name: "Classmates", href: "/classmates", current: location === "/classmates" },
    { name: "Study Sessions", href: "/sessions", current: location === "/sessions" },
  ];

  // Only show Admin link for authorized users
  if (user?.email && isAdminUser(user.email)) {
    navigation.push({ name: "Admin", href: "/admin", current: location === "/admin" });
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-scu-red rounded-full flex items-center justify-center">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bronco Buddies</h1>
              <p className="text-sm text-gray-500">Santa Clara University</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <span
                  className={`${
                    item.current
                      ? "text-scu-red border-b-2 border-scu-red font-medium"
                      : "text-gray-600 hover:text-scu-red"
                  } pb-2 transition-colors cursor-pointer`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-gray-700 hover:text-scu-red">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.photoURL || ""} alt="Profile" />
                    <AvatarFallback>
                      {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {user?.displayName || user?.email?.split('@')[0] || "User"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
