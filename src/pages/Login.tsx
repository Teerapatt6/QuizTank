import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mock login - in real app, authenticate with backend
    toast({
      title: "Welcome Back!",
      description: "You have successfully signed in",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-muted/30 py-6 md:py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors mb-4 md:mb-6 text-sm md:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home Page
        </Link>

        {/* Login Card */}
        <div className="bg-card rounded-2xl md:rounded-3xl border-2 border-dashed border-primary/30 p-6 md:p-8 lg:p-10">
          {/* Tank Icon */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="text-4xl md:text-5xl">🤖</div>
          </div>

          {/* Title */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Welcome Back
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Sign In to continue your learning journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium text-sm md:text-base">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="JohnDoe@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-muted/50 border-border h-11 md:h-12 rounded-xl text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium text-sm md:text-base">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-muted/50 border-border h-11 md:h-12 rounded-xl text-sm md:text-base"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-xs md:text-sm text-muted-foreground cursor-pointer"
                >
                  Remember Me
                </Label>
              </div>
              <Link
                to="/forgot-password"
                className="text-xs md:text-sm text-primary hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 md:h-12 rounded-xl text-sm md:text-base font-semibold mt-4 md:mt-6"
            >
              Sign In
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-4 md:mt-6 text-muted-foreground text-sm md:text-base">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
