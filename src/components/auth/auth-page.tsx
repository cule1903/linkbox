"use client";

import { FormEvent, useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthPageProps = {
  onLogin: (email: string) => void;
};

export function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onLogin(email);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Bookmark className="h-6 w-6 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-semibold">LinkBox</h1>
          <p className="text-muted-foreground">
            Your personal link organizer for learning resources
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          <button
            className={`rounded-md px-3 py-2 text-sm ${
              mode === "login" ? "bg-white shadow-sm" : "text-slate-600"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`rounded-md px-3 py-2 text-sm ${
              mode === "signup" ? "bg-white shadow-sm" : "text-slate-600"
            }`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "login" ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Enter your credentials to access your links"
                : "Get started with LinkBox in seconds"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Name</span>
                  <Input
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    required
                    type="text"
                    value={name}
                  />
                </label>
              )}
              <label className="block space-y-2">
                <span className="text-sm font-medium">Email</span>
                <Input
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium">Password</span>
                <Input
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="password"
                  required
                  type="password"
                  value={password}
                />
              </label>
              <Button className="w-full" type="submit">
                {mode === "login" ? "Login" : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
