
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if there is a hash in the URL (this means we have access token)
    if (!location.hash) {
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
      // Update the user's password
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("Error resetting password:", error);
        throw error;
      }

      setMessage("Password berhasil diubah. Anda akan diarahkan ke halaman login.");
      toast({
        title: "Password berhasil diubah",
        description: "Silakan masuk dengan password baru Anda",
      });

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Xaviera Pos
          </CardTitle>
          <p className="text-center text-sm text-gray-600">
            Reset Password
          </p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {message && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          {!error && !message && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password Baru
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password Baru"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                  Konfirmasi Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Konfirmasi Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate("/auth")}
          >
            Kembali ke halaman login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
