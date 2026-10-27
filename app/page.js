"use client";

import { useState } from "react";

const MAX_URL_LENGTH = 2048;

// 서버가 보낸 error.code를 화면에 보여 줄 한국어 문구로 바꿉니다.
const SERVER_ERROR_MESSAGES = {
  MISSING_URL: "URL을 입력해 주세요.",
  URL_TOO_LONG: "URL은 2048자 이하로 입력해 주세요.",
  INVALID_URL: "올바른 URL 형식으로 입력해 주세요.",
  SELF_URL_NOT_ALLOWED: "이 서비스의 주소는 다시 줄일 수 없습니다.",
};

function validateUrl(value) {
  const trimmedUrl = value.trim();

  // TODO 1: 빈 값 검증
  if (!trimmedUrl) {
    return "URL을 입력해 주세요.";
  }

  // TODO 2: 최대 길이 검증
  if (trimmedUrl.length > MAX_URL_LENGTH) {
    return "URL은 2048자 이하로 입력해 주세요.";
  }

  // TODO 3: http:// 또는 https:// 시작 여부 검증
  if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
    return "URL은 http:// 또는 https://로 시작해야 합니다.";
  }

  // TODO 4: 올바른 URL 형식 검증 (예: http://abcde 처럼 도메인이 없는 값은 거부)
  let parsedUrl;

  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return "올바른 URL 형식으로 입력해 주세요.";
  }

  const hostname = parsedUrl.hostname;

  if (!hostname.includes(".") || hostname.startsWith(".") || hostname.endsWith(".")) {
    return "올바른 URL 형식으로 입력해 주세요.";
  }

  // 과제: 지금 접속한 이 서비스의 주소는 다시 줄이지 않습니다. (서버에서도 한 번 더 검사)
  if (typeof window !== "undefined" && hostname === window.location.hostname) {
    return "이 서비스의 주소는 다시 줄일 수 없습니다.";
  }

  return null;
}

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    setOriginalUrl(event.target.value);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setResult(null);

    const validationError = validateUrl(originalUrl);

    if (validationError !== null) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          SERVER_ERROR_MESSAGES[data.error?.code] ||
            data.error?.message ||
            "요청 처리에 실패했습니다."
        );
        return;
      }

      // 201: 새로 만든 short URL, 200: 이미 단축한 URL의 기존 short URL
      setResult({
        shortUrl: data.shortUrl,
        isExisting: response.status === 200,
      });
    } catch {
      setError("서버에 연결할 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="url-card" aria-labelledby="page-title">
        <div className="week-label">CLOUD COMPUTING</div>

        <div className="intro">
          <h1 id="page-title">URL Shortener</h1>
          <p>긴 URL을 입력하면 짧은 URL로 바꿔 드립니다.</p>
        </div>

        <form className="url-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="original-url">줄이고 싶은 URL</label>
          <div className="input-row">
            <input
              id="original-url"
              name="originalUrl"
              type="text"
              inputMode="url"
              placeholder="https://example.com/very-long-url"
              value={originalUrl}
              onChange={handleChange}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "url-error" : undefined}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Shortening..." : "Shorten"}
            </button>
          </div>

          <div className="message-area" aria-live="polite">
            {error && (
              <p id="url-error" className="message message-error" role="alert">
                {error}
              </p>
            )}

            {isLoading && (
              <p className="message message-loading" role="status">
                <span className="spinner" aria-hidden="true" />
                짧은 URL을 만들고 있습니다.
              </p>
            )}

            {result && (
              <div className="message message-success" role="status">
                <span>
                  {result.isExisting
                    ? "이미 줄인 URL입니다. 기존 짧은 URL을 그대로 사용합니다."
                    : "짧은 URL을 만들었습니다."}
                </span>
                <a href={result.shortUrl} target="_blank" rel="noreferrer">
                  {result.shortUrl}
                </a>
              </div>
            )}
          </div>
        </form>

        <aside className="practice-note">
          <span aria-hidden="true">✓</span>
          <p>
            같은 URL은 기존 <code>shortCode</code>를 다시 사용하고, 이 서비스의
            주소는 줄이지 않습니다.
          </p>
        </aside>
      </section>
    </main>
  );
}
