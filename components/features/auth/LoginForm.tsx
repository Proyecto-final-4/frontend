import { User, Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  return (
    <div className="flex-grow flex flex-col justify-center max-w-[400px] mx-auto w-full py-12">
      {/* Avatar & heading */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="text-outline w-10 h-10" />
        </div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Welcome Back</h2>
        <p className="text-on-surface-variant text-sm mt-2">
          Enter your credentials to access your curator.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="block text-xs font-bold text-on-surface uppercase tracking-wider"
          >
            Email or Username
          </Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5 group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              className="h-12 pl-12 bg-surface-container-low border-2 border-transparent rounded-full focus-visible:border-primary focus-visible:ring-0 focus-visible:bg-white transition-all duration-200 placeholder:text-outline"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="block text-xs font-bold text-on-surface uppercase tracking-wider"
          >
            Password
          </Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5 group-focus-within:text-primary transition-colors pointer-events-none" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="h-12 pl-12 bg-surface-container-low border-2 border-transparent rounded-full focus-visible:border-primary focus-visible:ring-0 focus-visible:bg-white transition-all duration-200 placeholder:text-outline"
            />
          </div>
        </div>

        {/* Remember me / Forgot password */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" name="remember" />
            <Label
              htmlFor="remember"
              className="text-xs text-on-surface-variant font-medium cursor-pointer"
            >
              Remember me
            </Label>
          </div>
          <a href="#" className="text-xs font-bold text-primary hover:underline transition-colors">
            Forgot password?
          </a>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-12 bg-primary-container text-white font-bold rounded-full hover:brightness-110 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/10 mt-8"
        >
          LOGIN
        </Button>
      </form>
    </div>
  );
}
