import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type PublicEnv = Record<string, string | undefined>;

let browserClient: SupabaseClient | null = null;

export function hasSupabaseConfig(env: PublicEnv = process.env) {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function getSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }

  return browserClient;
}

export function getAuthErrorMessage(message?: string) {
  if (!message) {
    return "인증 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }

  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }

  if (normalizedMessage.includes("user already registered")) {
    return "이미 가입된 이메일입니다. 로그인해 주세요.";
  }

  if (normalizedMessage.includes("password")) {
    return "비밀번호 조건을 확인해 주세요.";
  }

  if (normalizedMessage.includes("email")) {
    return "이메일 주소를 확인해 주세요.";
  }

  return "인증 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}
