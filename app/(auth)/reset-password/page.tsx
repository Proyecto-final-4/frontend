import { AuthVisual } from "@/components/features/auth/AuthVisual";
import { ResetPasswordForm } from "@/components/features/auth/ResetPasswordForm";
import { UndertonesBackground } from "@/components/effects/UndertonesBackground";
import { Logo } from "@/components/layout/Logo";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : null;

  return (
    <main className="relative min-h-screen flex flex-col md:flex-row">
      {/* WebGL background: full screen on mobile, right panel on desktop */}
      <UndertonesBackground
        className="absolute inset-0 z-0 md:left-[45%] lg:left-[40%] md:right-0"
        preset="finanzia"
        mouseEnabled
      />

      {/* Formulario */}
      <div className="relative z-10 flex w-full min-h-screen flex-col bg-transparent px-8 pb-8 pt-6 pointer-events-none md:pointer-events-auto md:w-[45%] md:bg-background md:px-12 md:pb-12 md:pt-8 lg:w-[40%] lg:px-16 lg:pb-16 lg:pt-10 border-b border-border md:border-b-0 md:border-r">
        <div className="pointer-events-auto w-full max-w-[400px] mx-auto shrink-0">
          <Logo />
        </div>
        <div className="pointer-events-auto flex flex-1 w-full max-w-[400px] mx-auto flex-col justify-center min-h-0">
          <ResetPasswordForm token={token} />
        </div>
      </div>

      <AuthVisual />
    </main>
  );
}
