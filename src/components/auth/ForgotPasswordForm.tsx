
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  onBackToLogin: () => void;
  setError: (error: string | null) => void;
  error: string | null;
}

export const ForgotPasswordForm = ({ 
  email, 
  setEmail, 
  onBackToLogin,
  setError,
  error
}: ForgotPasswordFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Clean up the email by trimming whitespace
    const cleanEmail = email.trim();

    if (!isValidEmail(cleanEmail)) {
      setError("Format email tidak valid. Mohon periksa kembali.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Sending password reset email to:", cleanEmail);
      
      // Get the current origin for creating the correct redirect URL
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/reset-password`;
      
      console.log("Using redirect URL:", redirectTo);
      
      // First, sign out to ensure a clean state
      await supabase.auth.signOut();
      
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo
      });

      if (error) {
        console.error("Error reset password:", error);
        
        if (error.message.includes("rate limit")) {
          setError("Terlalu banyak permintaan reset password. Silakan tunggu beberapa saat dan coba lagi.");
        } else {
          setError(error.message);
        }
        
        toast({
          title: "Error Reset Password",
          description: error.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      setEmailSent(true);
      toast({
        title: "Email reset password terkirim",
        description: "Silakan periksa email Anda untuk instruksi selanjutnya",
      });
      
      // Return to login mode after showing the message
      setTimeout(() => {
        onBackToLogin();
      }, 3000);
    } catch (error: any) {
      console.error("Error tidak terduga:", error);
      setError("Terjadi kesalahan yang tidak terduga");
      toast({
        title: "Error",
        description: "Terjadi kesalahan yang tidak terduga",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleForgotPassword} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {emailSent && (
        <Alert className="mb-4">
          <AlertDescription>
            Email reset password telah dikirim. Silakan periksa email Anda dan ikuti instruksi di dalamnya.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Alamat Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Alamat Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || emailSent}
        />
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || emailSent}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Kirim Email Reset Password
      </Button>
      
      <Button
        variant="ghost"
        className="w-full"
        onClick={onBackToLogin}
        type="button"
      >
        Kembali ke halaman login
      </Button>
    </form>
  );
};
