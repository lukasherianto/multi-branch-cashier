import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Attempting login with:", email); // Debug log

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error); // Debug log
        if (error.message === "Invalid login credentials") {
          toast({
            variant: "destructive",
            title: "Login gagal",
            description: "Email atau kata sandi salah. Silakan coba lagi atau daftar jika belum memiliki akun.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Login gagal",
            description: error.message,
          });
        }
        return;
      }

      toast({
        title: "Login berhasil",
        description: "Anda akan diarahkan ke halaman utama",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Unexpected error:", error); // Debug log
      toast({
        variant: "destructive",
        title: "Login gagal",
        description: "Terjadi kesalahan yang tidak diharapkan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Attempting signup with:", email); // Debug log

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) {
        console.error("Signup error:", error); // Debug log
        toast({
          variant: "destructive",
          title: "Pendaftaran gagal",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Pendaftaran berhasil",
        description: "Silakan cek email Anda untuk verifikasi",
      });
    } catch (error: any) {
      console.error("Unexpected signup error:", error); // Debug log
      toast({
        variant: "destructive",
        title: "Pendaftaran gagal",
        description: "Terjadi kesalahan yang tidak diharapkan",
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
            Masuk atau daftar untuk melanjutkan
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
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
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSignUp}
              disabled={isLoading}
            >
              Daftar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;