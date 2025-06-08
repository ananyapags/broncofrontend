import { useEffect, useState } from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Landing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    if (!email.endsWith("@scu.edu")) {
      toast({
        title: "Error",
        description: "Please use your SCU email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        // Create new user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Success",
          description: "Account created successfully! Welcome to Bronco Buddies.",
        });
        console.log("User created:", userCredential.user);
      } else {
        // Sign in existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Success",
          description: "Welcome back to Bronco Buddies!",
        });
        console.log("User signed in:", userCredential.user);
      }
      
      // Redirect to dashboard after successful authentication
      window.location.href = "/";
      
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = "Authentication failed";
      
      switch (authError.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email. Please sign up first.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists. Please sign in instead.";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters long.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = authError.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Password Reset",
      description: "Please contact IT support for password assistance",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-scu-red to-scu-dark-red flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-scu-red to-scu-dark-red flex items-center justify-center px-4">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-scu-red rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="text-white text-2xl w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bronco Buddies</h1>
            <p className="text-gray-600">Connect with SCU classmates and organize study sessions</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your SCU email"
                className="w-full focus:ring-2 focus:ring-scu-red focus:border-transparent"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full focus:ring-2 focus:ring-scu-red focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-scu-red text-white hover:bg-scu-dark-red font-medium py-2 px-4 rounded-md transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isSignUp ? "Creating Account..." : "Signing in...")
                : (isSignUp ? "Create Account" : "Login")
              }
            </Button>
            
            <div className="text-center space-y-3">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-scu-red hover:text-scu-dark-red font-medium hover:underline"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Need an account? Sign up"
                }
              </button>
              
              {!isSignUp && (
                <div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-gray-600 hover:text-scu-red font-medium hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">Only @scu.edu accounts are allowed</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
