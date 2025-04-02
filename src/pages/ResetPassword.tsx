
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useResetPasswordForm } from "@/hooks/auth/useResetPasswordForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardContent, CardFooter } from "@/components/ui/card";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    message,
    isLoading,
    isValidLink,
    handleResetPassword
  } = useResetPasswordForm();
  
  // Check authentication state when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log("Reset password page - Auth check:", 
                 data.session ? "User is authenticated" : "No session");
        
        if (error) {
          console.error("Error checking session:", error);
        }
      } catch (err) {
        console.error("Unexpected error checking auth:", err);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <AuthLayout>
      <AuthHeader 
        title="Xaviera Pos"
        subtitle="Reset Password"
      />
      
      <CardContent>
        {error && !isValidLink && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {message && (
          <Alert className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {!message && isValidLink && (
          <ResetPasswordForm
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            error={error}
            isLoading={isLoading}
            onSubmit={handleResetPassword}
          />
        )}
        
        {!isValidLink && !message && (
          <div className="text-center py-4">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Link reset password tidak valid atau telah kadaluarsa.
                  Silakan meminta reset password baru.
                </p>
                <Button 
                  variant="primary" 
                  className="w-full mt-2"
                  onClick={() => navigate("/auth")}
                >
                  Kembali ke Login
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => navigate("/auth")}
        >
          Kembali ke halaman login
        </Button>
      </CardFooter>
    </AuthLayout>
  );
};

export default ResetPassword;
