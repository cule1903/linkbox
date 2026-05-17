# LinkBox

개발 자료, 공식 문서, 튜토리얼, 트러블슈팅 링크, 학습 노트를 저장하고 정리하는 개인 링크 관리 웹 애플리케이션입니다.

---

## 프로젝트 개요

**LinkBox**는 개발 공부와 프로젝트 작업 중 자주 참고하는 링크를 한 곳에 저장하고, 카테고리와 태그로 빠르게 다시 찾을 수 있게 만든 링크 관리 플랫폼입니다.

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | LinkBox |
| 개발 기간 | 2026-05-14 ~ 2026-05-18 |
| 유형 | 풀스택 웹 애플리케이션 |
| 배포 환경 | GitHub 및 Vercel |
| 배포 URL | https://linkbox-five.vercel.app/ |
| GitHub | https://github.com/cule1903/linkbox |
| AI | OpenAI Codex |

---

## 기획 배경

개발을 하다 보면 공식 문서, 블로그 글, 강의, 트러블슈팅 기록, 라이브러리 레퍼런스가 여러 곳에 흩어집니다. 브라우저 북마크만으로는 읽기 상태, 우선순위, 태그, 메모까지 함께 관리하기 어렵기 때문에 개발 자료에 특화된 가벼운 링크 저장소가 필요하다고 판단했습니다.

**해결하려는 문제**

- 개발 자료를 흩어진 메모 대신 한 곳에서 관리
- 링크마다 읽기 상태, 우선순위, 메모를 함께 기록
- 카테고리와 태그 기반으로 자료를 빠르게 재탐색
- 즐겨찾기와 대시보드로 중요한 자료를 먼저 확인
- 사용자별 데이터 격리로 개인 링크 보관

---

## 핵심 기능

### 인증 (Auth)

- Supabase Auth 기반 이메일/비밀번호 회원가입
- 로그인, 로그아웃
- 세션 감지 및 로그인 상태 유지
- Supabase 환경 변수 누락 시 사용자 안내
- 한국어 인증 오류 메시지 제공

### 링크 (Links)

- 링크 등록, 조회, 수정, 삭제
- 제목, URL, 메모, 카테고리, 태그, 우선순위, 읽기 상태 저장
- 사용자별 URL 중복 저장 방지
- 즐겨찾기 토글
- 링크 상세 페이지 제공
- 링크 생성/수정/삭제 성공 메시지 제공

### 검색과 필터 (Search & Filter)

- 제목, URL, 메모, 카테고리, 태그 통합 검색
- 카테고리 필터
- 읽기 상태 필터: 읽을 예정 / 읽는 중 / 완료
- 우선순위 필터: 낮음 / 보통 / 높음
- 태그 클릭 기반 필터
- 즐겨찾기 전용 목록
- 최신순, 오래된순, 제목순, 우선순위순 정렬

### 카테고리 (Categories)

- 카테고리 추가, 이름 변경, 삭제
- Supabase `categories` 테이블 기반 관리
- 카테고리별 연결 링크 수 표시
- 연결된 링크가 있는 카테고리 삭제 방지
- 카테고리 이름 변경 시 연결된 링크의 `category` 값도 RPC로 함께 변경

### 태그 (Tags)

- 태그 추가, 이름 변경, 삭제
- Supabase `tags`, `link_tags` 테이블 기반 관리
- 링크 입력 폼에서 저장된 태그 자동완성 후보 제공
- 태그별 연결 링크 수 표시
- 태그 클릭 시 해당 태그로 링크 목록 필터링
- 태그는 `trim + lowercase + dedupe` 기준으로 정규화
- 태그 이름 변경 시 연결된 링크의 `tags` 배열도 RPC로 함께 변경

### 대시보드 (Dashboard)

- 전체 링크 수, 즐겨찾기 수, 읽기 상태 요약
- 최근 저장한 링크 목록
- 요약 카드 클릭 시 필터링된 링크 페이지로 이동
- 카테고리별 링크 수 표시

### 공통 UI/UX

- URL 기반 라우팅과 브라우저 뒤로가기 지원
- 사이드바 기반 앱 레이아웃
- 한국어 UI
- 로딩, 빈 상태, 오류 상태 표시
- Korean IME 입력 중 Enter가 태그를 잘못 분리하지 않도록 처리

---

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| 프론트엔드 | Next.js App Router, React, TypeScript |
| 스타일링 | Tailwind CSS |
| 백엔드 | Supabase Auth, Supabase Database |
| 아이콘/UI | lucide-react, clsx |
| 테스트 | Node.js 내장 test runner |
| 배포 | Vercel |

---

## 도메인(아키텍처)

### 핵심 원칙

1. **멀티 유저 구조 우선** — 처음부터 `user_id` 기반 데이터 소유권을 반영했습니다.
2. **Supabase RLS 1차 보안** — 사용자는 자신의 링크, 카테고리, 태그, 링크-태그 관계만 접근할 수 있습니다.
3. **URL 기반 화면 전환** — 대시보드, 링크 목록, 즐겨찾기, 카테고리, 태그, 상세 페이지를 실제 URL로 분리했습니다.
4. **MVP 친화적 데이터 모델** — UI 검색과 필터 속도를 위해 `links.tags` 배열을 유지하면서, 태그 관리는 `tags`, `link_tags` 정규화 테이블로 확장했습니다.
5. **DB 트랜잭션으로 중요한 동기화 처리** — 카테고리/태그 이름 변경은 Supabase RPC에서 관련 링크까지 함께 갱신합니다.

### 라우트 구조

```txt
src/app/
├── page.tsx                 # 기본 진입, 대시보드 경험
├── dashboard/page.tsx       # 대시보드
├── links/
│   ├── page.tsx             # 링크 목록, 검색, 필터
│   └── [id]/page.tsx        # 링크 상세
├── favorites/page.tsx       # 즐겨찾기 목록
├── categories/page.tsx      # 카테고리 관리
└── tags/page.tsx            # 태그 관리
```

### 주요 모듈

| 파일 | 역할 |
| --- | --- |
| `src/components/app/linkbox-app.tsx` | 인증 상태, 데이터 로딩, 주요 화면 조합 |
| `src/lib/auth.ts` | Supabase 설정 확인, 브라우저 client 생성, 인증 오류 메시지 |
| `src/lib/links.ts` | 링크 CRUD, 태그 정규화, 링크 row/draft 매핑 |
| `src/lib/categories.ts` | 카테고리 CRUD, 카테고리 rename RPC |
| `src/lib/tags.ts` | 태그 CRUD, 링크-태그 동기화, 태그 rename RPC |
| `src/lib/routes.ts` | 필터 URL 생성, 현재 라우트 매핑 |
| `src/lib/link-utils.ts` | 검색, 필터, 정렬, 상태/우선순위 표시 |

---

## DB 설계

### `links`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid PK | 링크 ID |
| user_id | uuid FK | `auth.users.id`, 소유자 |
| title | text | 링크 제목 |
| url | text | 저장 URL |
| description | text | 메모 |
| category | text | 선택한 카테고리 이름 |
| tags | text[] | UI 검색/필터 호환용 태그 배열 |
| priority | text | low / medium / high |
| status | text | unread / reading / completed |
| is_favorite | boolean | 즐겨찾기 여부 |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

> 제약: `UNIQUE(user_id, url)` — 사용자별 중복 URL 저장 방지

### `categories`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid PK | 카테고리 ID |
| user_id | uuid FK | 소유자 |
| name | text | 카테고리 이름 |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

> 제약: `UNIQUE(user_id, name)` — 사용자별 카테고리 이름 중복 방지

### `tags`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid PK | 태그 ID |
| user_id | uuid FK | 소유자 |
| name | text | 정규화된 태그 이름 |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

> 제약: `UNIQUE(user_id, name)` — 사용자별 태그 이름 중복 방지

### `link_tags`

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| link_id | uuid FK | 연결된 링크 |
| tag_id | uuid FK | 연결된 태그 |
| user_id | uuid FK | 소유자 |
| created_at | timestamptz | 생성일 |

> 제약: `PRIMARY KEY(link_id, tag_id)`

### RPC 함수

| 함수 | 역할 |
| --- | --- |
| `rename_category(p_category_id, p_name)` | 카테고리 이름과 연결된 `links.category` 값을 한 번에 변경 |
| `rename_tag(p_tag_id, p_name)` | 태그 이름과 연결된 `links.tags` 배열 값을 한 번에 변경 |

### ERD (텍스트)

```txt
auth.users
    │
    ├──[1:N]── links
    │
    ├──[1:N]── categories
    │
    ├──[1:N]── tags
    │             │
    │             └──[1:N]── link_tags ──[N:1]── links
    │
    └──[1:N]── link_tags
```

---

## 화면 구성

| 경로 | 설명 | 접근 |
| --- | --- | --- |
| `/` | 기본 진입, 대시보드 화면 | 로그인 필수 |
| `/dashboard` | 요약 카드, 최근 링크, 카테고리 현황 | 로그인 필수 |
| `/links` | 전체 링크 목록, 검색, 필터, 정렬 | 로그인 필수 |
| `/links?status=reading` | 읽는 중 링크 필터 | 로그인 필수 |
| `/links?tag=react` | 태그 기반 링크 필터 | 로그인 필수 |
| `/links/[id]` | 링크 상세 | 로그인 필수 |
| `/favorites` | 즐겨찾기 링크 목록 | 로그인 필수 |
| `/categories` | 카테고리 관리 | 로그인 필수 |
| `/tags` | 태그 관리 | 로그인 필수 |

---

## 설계 결정 기록 (Design Decision Log)

### 1. 개발 자료 관리에 특화된 링크 저장소로 범위 한정

**배경:**  
일반 북마크 서비스처럼 모든 링크를 다루기보다, 개발자가 자주 저장하는 공식 문서, 튜토리얼, 트러블슈팅 자료에 초점을 맞췄습니다.

**결정 이유:**  
읽기 상태, 우선순위, 태그, 메모는 개발 학습 자료 관리에 특히 유용합니다. 범위를 명확히 좁혀 MVP 기능의 완성도를 높였습니다.

### 2. Supabase RLS 기반 멀티 유저 구조 선택

**배경:**  
처음부터 개인별 링크 저장소로 동작해야 했기 때문에 사용자 데이터 격리가 중요했습니다.

**결정 이유:**  
Supabase Auth와 RLS를 사용하면 별도 백엔드 서버 없이도 사용자가 자신의 데이터만 읽고 쓸 수 있습니다. 프론트 조건부 렌더링은 UX 보조로 두고, 실제 보안은 DB 정책에서 강제했습니다.

### 3. 태그는 정규화 테이블과 `links.tags` 배열을 함께 유지

**배경:**  
태그 관리를 별도 테이블로 분리하면 확장성이 좋아지지만, 현재 UI 검색과 필터는 `links.tags` 배열을 바로 사용하는 구조였습니다.

**결정 이유:**  
MVP에서는 기존 UI의 단순함을 유지하면서도 태그 관리 화면과 링크-태그 관계 테이블을 추가하는 절충안을 선택했습니다. 태그 값은 `trim + lowercase + dedupe`로 정규화해 두 저장 방식이 어긋나지 않도록 했습니다.

### 4. 카테고리 이름 변경과 태그 이름 변경은 RPC로 처리

**배경:**  
카테고리나 태그 이름을 바꾸면 연결된 링크 데이터도 함께 바뀌어야 합니다.

**결정 이유:**  
클라이언트에서 여러 update를 순서대로 실행하면 중간 실패 시 데이터가 불일치할 수 있습니다. `rename_category`, `rename_tag` RPC 함수로 DB 안에서 한 번에 처리해 안정성을 높였습니다.

### 5. URL 기반 라우팅으로 브라우저 탐색성 개선

**배경:**  
초기 Figma 스타일 UI는 내부 state로 화면을 바꾸는 구조에 가까웠습니다.

**결정 이유:**  
실제 앱에서는 뒤로가기, 새로고침, 특정 필터 URL 공유가 자연스러워야 합니다. `/links?status=reading`, `/links?tag=react`처럼 필터 상태도 URL에 반영했습니다.

### 6. 한국어 UI와 Korean IME 입력 보정

**배경:**  
태그 입력에서 한글 조합 중 Enter를 누르면 `리액트`가 `리액`, `트`처럼 잘못 나뉠 수 있었습니다.

**결정 이유:**  
한국어 사용성을 위해 `isComposing` 상태를 확인해 조합 중 Enter는 태그 확정으로 처리하지 않도록 했습니다.

---

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

---

## 검증 명령

```bash
npm test
npm run lint
npm run build
```

현재 검증 상태:

- Node test runner 기반 단위 테스트 통과
- ESLint 통과
- Next.js production build 통과
- 원격 Supabase CRUD 및 rename RPC QA 통과

---

## 배포 정보

- 배포 URL: https://linkbox-five.vercel.app/
- 배포 플랫폼: Vercel
- 소스 저장소: https://github.com/cule1903/linkbox
- 배포 시 필요한 환경 변수:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 스크린샷

추후 추가 예정:

- 로그인/회원가입 화면
- 대시보드
- 링크 목록과 필터
- 링크 추가/수정 폼
- 카테고리/태그 관리 화면

---

## 현재 구현 상태

MVP 핵심 기능, Supabase Auth, 링크 CRUD, 카테고리/태그 관리, URL 기반 라우팅, 태그 정규화, 카테고리/태그 rename RPC, Vercel 배포까지 완료되어 있습니다. 남은 작업은 배포 URL 기준 최종 수동 QA와 스크린샷 보강입니다.
