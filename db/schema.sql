-- URL Shortener 테이블 (4주차 + 6주차 컬럼)
-- Neon SQL Editor에서 실행하거나 `npm run db:setup`으로 만들 수 있습니다.

CREATE TABLE IF NOT EXISTS urls (
  short_code VARCHAR(6) PRIMARY KEY,
  original_url VARCHAR(2048) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  click_count BIGINT NOT NULL DEFAULT 0,
  last_clicked_at TIMESTAMPTZ
);
