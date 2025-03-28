
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
  const [isValidLink, setIsValidLink] = useState(true);

  useEffect(() => {
    // Check if there is a hash in the URL (this means we have access token)
    if (!location.hash) {
      setIsValidLink(false);
      setError("Link reset password tidak valid atau telah kadaluarsa.");
    }
  }, [location]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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

    try {
      // Log the password reset attempt
      console.log("Attempting to reset password");
      
      // Update the user's password
      const { error, data } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("Error resetting password:", error);
        setError(error.message || "Terjadi kesalahan saat mengubah password");
        toast({
          title: "Error mengubah password",
          description: error.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Log successful password reset
      console.log("Password reset successful, user data:", data.user);
      
      setMessage("Password berhasil diubah. Anda akan diarahkan ke halaman login.");
      toast({
        title: "Password berhasil diubah",
        description: "Silakan masuk dengan password baru Anda",
      });

      // Sign the user out to ensure a fresh login with the new password
      await supabase.auth.signOut();

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 3000);
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
