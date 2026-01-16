import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    // Navigate to OTP page with email
    navigate("/verify-otp", { state: { email: formData.email } });
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

        {/* Register Card */}
        <div className="bg-card rounded-2xl md:rounded-3xl border-2 border-dashed border-primary/30 p-6 md:p-8 lg:p-10">
          {/* Tank Icon */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="text-4xl md:text-5xl">🤖</div>
          </div>

          {/* Title */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Join QuizTank
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Start your learning adventure today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-medium text-sm md:text-base">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="JohnDoe1234"
                value={formData.username}
                onChange={handleChange}
                required
                className="bg-muted/50 border-border h-11 md:h-12 rounded-xl text-sm md:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium text-sm md:text-base">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="JohnDoe"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-muted/50 border-border h-11 md:h-12 rounded-xl text-sm md:text-base"
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium text-sm md:text-base">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="bg-muted/50 border-border h-11 md:h-12 rounded-xl text-sm md:text-base"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 md:h-12 rounded-xl text-sm md:text-base font-semibold mt-4 md:mt-6"
            >
              Create Account
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center mt-4 md:mt-6 text-muted-foreground text-sm md:text-base">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
