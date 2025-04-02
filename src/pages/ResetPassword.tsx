
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
      const { data } = await supabase.auth.getSession();
      console.log("Reset password page - Auth check:", 
                 data.session ? "User is authenticated" : "No session");
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
