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
            개발 자료와 학습 링크를 정리하는 개인 링크 저장소
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          <button
            className={`rounded-md px-3 py-2 text-sm ${
              mode === "login" ? "bg-white shadow-sm" : "text-slate-600"
            }`}
            onClick={() => setMode("login")}
          >
            로그인
          </button>
          <button
            className={`rounded-md px-3 py-2 text-sm ${
              mode === "signup" ? "bg-white shadow-sm" : "text-slate-600"
            }`}
            onClick={() => setMode("signup")}
          >
            회원가입
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "login" ? "다시 오신 것을 환영합니다" : "계정 만들기"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "이메일과 비밀번호로 저장한 링크에 접근하세요"
                : "LinkBox를 시작하기 위한 계정을 만들어주세요"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <label className="block space-y-2">
                  <span className="text-sm font-medium">이름</span>
                  <Input
                    onChange={(event) => setName(event.target.value)}
                    placeholder="이름을 입력하세요"
                    required
                    type="text"
                    value={name}
                  />
                </label>
              )}
              <label className="block space-y-2">
                <span className="text-sm font-medium">이메일</span>
                <Input
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium">비밀번호</span>
                <Input
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호"
                  required
                  type="password"
                  value={password}
                />
              </label>
              <Button className="w-full" type="submit">
                {mode === "login" ? "로그인" : "계정 만들기"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
