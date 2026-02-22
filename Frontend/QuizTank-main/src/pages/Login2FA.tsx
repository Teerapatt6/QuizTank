import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import axios from "axios";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";

const Login2FA = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { completeLogin } = useAuth();
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Get passed state
    const userId = location.state?.userId;
    const username = location.state?.username;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6) return;

        setIsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

            const response = await axios.post(`${API_URL}/auth/login-2fa-verify`, {
                userId,
                token: code
            });

            if (response.data.success) {
                toast.success("Login Successful");
                completeLogin(response.data.user, response.data.token);
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            if (axios.isAxiosError(error) && error.response) {
                toast.error(error.response.data.error || "Invalid 2FA Code");
            } else {
                toast.error("Invalid 2FA Code");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-6 md:py-8 px-4">
            <div className="max-w-md mx-auto">
                {/* Back Link */}
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors mb-4 md:mb-6 text-sm md:text-base"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>

                {/* Card */}
                <div className="bg-card rounded-2xl md:rounded-3xl border-2 border-dashed border-primary/30 p-6 md:p-8 lg:p-10">

                    {/* Icon */}
                    <div className="flex justify-center mb-4 md:mb-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6 md:mb-8">
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                            Two-Factor Authentication
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm md:text-base">
                            Enter the 6-digit code from your authenticator app
                            {username && <span> for <span className="font-medium text-foreground">@{username}</span></span>}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                        <div className="flex justify-center items-center">
                            <InputOTP maxLength={6} value={code} onChange={setCode}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} className="w-10 h-12 md:w-12 md:h-14 text-lg md:text-xl" />
                                    <InputOTPSlot index={1} className="w-10 h-12 md:w-12 md:h-14 text-lg md:text-xl" />
                                    <InputOTPSlot index={2} className="w-10 h-12 md:w-12 md:h-14 text-lg md:text-xl" />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} className="w-10 h-12 md:w-12 md:h-14 text-lg md:text-xl" />
                                    <InputOTPSlot index={4} className="w-10 h-12 md:w-12 md:h-14 text-lg md:text-xl" />
                                    <InputOTPSlot index={5} className="w-10 h-12 md:w-12 md:h-14 text-lg md:text-xl" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 md:h-12 rounded-xl text-sm md:text-base font-semibold transition-all hover:scale-[1.02]"
                            disabled={isLoading || code.length !== 6}
                        >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Verify Identity
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login2FA;
