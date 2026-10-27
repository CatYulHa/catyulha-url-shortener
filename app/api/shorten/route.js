import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import {
  findShortCodeByOriginalUrl,
  saveUrl,
} from "../../../lib/db";
import { isServiceUrl } from "../../../lib/service-url";

export const runtime = "nodejs";

const MAX_URL_LENGTH = 2048;

const ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/*
 * createShortCode()
 *
 * 원본 URL을 입력받아 SHA-256 해시를 생성하고,
 * 그 값을 이용해 6자리 short code를 만듭니다.
 */
function createShortCode(originalUrl, length = 6) {
  const hex = createHash("sha256")
    .update(originalUrl)
    .digest("hex");

  let code = "";

  for (let i = 0; i < length; i++) {
    const value = parseInt(
      hex.slice(i * 2, i * 2 + 2),
      16
    );

    code += ALPHABET[value % ALPHABET.length];
  }

  return code;
}

function errorResponse(code, message, status = 400) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

function shortUrlResponse(baseUrl, shortCode, originalUrl, status) {
  return NextResponse.json(
    {
      shortCode,
      shortUrl: `${baseUrl}/${shortCode}`,
      originalUrl,
    },
    { status }
  );
}

/*
 * POST()
 *
 * 클라이언트가 보낸 URL을 검사하고,
 * 문제가 없으면 short URL을 생성하여 반환합니다.
 */
export async function POST(request) {
  try {
    /*
     * 1. 요청 body 읽기
     */
    const body = await request.json().catch(() => null);

    const raw = body?.originalUrl;
    const originalUrl =
      typeof raw === "string" ? raw.trim() : "";

    /*
     * 2. URL이 입력되지 않은 경우 → 400
     */
    if (!originalUrl) {
      return errorResponse(
        "MISSING_URL",
        "Original URL is required."
      );
    }

    /*
     * 3. URL이 너무 긴 경우 → 400
     */
    if (originalUrl.length > MAX_URL_LENGTH) {
      return errorResponse(
        "URL_TOO_LONG",
        `URL must be ${MAX_URL_LENGTH} characters or fewer.`
      );
    }

    /*
     * 4. URL 형식 검사 → 형식이 틀리면 400
     */
    let parsedUrl;

    try {
      parsedUrl = new URL(originalUrl);
    } catch {
      return errorResponse(
        "INVALID_URL",
        "URL must start with http:// or https://."
      );
    }

    /*
     * 5. 프로토콜 검사 (http, https만 허용) → 400
     */
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return errorResponse(
        "INVALID_URL",
        "URL must start with http:// or https://."
      );
    }

    /*
     * 6. 자기 서비스 URL 단축 방지 → 400
     *
     * 이 서비스의 주소를 다시 줄이면 짧은 URL이 자기 자신을 가리키게 됩니다.
     * 경로나 http/https와 관계없이 호스트가 같으면 거부합니다.
     */
    if (isServiceUrl(parsedUrl, request)) {
      return errorResponse(
        "SELF_URL_NOT_ALLOWED",
        "URLs of this service cannot be shortened."
      );
    }

    const baseUrl = new URL(request.url).origin;

    /*
     * 7. 동일 URL 중복 처리 → 200
     *
     * 이미 단축한 URL이면 새로 저장하지 않고 기존 shortCode를 반환합니다.
     */
    const existingShortCode =
      await findShortCodeByOriginalUrl(originalUrl);

    if (existingShortCode) {
      return shortUrlResponse(
        baseUrl,
        existingShortCode,
        originalUrl,
        200
      );
    }

    /*
     * 8. Short URL 생성 후 DB 저장 → 201
     */
    const shortCode = createShortCode(originalUrl);
    const created = await saveUrl(shortCode, originalUrl);

    if (!created) {
      // 같은 URL 요청이 거의 동시에 들어와 다른 요청이 먼저 저장한 경우입니다.
      const savedShortCode =
        await findShortCodeByOriginalUrl(originalUrl);

      if (!savedShortCode) {
        // 다른 URL이 같은 shortCode를 이미 쓰고 있는 해시 충돌은 이번 과제 범위 밖입니다.
        throw new Error("Short code collision");
      }

      return shortUrlResponse(
        baseUrl,
        savedShortCode,
        originalUrl,
        200
      );
    }

    return shortUrlResponse(baseUrl, shortCode, originalUrl, 201);
  } catch (error) {
    /*
     * 9. 서버 내부 오류 → 500
     */
    console.error("Failed to create short URL", error);

    return errorResponse(
      "INTERNAL_ERROR",
      "Failed to create short URL.",
      500
    );
  }
}
