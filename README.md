# 클라우드 컴퓨팅 · URL Shortener

- 수업: 클라우드 컴퓨팅
- 내용: 1~7주차 실습으로 만든 URL Shortener 최종 과제
- 구성: Next.js, Neon Postgres, Vercel

## 제출 주소

- GitHub Repository URL: https://github.com/CatYulHa/catyulha-url-shortener
- Vercel 배포 URL: https://catyulha-url-shortener.vercel.app

## 과제 추가 기능

- 동일 URL 중복 처리: 저장 전에 `original_url`로 찾아 있으면 기존 shortCode를 `200`으로 반환, 없으면 새로 저장하고 `201`
- 동시 요청: `INSERT ... ON CONFLICT DO NOTHING`으로 충돌 없이 먼저 저장된 shortCode 반환
- 자기 서비스 URL 차단: 단축할 URL의 호스트가 서비스 호스트와 같으면 경로, http/https와 관계없이 `400 SELF_URL_NOT_ALLOWED`
- 서비스 호스트: 요청 주소와 Vercel 환경변수(`VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_URL` 등)에서 모음, 로컬에서는 `localhost`와 `127.0.0.1`을 같은 주소로 봄

## 주차별 구현

| 주차 | 구현 | 파일 |
| --- | --- | --- |
| 2주차 | URL 입력값 검증 | `app/page.js` |
| 3주차 | `POST /api/shorten`, 상태 코드 201, 400, 500 | `app/api/shorten/route.js` |
| 4주차 | Neon Postgres에 URL 저장 | `lib/db.js` |
| 5주차 | `GET /{shortCode}` 307 Redirect, 없으면 404 | `app/[shortCode]/route.js` |
| 6주차 | 클릭 수 기록, `/api/stats`, `/admin` | `lib/stats.js`, `app/api/stats/route.js`, `app/admin/page.js` |
| 7주차 | Basic 인증과 인가로 `/admin`, `/api/stats` 보호 | `lib/auth.js`, `lib/authorization.js`, `proxy.js` |

## 테스트 결과

배포 주소에서 `iscu_url_shortener_check.py`로 점검, 20/20점 (T01~T11 모두 PASS)

- 정상: 단축 `201`, shortCode 6자리, 같은 URL을 다시 요청하면 같은 shortCode
- 오류: URL 누락은 `MISSING_URL`, 잘못된 URL과 `javascript:`는 `INVALID_URL`, 모두 `400`
- Redirect: `307`, `Location`은 원본 URL, `Cache-Control: no-store` / 없는 shortCode는 `404`
- 관리자: 인증 없이 `/admin`, `/api/stats`를 요청하면 `401`
- 자기 서비스 URL: 주소 자체, 경로 포함, http 주소 모두 `400` / 다른 `*.vercel.app` 주소는 `201`
- 화면: 1440px, 375px에서 가로 스크롤과 잘림 없음

## 환경변수

| 이름 | 설명 |
| --- | --- |
| `DATABASE_URL` | Neon Pooled Connection URL |
| `ADMIN_PASSWORD` | 관리자 비밀번호, 사용자 이름은 `admin` |

## 실행

```bash
npm install
npm run db:setup   # urls 테이블 생성, .env.local 필요
npm run dev
```

## 파일 구성

```text
url-shortener/
├── app/
│   ├── page.js                # 메인 화면, URL 입력값 검증
│   ├── admin/page.js          # 관리자 통계 화면
│   ├── [shortCode]/route.js   # Redirect, 404
│   └── api/
│       ├── shorten/route.js   # 단축 API, 중복 처리, 자기 URL 차단
│       └── stats/route.js     # 통계 API, 인증과 인가
├── components/top-bar.js      # 상단 바
├── lib/
│   ├── db.js                  # URL 저장, 조회
│   ├── stats.js               # 클릭 기록, 집계
│   ├── auth.js                # 인증
│   ├── authorization.js       # 인가
│   ├── service-url.js         # 자기 서비스 URL 판별
│   └── not-found-page.js      # 없는 짧은 주소 화면
├── db/schema.sql              # urls 테이블
├── scripts/setup-db.mjs       # 테이블 생성 스크립트
├── public/fonts/              # Pretendard 글꼴
├── proxy.js                   # /admin 보호
└── README.md
```
