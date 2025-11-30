import { createFileRoute } from "@tanstack/react-router";
import { SignupForm } from "@web/components/auth/signup-form";

export const Route = createFileRoute("/_auth/signup")({
  component: SignupPage
});

function SignupPage() {
  return (
    <div className="bg-muted flex min-h-dvh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignupForm />
      </div>
    </div>
  );
}
