// urls 테이블을 만들거나, 예전 테이블에 빠진 컬럼과 제약을 채웁니다.
// 실행: npm run db:setup  (.env.local의 DATABASE_URL 사용)
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL이 없습니다. .env.local을 확인하세요.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS urls (
    short_code VARCHAR(6) PRIMARY KEY,
    original_url VARCHAR(2048) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    click_count BIGINT NOT NULL DEFAULT 0,
    last_clicked_at TIMESTAMPTZ
  )
`;

// 4주차 README대로 만든 테이블이라면 6주차 컬럼과 original_url 중복 방지가 없을 수 있습니다.
await sql`
  ALTER TABLE urls
  ADD COLUMN IF NOT EXISTS click_count BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMPTZ
`;
await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS urls_original_url_key
  ON urls (original_url)
`;

const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM urls`;
console.log(`urls 테이블 준비 완료 (저장된 URL ${count}개)`);
