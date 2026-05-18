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

- Supabase Auth 기반 회원가입, 로그인, 로그아웃
- 사용자별 링크 등록, 조회, 수정, 삭제
- 제목, URL, 메모, 태그 기반 검색
- 카테고리, 읽기 상태, 우선순위 필터
- 즐겨찾기 링크 관리
- 대시보드 요약 카드
- 카테고리 관리
- 태그 관리 및 태그 기반 링크 필터링
- 링크 상세 페이지
- URL 기반 라우팅과 브라우저 뒤로가기 지원
- Supabase RLS 기반 사용자 데이터 분리

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
  모든 주요 테이블에 `user_id`를 두고 Supabase RLS로 사용자별 데이터 접근을 제한했습니다.

- **URL 기반 라우팅**  
  대시보드, 링크 목록, 즐겨찾기, 카테고리, 태그, 상세 페이지를 실제 URL로 분리해 새로고침과 뒤로가기가 자연스럽게 동작합니다.

- **카테고리/태그 이름 변경 안정화**  
  이름 변경 시 연결된 링크 데이터도 함께 바뀌어야 하므로 Supabase RPC 함수로 한 번에 처리하도록 구성했습니다.

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
