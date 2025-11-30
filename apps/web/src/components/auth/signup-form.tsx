import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { Button } from "@web/components/ui/button";
import { Card, CardContent } from "@web/components/ui/card";
import { cn } from "@web/lib/utils";

import {
  signupSchema,
  type SignupDTO
} from "@api/modules/auth/application/commands/signup/signup.dto";
import { createSignupMutationOptions } from "@web/lib/tanstack/options/auth/signup";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SignupDTO>({
    resolver: zodResolver(signupSchema)
  });

  const navigate = useNavigate();

  const signupMutation = useMutation({
    ...createSignupMutationOptions(),
    onSuccess: (data) => {
      toast.success(data.message);
      navigate({ to: "/login" });
    },
    onError: (error: Error) => {
      toast.error("Signup failed. Please try again.");
    }
  });

  const onSubmit = (data: SignupDTO) => {
    signupMutation.mutate(data);
    reset();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-balance">
                  Sign up for a new Acme Inc account
                </p>
              </div>

              {/* Fullname */}
              <div className="grid gap-2">
                <Label htmlFor="fullname">Fullname</Label>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="John Doe"
                  {...register("fullname")}
                  aria-invalid={!!errors.fullname}
                />
                <span className="text-destructive mt-1 block text-xs">
                  {errors.fullname?.message}
                </span>
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="m@example.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                <span className="text-destructive mt-1 block text-xs">{errors.email?.message}</span>
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                <span className="text-destructive mt-1 block text-xs">
                  {errors.password?.message}
                </span>
              </div>

              {/* Retype Password */}
              <div className="grid gap-2">
                <Label htmlFor="retypePassword">Retype Password</Label>
                <Input
                  id="retypePassword"
                  type="password"
                  {...register("retypePassword")}
                  aria-invalid={!!errors.retypePassword}
                />
                <span className="text-destructive mt-1 block text-xs">
                  {errors.retypePassword?.message}
                </span>
              </div>

              <Button type="submit" className="w-full">
                Sign Up
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Log in
                </a>
              </div>
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
