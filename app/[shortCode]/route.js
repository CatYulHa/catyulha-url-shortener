import { findUrlByShortCode } from "../../lib/db";
import { recordClick } from "../../lib/stats";
import { notFoundPage } from "../../lib/not-found-page";

export const dynamic = "force-dynamic";

// shortCode는 6자리 영문·숫자입니다. 형식이 다르면 DB를 조회하지 않습니다.
const SHORT_CODE_PATTERN = /^[A-Za-z0-9]{6}$/;

export async function GET(request, { params }) {
  const { shortCode } = await params;

  const originalUrl = SHORT_CODE_PATTERN.test(shortCode)
    ? await findUrlByShortCode(shortCode)
    : null;

  // 5주차: 원본 URL이 없으면 Redirect하지 않고 404를 반환합니다.
  // 6주차: 운영자가 확인할 수 있도록 로그를 남깁니다.
  if (!originalUrl) {
    console.warn("Short URL not found", { shortCode });

    return new Response(notFoundPage(), {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  // 6주차: 원본 URL을 찾은 경우에만 클릭을 기록합니다.
  // 기록에 실패해도 Redirect는 계속 진행합니다.
  try {
    await recordClick(shortCode);
  } catch (error) {
    console.error("Failed to record click", { shortCode });
  }

  return new Response(null, {
    status: 307,
    headers: {
      Location: originalUrl,
      "Cache-Control": "no-store",
    },
  });
}
