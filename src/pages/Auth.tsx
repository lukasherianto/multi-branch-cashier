
import { CardContent, CardFooter } from "@/components/ui/card";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { SignInForm } from "@/components/auth/SignInForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { useAuthForm } from "@/hooks/auth/useAuthForm";

const Auth = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    mode,
    switchToForgotPassword,
    switchToSignIn
  } = useAuthForm();

  return (
    <AuthLayout>
      <AuthHeader
        title="Xaviera Pos"
        subtitle={mode === "signin" 
          ? "Masuk ke akun pemilik usaha" 
          : "Reset Password Akun"
        }
      />
      
      <CardContent>
        {mode === "signin" ? (
          <SignInForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onForgotPassword={switchToForgotPassword}
            error={error}
            setError={setError}
          />
        ) : (
          <ForgotPasswordForm
            email={email}
            setEmail={setEmail}
            onBackToLogin={switchToSignIn}
            error={error}
            setError={setError}
          />
        )}
      </CardContent>
      
      {mode === "forgot" && (
        <CardFooter>
          {/* This space is kept for consistency but content is in ForgotPasswordForm */}
        </CardFooter>
      )}
    </AuthLayout>
  );
};

export default Auth;
