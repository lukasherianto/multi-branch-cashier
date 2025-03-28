
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

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isValidEmail(email)) {
      setError("Format email tidak valid. Mohon periksa kembali.");
      setIsLoading(false);
      return;
    }

    try {
      // Get the current origin for creating the correct redirect URL
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });

      if (error) {
        console.error("Error reset password:", error);
        setError(error.message);
        setIsLoading(false);
        return;
      }

      toast({
        title: "Email reset password terkirim",
        description: "Silakan periksa email Anda untuk instruksi selanjutnya",
      });
      
      // Return to login mode
      onBackToLogin();
    } catch (error: any) {
      console.error("Error tidak terduga:", error);
      setError("Terjadi kesalahan yang tidak terduga");
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
        />
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
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
