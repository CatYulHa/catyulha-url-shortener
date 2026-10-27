"use client";

import { useRef, useState } from "react";
import {
  ArrowsCounterClockwise,
  Check,
  CheckCircle,
  Copy,
  Info,
  Prohibit,
  WarningCircle,
} from "@phosphor-icons/react";

const MAX_URL_LENGTH = 2048;

// 서버가 보낸 error.code를 화면 문구로 바꾼다
const SERVER_ERROR_MESSAGES = {
  MISSING_URL: "URL을 입력해 주세요.",
  URL_TOO_LONG: "URL은 2048자 이하로 입력해 주세요.",
  INVALID_URL: "올바른 URL 형식으로 입력해 주세요.",
  SELF_URL_NOT_ALLOWED: "이 서비스의 주소는 줄일 수 없습니다.",
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

  // TODO 4: 올바른 URL 형식 검증 (http://abcde 처럼 도메인이 없는 값은 거부)
  let parsedUrl;

  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return "올바른 URL 형식으로 입력해 주세요.";
  }

  const hostname = parsedUrl.hostname;

  if (
    !hostname.includes(".") ||
    hostname.startsWith(".") ||
    hostname.endsWith(".")
  ) {
    return "올바른 URL 형식으로 입력해 주세요.";
  }

  // 지금 접속한 이 서비스의 주소는 줄이지 않는다 (서버에서도 다시 검사)
  if (typeof window !== "undefined" && hostname === window.location.hostname) {
    return "이 서비스의 주소는 줄일 수 없습니다.";
  }

  return null;
}

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copyState, setCopyState] = useState("idle");
  const inputRef = useRef(null);

  function handleChange(event) {
    setOriginalUrl(event.target.value);

    if (error) {
      setError("");
    }
  }

  function showError(message) {
    setError(message);
    inputRef.current?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setResult(null);
    setCopyState("idle");

    const validationError = validateUrl(originalUrl);

    if (validationError !== null) {
      showError(validationError);
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
        showError(
          SERVER_ERROR_MESSAGES[data.error?.code] ||
            "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
        return;
      }

      // 201: 새로 만든 주소, 200: 이미 줄인 URL이라 기존 주소를 돌려받음
      setResult({
        shortUrl: data.shortUrl,
        originalUrl: data.originalUrl,
        isExisting: response.status === 200,
      });
    } catch {
      showError("서버에 연결할 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <main id="main" className="content content-narrow">
      <div className="page-heading">
        <div>
          <h1>URL 줄이기</h1>
          <p>긴 URL을 6자리 짧은 주소로 변환</p>
        </div>
      </div>

      <p className="sr-only" role="status">
        {copyState === "copied"
          ? "짧은 주소를 복사했습니다."
          : result
            ? result.isExisting
              ? "이미 만든 짧은 주소를 불러왔습니다."
              : "짧은 주소를 만들었습니다."
            : ""}
      </p>

      <section className="panel" aria-label="URL 입력">
        <form
          className="panel-body"
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isLoading}
        >
          <label className="field-label" htmlFor="original-url">
            원본 URL
          </label>
          <div className="input-row">
            <input
              ref={inputRef}
              id="original-url"
              className="form-input"
              name="originalUrl"
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://example.com/…"
              value={originalUrl}
              onChange={handleChange}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "url-error" : "url-hint"}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading}
            >
              {isLoading ? "줄이는 중…" : "줄이기"}
            </button>
          </div>

          <div aria-live="polite">
            {error ? (
              <p id="url-error" className="field-error">
                <WarningCircle size={16} weight="bold" aria-hidden="true" />
                {error}
              </p>
            ) : (
              <p id="url-hint" className="field-hint">
                http:// 또는 https://로 시작하는 주소
              </p>
            )}
          </div>
        </form>

        {result && (
          <div className="panel-body result fade-in">
            <div className="result-head">
              {result.isExisting ? (
                <span className="status-chip is-existing">
                  <Info size={14} weight="bold" aria-hidden="true" />
                  이미 만든 주소
                </span>
              ) : (
                <span className="status-chip is-new">
                  <CheckCircle size={14} weight="fill" aria-hidden="true" />
                  새로 만듦
                </span>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCopy}
              >
                {copyState === "copied" ? (
                  <Check size={16} weight="bold" aria-hidden="true" />
                ) : (
                  <Copy size={16} aria-hidden="true" />
                )}
                {copyState === "copied"
                  ? "복사함"
                  : copyState === "failed"
                    ? "복사 실패"
                    : "복사"}
              </button>
            </div>

            <a
              className="short-url"
              href={result.shortUrl}
              target="_blank"
              rel="noreferrer"
            >
              {result.shortUrl}
            </a>

            <dl className="result-meta">
              <dt>원본</dt>
              <dd>{result.originalUrl}</dd>
            </dl>
          </div>
        )}

        <ul className="panel-body rule-grid" aria-label="이용 안내">
          <li>
            <ArrowsCounterClockwise size={18} aria-hidden="true" />
            <div>
              <strong>같은 URL은 한 번만 저장</strong>
              다시 줄이면 처음 만든 주소를 그대로 보여 줌
            </div>
          </li>
          <li>
            <Prohibit size={18} aria-hidden="true" />
            <div>
              <strong>이 서비스 주소는 줄일 수 없음</strong>
              짧은 주소가 자기 자신을 가리키지 않게 막음
            </div>
          </li>
        </ul>
      </section>
    </main>
  );
}
