import { AuthVisual } from "@/components/features/auth/AuthVisual";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { Logo } from "@/components/layout/Logo";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Left: form */}
      <div className="w-full md:w-[45%] lg:w-[40%] min-h-screen p-8 md:p-12 lg:p-16 flex flex-col justify-between bg-white relative z-10">
        <Logo />
        <LoginForm />
        <div className="mt-auto text-center pt-8 border-t border-outline-variant/10">
          <p className="text-sm text-on-surface-variant font-medium">
            Not a member?{" "}
            <a href="#" className="font-bold text-primary hover:underline ml-1">
              Create an account
            </a>
          </p>
        </div>
      </div>

      {/* Right: visual */}
      <AuthVisual />
    </main>
  );
}
