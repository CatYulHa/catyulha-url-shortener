// 과제: 자기 서비스 URL 단축 방지
// 단축하려는 URL의 호스트가 이 서비스의 호스트와 같은지 확인합니다.
// 경로와 http/https 여부는 따지지 않고 호스트 이름만 비교합니다.

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function normalizeHost(host) {
  if (!host) {
    return null;
  }

  try {
    // "my-app.vercel.app:443" 같은 값에서 포트를 떼고 소문자로 맞춥니다.
    const hostname = new URL(`http://${host.trim()}`).hostname;
    return hostname.replace(/\.$/, "");
  } catch {
    return null;
  }
}

// 요청 주소와 Vercel 시스템 환경변수에서 이 서비스의 호스트 목록을 모읍니다.
function getServiceHosts(request) {
  const candidates = [
    new URL(request.url).host,
    request.headers.get("x-forwarded-host")?.split(",")[0],
    request.headers.get("host"),
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_URL,
  ];

  const hosts = new Set();

  for (const candidate of candidates) {
    const host = normalizeHost(candidate);
    if (host) {
      hosts.add(host);
    }
  }

  return hosts;
}

export function isServiceUrl(targetUrl, request) {
  const targetHost = normalizeHost(targetUrl.host);

  if (!targetHost) {
    return false;
  }

  const serviceHosts = getServiceHosts(request);

  if (serviceHosts.has(targetHost)) {
    return true;
  }

  // 로컬 개발 서버에서는 localhost와 127.0.0.1을 같은 주소로 봅니다.
  const isLocalService = [...serviceHosts].some((host) =>
    LOOPBACK_HOSTS.has(host)
  );

  return isLocalService && LOOPBACK_HOSTS.has(targetHost);
}
