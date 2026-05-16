export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto flex max-w-5xl flex-col gap-8">
        <div>
          <p className="text-sm font-medium text-blue-700">LinkBox</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            개인 링크 저장소 프로젝트 시작
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Next.js, TypeScript, Tailwind CSS, Supabase를 기반으로 개발 자료와
            참고 링크를 저장하고 정리하는 웹 애플리케이션입니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["기획", "링크 저장, 검색, 필터, 즐겨찾기 중심 MVP"],
            ["개발", "Figma UI 기반 화면 구현과 Supabase 연동"],
            ["배포", "GitHub 저장소 연결 후 Vercel 배포"],
          ].map(([title, description]) => (
            <div
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={title}
            >
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
