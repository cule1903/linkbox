# LinkBox

개발 자료, 공식 문서, 튜토리얼, 트러블슈팅 링크, 학습 노트를 저장하고 정리하는 개인 링크 관리 웹 앱입니다.

## 주요 기능

- Supabase Auth 기반 회원가입, 로그인, 로그아웃
- 사용자별 링크 CRUD
- 태그 입력, 태그 관리, 카테고리 관리
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
4. `supabase/migrations/20260517003000_create_tags.sql`
5. `supabase/migrations/20260517004000_create_rename_rpcs.sql`

생성되는 주요 테이블:

- `links`: 로그인한 사용자의 저장 링크 데이터
- `categories`: 로그인한 사용자의 카테고리 목록
- `tags`: 로그인한 사용자의 태그 목록
- `link_tags`: 링크와 태그의 연결 데이터

확인 위치:

- 사용자 계정: Supabase Dashboard → Authentication → Users
- 링크 데이터: Supabase Dashboard → Table Editor → `links`
- 카테고리 데이터: Supabase Dashboard → Table Editor → `categories`
- 태그 데이터: Supabase Dashboard → Table Editor → `tags`
- 링크-태그 연결 데이터: Supabase Dashboard → Table Editor → `link_tags`

## 검증 명령

```bash
npm test
npm run lint
npm run build
```

## 배포 전 QA 체크리스트

Vercel 배포 전 Project Settings → Environment Variables에 아래 값을 추가합니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Supabase에서 확인할 항목:

- `links`, `categories`, `tags`, `link_tags` 테이블이 생성되어 있는지 확인
- Database → Functions에서 `rename_category`, `rename_tag` 함수가 있는지 확인
- Authentication → Providers → Email의 이메일 인증 설정을 배포 정책에 맞게 조정
- 개발 중 생성한 QA 계정이 남아 있으면 Authentication → Users에서 삭제

수동 QA 시나리오:

1. 새 계정으로 회원가입하고 로그인합니다.
2. 링크를 추가하고 제목, URL, 메모, 카테고리, 태그, 읽기 상태, 우선순위가 저장되는지 확인합니다.
3. 같은 URL을 다시 저장할 때 중복 URL 메시지가 나오는지 확인합니다.
4. 링크 검색, 카테고리 필터, 상태 필터, 우선순위 필터, 태그 필터가 동작하는지 확인합니다.
5. 즐겨찾기 토글과 `/favorites` 페이지가 동작하는지 확인합니다.
6. 카테고리 이름을 변경했을 때 기존 링크의 카테고리도 같이 바뀌는지 확인합니다.
7. 태그 이름을 변경했을 때 기존 링크의 태그도 같이 바뀌는지 확인합니다.
8. 링크 상세 페이지, 브라우저 뒤로가기, 사이드바 이동이 자연스럽게 동작하는지 확인합니다.
9. 로그아웃 후 다른 계정으로 로그인했을 때 이전 계정의 데이터가 보이지 않는지 확인합니다.

## 현재 구현 상태

MVP 핵심 기능, Supabase Auth/Database 연동, 카테고리/태그 관리, URL 기반 라우팅, 태그 정규화, 카테고리/태그 rename RPC가 구현되어 있습니다. 남은 작업은 Vercel 배포와 배포 URL 기준 최종 수동 QA입니다.
