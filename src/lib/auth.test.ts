import { existsSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
import {
  getAuthErrorMessage,
  hasSupabaseConfig,
} from "./auth.ts";

test("hasSupabaseConfig requires both public Supabase values", () => {
  assert.equal(
    hasSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    }),
    true,
  );
  assert.equal(
    hasSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    }),
    false,
  );
  assert.equal(hasSupabaseConfig({}), false);
});

test("getAuthErrorMessage maps common Supabase auth errors to Korean copy", () => {
  assert.equal(
    getAuthErrorMessage("Invalid login credentials"),
    "이메일 또는 비밀번호가 올바르지 않습니다.",
  );
  assert.equal(
    getAuthErrorMessage("User already registered"),
    "이미 가입된 이메일입니다. 로그인해 주세요.",
  );
  assert.equal(
    getAuthErrorMessage("Some unknown remote error"),
    "인증 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  );
});

test("does not keep a legacy eager Supabase client module", () => {
  assert.equal(existsSync(new URL("./supabase.ts", import.meta.url)), false);
});
