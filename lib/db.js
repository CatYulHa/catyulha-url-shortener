import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// 4주차: shortCode와 originalUrl을 저장합니다.
// 같은 short_code나 original_url이 이미 있으면 저장하지 않고 false를 반환합니다.
// (거의 동시에 같은 URL 요청이 두 번 들어와도 500 오류가 나지 않게 합니다.)
export async function saveUrl(shortCode, originalUrl) {
  const rows = await sql`
    INSERT INTO urls (short_code, original_url)
    VALUES (${shortCode}, ${originalUrl})
    ON CONFLICT DO NOTHING
    RETURNING short_code
  `;

  return rows.length > 0;
}

// 5주차: shortCode로 원본 URL을 조회합니다.
export async function findUrlByShortCode(shortCode) {
  const rows = await sql`
    SELECT original_url
    FROM urls
    WHERE short_code = ${shortCode}
    LIMIT 1
  `;

  return rows[0]?.original_url ?? null;
}

// 과제: 이미 단축한 원본 URL이면 저장된 shortCode를 반환합니다.
export async function findShortCodeByOriginalUrl(originalUrl) {
  const rows = await sql`
    SELECT short_code
    FROM urls
    WHERE original_url = ${originalUrl}
    LIMIT 1
  `;

  return rows[0]?.short_code ?? null;
}
