
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";

export const useAuthForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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

  const switchToForgotPassword = () => setMode("forgot");
  const switchToSignIn = () => setMode("signin");

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    mode,
    switchToForgotPassword,
    switchToSignIn
  };
};
