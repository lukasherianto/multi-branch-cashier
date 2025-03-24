
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/auth";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "forgot">("signin");

  useEffect(() => {
    if (user) {
      console.log("User terdeteksi, mengarahkan ke halaman utama");
      navigate("/");
    }
  }, [user, navigate]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isValidEmail(email)) {
      setError("Format email tidak valid. Mohon periksa kembali.");
      setIsLoading(false);
      return;
    }

    if (mode === "signin" && password.length < 6) {
      setError("Kata sandi harus minimal 6 karakter.");
      setIsLoading(false);
      return;
    }

    if (mode === "signin") {
      console.log('Mencoba masuk dengan:', email);

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Error masuk:", error);
          if (error.message === "Invalid login credentials") {
            setError("Email atau kata sandi salah. Silakan coba lagi.");
          } else {
            setError(error.message);
          }
          setIsLoading(false);
          return;
        }

        if (data.user) {
          console.log("Login berhasil, mengarahkan ke halaman utama");
          toast({
            title: "Berhasil masuk",
            description: "Anda akan diarahkan ke halaman utama",
          });
          navigate("/", { replace: true });
        }
      } catch (error: any) {
        console.error("Error tidak terduga:", error);
        setError("Terjadi kesalahan yang tidak terduga");
      } finally {
        setIsLoading(false);
      }
    } else if (mode === "forgot") {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
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
        setMode("signin");
      } catch (error: any) {
        console.error("Error tidak terduga:", error);
        setError("Terjadi kesalahan yang tidak terduga");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Xaviera Pos
          </CardTitle>
          <p className="text-center text-sm text-gray-600">
            {mode === "signin" 
              ? "Masuk ke akun pemilik usaha" 
              : "Reset Password Akun"}
          </p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleAuth} className="space-y-4">
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
            
            {mode === "signin" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
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
            )}
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Masuk" : "Kirim Email Reset Password"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter>
          {mode === "forgot" && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setMode("signin")}
            >
              Kembali ke halaman login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
