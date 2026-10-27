"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowClockwise, LinkSimple, WarningCircle } from "@phosphor-icons/react";

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
});
const numberFormat = new Intl.NumberFormat("ko-KR");

function formatDate(value) {
  return value ? dateFormat.format(new Date(value)) : null;
}

function Stat({ label, value, unit, detail }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>
      {detail && <div className="stat-detail">{detail}</div>}
    </div>
  );
}

function LoadingView() {
  return (
    <div aria-hidden="true">
      <div className="stat-grid">
        {[0, 1, 2, 3].map((key) => (
          <div className="stat" key={key}>
            <div className="skeleton skeleton-line" style={{ width: "60%" }} />
            <div className="skeleton skeleton-value" />
          </div>
        ))}
      </div>
      <div className="section">
        <div className="skeleton skeleton-table" />
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stats", {
        cache: "no-store",
      });

      if (response.status === 401) {
        throw new Error("관리자 로그인이 필요합니다. 페이지를 새로 열어 다시 로그인해 주세요.");
      }

      if (!response.ok) {
        throw new Error("통계를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }

      setStats(await response.json());
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "서버에 연결할 수 없습니다."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const summary = stats?.summary;
  const urls = stats?.urls ?? [];
  const topUrl = summary?.topUrl;

  return (
    <main id="main" className="content" aria-busy={loading}>
      <div className="page-heading">
        <div>
          <h1>관리자 통계</h1>
          <p>단축 URL별 클릭 수와 최근 클릭 시각</p>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadStats}
            disabled={loading}
          >
            <ArrowClockwise size={16} aria-hidden="true" />
            {loading && stats ? "불러오는 중…" : "새로고침"}
          </button>
        </div>
      </div>

      {error && (
        <div className="callout page-alert" role="alert">
          <WarningCircle size={18} weight="bold" aria-hidden="true" />
          <p>{error}</p>
          <button type="button" className="btn btn-secondary" onClick={loadStats}>
            다시 시도
          </button>
        </div>
      )}

      {!stats && loading && <LoadingView />}

      {summary && (
        <>
          <section aria-label="요약">
            <div className="stat-grid">
              <Stat
                label="전체 단축 URL"
                value={numberFormat.format(summary.totalUrls)}
                unit="개"
              />
              <Stat
                label="전체 클릭"
                value={numberFormat.format(summary.totalClicks)}
                unit="회"
              />
              <Stat
                label="한 번 이상 클릭된 URL"
                value={numberFormat.format(summary.clickedUrls)}
                unit="개"
              />
              <Stat
                label="가장 많이 클릭된 URL"
                value={topUrl ? `/${topUrl.shortCode}` : "없음"}
                detail={
                  topUrl
                    ? `${numberFormat.format(topUrl.clickCount)}회 클릭`
                    : "아직 클릭 기록 없음"
                }
              />
            </div>
          </section>

          <section className="section" aria-labelledby="url-table-title">
            <div className="section-title">
              <h2 id="url-table-title">URL별 사용량</h2>
              {summary.totalUrls > urls.length && (
                <p>
                  {numberFormat.format(summary.totalUrls)}개 중 클릭 많은 순{" "}
                  {numberFormat.format(urls.length)}개 표시
                </p>
              )}
            </div>

            {urls.length === 0 ? (
              <div className="empty-state">
                <LinkSimple size={20} aria-hidden="true" />
                <h3>아직 줄인 URL이 없음</h3>
                <p>URL을 줄이면 여기에 클릭 수가 쌓입니다.</p>
                <a className="btn btn-primary" href="/">
                  URL 줄이기
                </a>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col" className="col-code">Short Code</th>
                    <th scope="col">원본 URL</th>
                    <th scope="col" className="num">클릭 수</th>
                    <th scope="col" className="col-date">생성</th>
                    <th scope="col" className="col-date">최근 클릭</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((url) => (
                    <tr key={url.shortCode}>
                      <td data-label="Short Code" className="col-code">
                        <span className="mono">{url.shortCode}</span>
                      </td>
                      <td data-label="원본 URL" className="url-cell">
                        <a href={url.originalUrl} target="_blank" rel="noreferrer">
                          {url.originalUrl}
                        </a>
                      </td>
                      <td data-label="클릭 수" className="num">
                        {numberFormat.format(url.clickCount)}
                      </td>
                      <td data-label="생성" className="col-date tabular">
                        {formatDate(url.createdAt) ?? <span className="is-empty">없음</span>}
                      </td>
                      <td data-label="최근 클릭" className="col-date tabular">
                        {formatDate(url.lastClickedAt) ?? (
                          <span className="is-empty">클릭 없음</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </main>
  );
}
