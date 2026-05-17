# LinkBox

개발 자료, 공식 문서, 튜토리얼, 트러블슈팅 링크, 학습 노트를 저장하고 정리하는 개인 링크 관리 웹 앱입니다.

## 주요 기능

- Supabase Auth 기반 회원가입, 로그인, 로그아웃
- 사용자별 링크 CRUD
- 태그 입력과 카테고리 관리
- 제목, URL, 메모, 태그 검색
- 카테고리, 읽기 상태, 우선순위 필터
- 즐겨찾기
- 읽기 상태: 읽을 예정, 읽는 중, 완료
- 우선순위: 낮음, 보통, 높음
- 대시보드 요약
- URL 기반 페이지 이동과 브라우저 뒤로가기
- 사용자별 URL 중복 저장 방지
- Supabase RLS 기반 사용자 데이터 격리

## 기술 스택

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Database
- Vercel

## 로컬 실행

환경 변수 파일을 만들고 Supabase 프로젝트 값을 입력합니다.

```bash
cp .env.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

의존성을 설치하고 개발 서버를 실행합니다.

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## Supabase 설정

Supabase SQL Editor에서 아래 마이그레이션을 순서대로 실행합니다.

1. `supabase/migrations/20260517000000_create_links.sql`
2. `supabase/migrations/20260517001000_grant_links_permissions.sql`
3. `supabase/migrations/20260517002000_create_categories.sql`

생성되는 주요 테이블:

- `links`: 로그인한 사용자의 저장 링크 데이터
- `categories`: 로그인한 사용자의 카테고리 목록

확인 위치:

- 사용자 계정: Supabase Dashboard → Authentication → Users
- 링크 데이터: Supabase Dashboard → Table Editor → `links`
- 카테고리 데이터: Supabase Dashboard → Table Editor → `categories`

## 검증 명령

```bash
npm test
npm run lint
npm run build
```

## 현재 구현 상태

MVP 핵심 기능과 카테고리 관리, URL 기반 라우팅이 구현되어 있습니다. 남은 작업은 배포 설정, 최종 QA, 제출용 설명 보강입니다.
