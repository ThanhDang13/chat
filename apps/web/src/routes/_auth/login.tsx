import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@web/components/auth/login-form";

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage
});

function LoginPage() {
  return (
    <div className="bg-muted flex min-h-dvh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
