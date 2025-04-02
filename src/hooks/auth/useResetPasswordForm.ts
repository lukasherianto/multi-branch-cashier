
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useResetPasswordForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isValidLink, setIsValidLink] = useState(false);
  
  useEffect(() => {
    const validateResetLink = async () => {
      // Check if there is a hash in the URL (this means we have access token)
      if (!location.hash) {
        console.log("No hash found in URL, link is invalid");
        setIsValidLink(false);
        setError("Link reset password tidak valid atau telah kadaluarsa.");
        return;
      }
      
      try {
        // Check if we can get a session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error validating reset link:", error);
          setIsValidLink(false);
          setError("Link reset password tidak valid atau telah kadaluarsa.");
          return;
        }
        
        if (!data.session) {
          console.log("No session from hash, link may be expired");
          setIsValidLink(false);
          setError("Link reset password tidak valid atau telah kadaluarsa.");
          return;
        }
        
        console.log("Valid session found from reset link");
        setIsValidLink(true);
      } catch (err) {
        console.error("Unexpected error validating reset link:", err);
        setIsValidLink(false);
        setError("Terjadi kesalahan saat memvalidasi link reset password.");
      }
    };
    
    validateResetLink();
  }, [location]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate password
      if (password.length < 6) {
        setError("Kata sandi harus minimal 6 karakter.");
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Konfirmasi kata sandi tidak cocok.");
        setIsLoading(false);
        return;
      }

      // First, ensure we're signed in (the hash in URL should have authenticated the user)
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Log information about current session
      console.log("Current session before password update:", 
                 sessionData.session ? "Session exists" : "No session");
      
      if (!sessionData.session) {
        setError("Sesi telah kadaluarsa. Silakan meminta link reset password baru.");
        setIsLoading(false);
        toast({
          title: "Link Kadaluarsa",
          description: "Sesi telah kadaluarsa. Silakan meminta link reset password baru.",
          variant: "destructive"
        });
        
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 3000);
        
        return;
      }

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({ 
        password 
      });

      if (updateError) {
        console.error("Error resetting password:", updateError);
        setError(updateError.message || "Terjadi kesalahan saat mengubah password");
        toast({
          title: "Error mengubah password",
          description: updateError.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Log successful password reset
      console.log("Password reset successful");
      
      setMessage("Password berhasil diubah. Anda akan diarahkan ke halaman login.");
      toast({
        title: "Password berhasil diubah",
        description: "Silakan masuk dengan password baru Anda",
      });

      // Sign the user out to ensure a fresh login with the new password
      await supabase.auth.signOut();
      console.log("User signed out after password reset");

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setError(error.message || "Terjadi kesalahan saat mengubah password");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    message,
    isLoading,
    isValidLink,
    handleResetPassword
  };
};
