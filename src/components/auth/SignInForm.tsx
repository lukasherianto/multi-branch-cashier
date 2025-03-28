
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SignInFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onForgotPassword: () => void;
  setError: (error: string | null) => void;
  error: string | null;
}

export const SignInForm = ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  onForgotPassword,
  setError,
  error
}: SignInFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isValidEmail(email)) {
      setError("Format email tidak valid. Mohon periksa kembali.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi harus minimal 6 karakter.");
      setIsLoading(false);
      return;
    }

    console.log('Attempting login with:', email);

    try {
      // Log the actual values being used for login
      console.log('Login attempt details:', { 
        email: email, 
        passwordLength: password.length
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login Error Details:", {
          message: error.message,
          status: error.status
          // Removed the 'cause' property that doesn't exist on AuthError
        });

        if (error.message === "Invalid login credentials") {
          setError("Email atau kata sandi salah. Silakan coba lagi.");
          toast({
            title: "Login Gagal",
            description: "Email atau kata sandi tidak sesuai.",
            variant: "destructive"
          });
        } else {
          setError(error.message);
          toast({
            title: "Login Error",
            description: error.message,
            variant: "destructive"
          });
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log("Login successful, user data:", data.user);
        console.log("Session data:", data.session);
        toast({
          title: "Berhasil masuk",
          description: "Anda akan diarahkan ke halaman utama",
        });
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      setError("Terjadi kesalahan yang tidak terduga");
      toast({
        title: "Login Error",
        description: "Terjadi kesalahan yang tidak terduga",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
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
      
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="password" className="block text-sm font-medium">
            Kata Sandi
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs text-primary hover:underline"
          >
            Lupa password?
          </button>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Kata Sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Masuk
      </Button>
    </form>
  );
};
