"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "./ui/modal";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAdminRegisterMutation } from "@/lib/api-services/auth-api";

// Updated validator to match API expectations
const REGISTER_USER_VALIDATOR = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().default("employee"),
});

type RegisterUserForm = z.infer<typeof REGISTER_USER_VALIDATOR>;

interface RegisterUserModalProps {
  children: React.ReactNode;
}

export const RegisterUserModal = ({ children }: RegisterUserModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    mutate: registerUser,
    isError,
    error,
    isSuccess
  } = useAdminRegisterMutation();

  const form = useForm<RegisterUserForm>({
    resolver: zodResolver(REGISTER_USER_VALIDATOR),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "employee",
    },
  });

  // Dummy input to block autofill
  // Added at top of form to trick browsers
  const dummyInput = (
    <input
      type="text"
      name="prevent_autofill"
      autoComplete="off"
      className="hidden"
      tabIndex={-1}
    />
  );

  const onSubmit = async (data: RegisterUserForm) => {
    setIsSubmitting(true);
    
    // Use the exact payload structure needed by the API
    const payload = {
      email: data.email,
      name: data.name,
      role: data.role,
      password: data.password
    };
        
    registerUser(payload);
  };

  // Close modal and reset form when registration is successful
  useEffect(() => {
    if (isSuccess) {
      setIsSubmitting(false);
      form.reset();
      setIsOpen(false);
    }
  }, [isSuccess, form]);

  // Reset isSubmitting state when there's an error
  useEffect(() => {
    if (isError) {
      setIsSubmitting(false);
    }
  }, [isError]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
        {children}
      </div>

      <Modal
        showModal={isOpen}
        setShowModal={setIsOpen}
        className="max-w-md p-6"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            autoComplete="off"
            noValidate
          >
            <h2 className="text-lg font-medium">Register New User</h2>

            {dummyInput}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Jane Doe"
                      autoComplete="off"
                      name="register_name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="jane@example.com"
                      autoComplete="off"
                      name="register_email"
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        name="register_password" // custom name to avoid autofill
                        className="pr-10"
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

            {/* Role field as a hidden input */}
            <input type="hidden" {...form.register("role")} value="employee" />

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
            </div>
          </form>
        </Form>
      </Modal>
    </>
  );
};
