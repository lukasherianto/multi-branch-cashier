
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/auth";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

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

    if (password.length < 6) {
      setError("Kata sandi harus minimal 6 karakter.");
      setIsLoading(false);
      return;
    }

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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Xaviera Pos
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masuk ke akun pemilik usaha
          </p>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Alamat Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-2"
              />
            </div>
            <div>
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
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
