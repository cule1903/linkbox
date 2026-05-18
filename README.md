# LinkBox

개발 자료, 공식 문서, 튜토리얼, 트러블슈팅 링크를 저장하고 태그와 카테고리로 정리하는 개인 링크 관리 웹 애플리케이션입니다.

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | LinkBox |
| 유형 | 풀스택 웹 애플리케이션 |
| 배포 환경 | Vercel |
| 배포 URL | https://linkbox-five.vercel.app/ |
| GitHub | https://github.com/cule1903/linkbox |

---

## 소개

개발 공부나 프로젝트를 하다 보면 참고할 링크가 계속 쌓입니다. 브라우저 북마크만으로는 어떤 자료를 읽었는지, 어떤 자료가 중요한지, 어떤 태그로 묶어야 하는지 관리하기 어렵습니다.

LinkBox는 이런 개발 자료를 한 곳에 저장하고, 읽기 상태·우선순위·카테고리·태그·메모를 함께 관리할 수 있도록 만든 링크 관리 앱입니다.

---

## 주요 기능

### 인증

- Supabase Auth 기반 이메일 회원가입, 로그인, 로그아웃
- 로그인 세션을 확인해 인증된 사용자만 앱 화면에 접근
- Supabase 환경 변수가 없을 때 설정 안내 메시지 표시
- 인증 실패 상황을 한국어 메시지로 변환

### 링크 관리

- 개발 자료 링크를 제목, URL, 메모와 함께 저장
- 카테고리, 태그, 읽기 상태, 우선순위를 함께 기록
- 링크 수정, 삭제, 상세 보기 지원
- 사용자별 동일 URL 중복 저장 방지
- 즐겨찾기 토글로 중요한 링크를 따로 모아보기

### 검색, 필터, 정렬

- 제목, URL, 메모, 태그를 대상으로 통합 검색
- 카테고리, 읽기 상태, 우선순위 기준 필터링
- 즐겨찾기 전용 목록 제공
- 최신순, 오래된순, 제목순, 우선순위순 정렬
- 태그를 클릭하면 해당 태그가 적용된 링크 목록으로 이동

### 카테고리와 태그

- 카테고리와 태그를 별도 관리 화면에서 추가, 수정, 삭제
- 각 카테고리/태그에 연결된 링크 수 표시
- 태그 입력 시 저장된 태그를 datalist로 제안
- 태그는 `trim + lowercase + dedupe` 기준으로 정규화
- 카테고리/태그 이름 변경 시 연결된 링크 데이터도 Supabase RPC로 함께 갱신

### 대시보드와 라우팅

- 전체 링크 수, 즐겨찾기 수, 읽기 상태 요약 표시
- 최근 저장한 링크와 카테고리별 현황 확인
- 요약 카드를 클릭하면 필터가 적용된 링크 목록으로 이동
- `/links?status=reading`, `/links?tag=react`처럼 필터 상태를 URL로 표현
- 브라우저 새로고침과 뒤로가기 지원

---

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | Next.js App Router, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Supabase Auth, Supabase Database |
| UI | lucide-react, clsx |
| Test | Node.js test runner |
| Deploy | Vercel |

---

## 화면 구성

| 경로 | 설명 |
| --- | --- |
| `/` | 기본 진입 화면 |
| `/dashboard` | 전체 링크 요약, 최근 링크, 카테고리 현황 |
| `/links` | 링크 목록, 검색, 필터, 정렬 |
| `/links/[id]` | 링크 상세 |
| `/favorites` | 즐겨찾기 링크 목록 |
| `/categories` | 카테고리 관리 |
| `/tags` | 태그 관리 |

---

## 프로젝트 구조

```txt
src/
├── app/                         # Next.js App Router 페이지
│   ├── page.tsx                 # 기본 진입 화면
│   ├── dashboard/page.tsx       # 대시보드
│   ├── links/page.tsx           # 링크 목록
│   ├── links/[id]/page.tsx      # 링크 상세
│   ├── favorites/page.tsx       # 즐겨찾기
│   ├── categories/page.tsx      # 카테고리 관리
│   └── tags/page.tsx            # 태그 관리
├── components/
│   ├── app/linkbox-app.tsx      # 앱 상태와 주요 화면 조합
│   ├── auth/                    # 로그인/회원가입 UI
│   ├── dashboard/               # 대시보드 UI
│   ├── links/                   # 링크 카드, 폼, 목록, 상세
│   ├── categories/              # 카테고리 관리 UI
│   ├── tags/                    # 태그 관리 UI
│   ├── layout/                  # 사이드바 레이아웃
│   └── ui/                      # 공통 UI 컴포넌트
├── lib/
│   ├── auth.ts                  # Supabase Auth client와 에러 메시지
│   ├── links.ts                 # 링크 CRUD와 태그 정규화
│   ├── categories.ts            # 카테고리 CRUD와 rename RPC
│   ├── tags.ts                  # 태그 CRUD와 link_tags 동기화
│   ├── link-utils.ts            # 검색, 필터, 정렬 유틸
│   └── routes.ts                # URL 생성과 라우트 매핑
└── types/                       # Link, Category, Tag 타입

supabase/
└── migrations/                  # 테이블, RLS, RPC SQL
```

---

## 데이터 구조

### `links`

링크의 핵심 정보를 저장합니다.

- 제목, URL, 메모
- 카테고리
- 태그 배열
- 읽기 상태: `unread`, `reading`, `completed`
- 우선순위: `low`, `medium`, `high`
- 즐겨찾기 여부
- 사용자별 중복 URL 방지

### `categories`

사용자별 카테고리 목록을 저장합니다.

- 카테고리 추가, 수정, 삭제
- 사용자별 카테고리 이름 중복 방지

### `tags`, `link_tags`

태그 목록과 링크-태그 관계를 관리합니다.

- 태그 추가, 수정, 삭제
- 링크에 연결된 태그 동기화
- 태그 이름은 `trim + lowercase + dedupe` 기준으로 정규화

---

## 구현 포인트

- **멀티 유저 구조**  
  모든 주요 테이블에 `user_id`를 두고 Supabase RLS로 사용자별 데이터 접근을 제한했습니다. 프론트에서 화면을 숨기는 것과 별개로, 데이터 접근 권한은 DB 정책에서 한 번 더 강제합니다.

- **URL 기반 라우팅**  
  대시보드, 링크 목록, 즐겨찾기, 카테고리, 태그, 상세 페이지를 실제 URL로 분리했습니다. 필터도 query string으로 표현해 새로고침과 뒤로가기가 자연스럽게 동작합니다.

- **카테고리/태그 이름 변경 안정화**  
  이름 변경 시 연결된 링크 데이터도 함께 바뀌어야 하므로 Supabase RPC 함수로 한 번에 처리하도록 구성했습니다. 클라이언트에서 여러 update를 나눠 호출할 때 생길 수 있는 데이터 불일치를 줄였습니다.

- **한국어 입력 UX 보정**  
  태그 입력에서 한글 조합 중 Enter가 태그를 잘못 분리하지 않도록 IME composition 상태를 확인합니다.

---

## 로컬 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에 Supabase 프로젝트 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

---

## 검증

```bash
npm test
npm run lint
npm run build
```

현재 확인된 상태:

- 단위 테스트 통과
- ESLint 통과
- production build 통과
- 원격 Supabase CRUD 및 rename RPC 동작 확인

---

## 현재 상태

MVP 핵심 기능은 구현되어 있습니다. 링크 CRUD, 검색/필터, 즐겨찾기, 카테고리/태그 관리, Supabase Auth, RLS 기반 사용자 데이터 분리, URL 기반 라우팅까지 동작합니다.
