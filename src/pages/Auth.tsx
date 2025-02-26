
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      console.log("User terdeteksi, mengarahkan ke halaman utama");
      navigate("/");
    }
  }, [user, navigate]);

  // Basic email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate email first
    if (!isValidEmail(email)) {
      setError("Format email tidak valid. Mohon periksa kembali.");
      setIsLoading(false);
      return;
    }

    // Validate password
    if (password.length < 6) {
      setError("Kata sandi harus minimal 6 karakter.");
      setIsLoading(false);
      return;
    }

    // Additional validation for sign up
    if (isSignUp) {
      if (!fullName) {
        setError("Nama lengkap harus diisi.");
        setIsLoading(false);
        return;
      }
      if (!whatsappNumber) {
        setError("Nomor WhatsApp harus diisi.");
        setIsLoading(false);
        return;
      }
    }

    console.log(`Mencoba ${isSignUp ? 'mendaftar' : 'masuk'} dengan:`, email);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              whatsapp_number: whatsappNumber
            },
            emailRedirectTo: window.location.origin,
          }
        });

        if (error) {
          console.error("Error pendaftaran:", error);
          if (error.message.includes("already registered")) {
            setError("Email sudah terdaftar. Silakan masuk dengan email tersebut.");
            setIsSignUp(false);
          } else if (error.message.includes("invalid")) {
            setError("Format email tidak valid atau domain email tidak diizinkan.");
          } else {
            setError(error.message);
          }
          setIsLoading(false);
          return;
        }

        toast({
          title: "Pendaftaran berhasil",
          description: "Silakan masuk dengan akun yang baru dibuat",
        });
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Error masuk:", error);
          if (error.message === "Invalid login credentials") {
            setError("Email atau kata sandi salah. Silakan coba lagi atau daftar jika belum memiliki akun.");
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
            {isSignUp ? 'Daftar akun baru' : 'Masuk ke akun Anda'}
          </p>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm -space-y-px">
            {isSignUp && (
              <>
                <div className="mb-2">
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Nama Lengkap"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <div className="mb-2">
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Nomor WhatsApp"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="mb-2"
                  />
                </div>
              </>
            )}
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
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
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
              {isLoading ? "Memproses..." : (isSignUp ? "Daftar" : "Masuk")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setError(null);
                setIsSignUp(!isSignUp);
                setFullName("");
                setWhatsappNumber("");
              }}
              disabled={isLoading}
            >
              {isSignUp ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
