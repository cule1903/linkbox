import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkBox",
  description: "개발 링크와 학습 노트를 저장하고 정리하는 개인 링크 관리 도구입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
