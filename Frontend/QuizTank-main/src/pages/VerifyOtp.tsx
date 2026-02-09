import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");

  const email = location.state?.email || "your@email.com";

  const mode = location.state?.mode || 'REGISTER'; // Default to register if not specified
  const { completeLogin } = useAuth();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit code",
        variant: "destructive",
      });
      return;
    }

    try {
      if (mode === 'LOGIN') {
        const response = await authService.verifyLoginOTP(email, otp);
        if (response.success && response.token && response.user) {
          completeLogin(response.user, response.token);
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          navigate("/");
        }
      } else {
        // Register mode
        const response = await authService.verifyEmail(email, otp);
        toast({
          title: "Verification Successful",
          description: response.message || "Your account has been verified",
        });
        navigate("/login");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.response?.data?.error || "Invalid OTP code",
      });
    }
  };

  const handleResend = () => {
    toast({
      title: "Code Sent",
      description: `A new verification code has been sent to ${email}`,
    });
  };

  return (
    <div className="py-6 md:py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors mb-4 md:mb-6 text-sm md:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home Page
        </Link>

        {/* OTP Card */}
        <div className="bg-card rounded-2xl md:rounded-3xl border-2 border-dashed border-primary/30 p-6 md:p-8 lg:p-10">
          {/* Tank Icon */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="text-4xl md:text-5xl">🤖</div>
          </div>

          {/* Title */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Enter OTP Code
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              We sent you a 6-digit verification code
              <br />
              to your email{" "}
              <span className="text-primary break-all">{email}</span>
            </p>
          </div>

          {/* OTP Input */}
          <div className="flex justify-center mb-4 md:mb-6">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup className="gap-1 sm:gap-2">
                <InputOTPSlot
                  index={0}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-lg sm:text-xl font-bold rounded-lg sm:rounded-xl border-2 border-border"
                />
                <InputOTPSlot
                  index={1}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-lg sm:text-xl font-bold rounded-lg sm:rounded-xl border-2 border-border"
                />
                <InputOTPSlot
                  index={2}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-lg sm:text-xl font-bold rounded-lg sm:rounded-xl border-2 border-border"
                />
                <InputOTPSlot
                  index={3}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-lg sm:text-xl font-bold rounded-lg sm:rounded-xl border-2 border-border"
                />
                <InputOTPSlot
                  index={4}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-lg sm:text-xl font-bold rounded-lg sm:rounded-xl border-2 border-border"
                />
                <InputOTPSlot
                  index={5}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-lg sm:text-xl font-bold rounded-lg sm:rounded-xl border-2 border-border"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Resend Link */}
          <p className="text-center mb-4 md:mb-6 text-muted-foreground text-sm md:text-base">
            Didn't Get Code?{" "}
            <button
              onClick={handleResend}
              className="text-primary hover:underline font-medium"
            >
              Resend Code
            </button>
          </p>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            className="w-full h-11 md:h-12 rounded-xl text-sm md:text-base font-semibold"
          >
            Verify
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
