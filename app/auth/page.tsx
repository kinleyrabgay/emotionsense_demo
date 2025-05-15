"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { useLoginMutation } from "@/lib/api-services/auth-api";
import { LoginSchema } from "@/lib/validators/auth";

const AuthPage = () => {
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const {
    mutate: login,
    isPending: isLoading,
    isSuccess: isLoggedIn,
    data: loginData,
  } = useLoginMutation();

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    login({
      email: data.email,
      password: data.password,
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoggedIn) {
    console.log("Logged in");
    console.log(loginData);
  }

  return (
    <div className="flex items-center justify-center w-full h-[100vh] overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-lg px-4 z-10 relative">
        <div className="w-full rounded-lg border border-border bg-card shadow-lg">
          <div className="px-6 py-8 sm:px-8">
            <div className="lg:flex-auto mb-6">
              <h3 className="text-3xl font-heading font-semibold tracking-tight text-gray-900 dark:text-gray-50">
                <Link href="/" className="flex z-40 font-semibold">
                  Emotion<span className="text-brand-700">Sense</span>
                </Link>
              </h3>

              <p className="mt-4 text-base/7 text-gray-600 dark:text-gray-300">
                Welcome to{" "}
                <span className="font-semibold">
                  Emotion<span className="text-brand-700">Sense</span>
                </span>
                . Real-time emotion detection using AI. Understand your feelings
                and improve emotional awareness—just use your camera.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          type="email"
                          className="w-full bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="text-foreground font-medium">
                          Password
                        </FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="w-full bg-background pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
