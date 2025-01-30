import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log(`Mencoba ${isSignUp ? 'mendaftar' : 'masuk'} dengan:`, email);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });

        if (error) {
          console.error("Error pendaftaran:", error);
          if (error.message.includes("already registered")) {
            toast({
              variant: "destructive",
              title: "Pendaftaran gagal",
              description: "Email sudah terdaftar. Silakan masuk dengan email tersebut.",
            });
            setIsSignUp(false);
          } else {
            toast({
              variant: "destructive",
              title: "Pendaftaran gagal",
              description: error.message,
            });
          }
          return;
        }

        toast({
          title: "Pendaftaran berhasil",
          description: "Silakan masuk dengan akun yang baru dibuat",
        });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Error masuk:", error);
          if (error.message === "Invalid login credentials") {
            toast({
              variant: "destructive",
              title: "Gagal masuk",
              description: "Email atau kata sandi salah. Silakan coba lagi atau daftar jika belum memiliki akun.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Gagal masuk",
              description: error.message,
            });
          }
          return;
        }

        toast({
          title: "Berhasil masuk",
          description: "Anda akan diarahkan ke halaman utama",
        });
        navigate("/");
      }
    } catch (error: any) {
      console.error("Error tidak terduga:", error);
      toast({
        variant: "destructive",
        title: isSignUp ? "Pendaftaran gagal" : "Gagal masuk",
        description: "Terjadi kesalahan yang tidak terduga",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            KasirBengkulu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? 'Daftar akun baru' : 'Masuk ke akun Anda'}
          </p>
        </div>
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
              onClick={() => setIsSignUp(!isSignUp)}
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