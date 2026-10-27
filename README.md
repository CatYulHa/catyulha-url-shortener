# URL Shortener

클라우드 컴퓨팅 1~7주차 실습으로 만든 URL Shortener 최종 과제입니다.
Next.js(App Router) + Neon Postgres + Vercel로 동작합니다.

## 기능

| 주차 | 기능 | 위치 |
| --- | --- | --- |
| 2 | URL 입력값 검증 | `app/page.js` `validateUrl()` |
| 3 | `POST /api/shorten`, HTTP 상태 코드(201/400/500) | `app/api/shorten/route.js` |
| 4 | Neon Postgres에 URL 매핑 저장 | `lib/db.js` `saveUrl()` |
| 5 | `GET /{shortCode}` → 307 Redirect, 없으면 404 | `app/[shortCode]/route.js` |
| 6 | 클릭 수 기록, `/api/stats`, `/admin` | `lib/stats.js`, `app/api/stats/route.js`, `app/admin/page.js` |
| 7 | Basic 인증·인가로 `/admin`, `/api/stats` 보호 | `lib/auth.js`, `lib/authorization.js`, `proxy.js` |
| 과제 | 같은 URL을 다시 요청하면 기존 shortCode 반환(200) | `app/api/shorten/route.js`, `lib/db.js` |
| 과제 | 이 서비스 자신의 URL은 단축 거부(400) | `lib/service-url.js` |

### 동일 URL 중복 처리

1. 저장 전에 `original_url`로 기존 행을 찾습니다. 있으면 그 `shortCode`를 `200`으로 돌려줍니다.
2. 없으면 새로 만들어 저장하고 `201`을 돌려줍니다.
3. 같은 URL 요청이 거의 동시에 들어오면 `INSERT ... ON CONFLICT DO NOTHING`으로 충돌을 피하고, 먼저 저장된 shortCode를 돌려줍니다.

### 자기 서비스 URL 단축 방지

단축하려는 URL의 호스트를 이 서비스의 호스트와 비교합니다. 경로나 `http`/`https`와 관계없이 호스트가 같으면 `400 SELF_URL_NOT_ALLOWED`를 돌려줍니다.

서비스 호스트는 요청 주소(`request.url`, `Host`, `X-Forwarded-Host`)와 Vercel 시스템 환경변수(`VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_BRANCH_URL`, `VERCEL_URL`)에서 모읍니다. 그래서 Production 주소와 배포별 주소를 모두 막습니다. 로컬 개발 중에는 `localhost`와 `127.0.0.1`을 같은 주소로 봅니다.

## 환경변수

`.env.example`을 참고해 `.env.local`을 만들고, Vercel에도 같은 이름으로 등록합니다.

| 이름 | 설명 |
| --- | --- |
| `DATABASE_URL` | Neon Pooled Connection URL |
| `ADMIN_PASSWORD` | `/admin`, `/api/stats` 관리자 비밀번호(사용자 이름은 `admin`) |

## DB 테이블 만들기

`db/schema.sql`을 Neon SQL Editor에서 실행하거나, `.env.local`을 준비한 뒤 다음을 실행합니다.

```bash
npm run db:setup
```

## 실행

```bash
npm install
npm run dev
```

## 점검

```bash
python iscu_url_shortener_check.py --url https://내프로젝트.vercel.app
```

`/api/shorten`에는 Vercel Firewall Rate Limit(POST, IP 기준)을 적용합니다. 채점 스크립트는 1분 안에 POST를 10번 보내므로 허용 횟수를 10보다 넉넉하게 잡습니다.
