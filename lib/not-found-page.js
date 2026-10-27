// 없는 shortCode로 들어왔을 때 보여 줄 404 화면 (Route Handler는 React 화면을 그릴 수 없어 HTML로 만든다)
export function notFoundPage() {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>없는 짧은 주소 | URL Shortener</title>
<style>
@font-face { font-family: Pretendard; src: url("/fonts/PretendardVariable.woff2") format("woff2"); font-weight: 100 900; font-display: swap; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px 16px; background: #f4f4f2; color: #0b0b0b;
  font-family: Pretendard, system-ui, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; font-size: 16px; line-height: 1.6; word-break: keep-all; }
main { width: min(100%, 480px); padding: 40px 24px; border: 1px solid #e1e0d9; border-radius: 10px; background: #fcfcfb; text-align: center; }
.code { display: inline-block; padding: 2px 10px; border-radius: 999px; background: #ececea; color: #52514e; font-size: 14px; font-weight: 500; }
h1 { margin: 12px 0 0; font-size: 24px; font-weight: 600; line-height: 1.3; }
p { margin: 8px 0 24px; color: #52514e; }
a { display: inline-flex; align-items: center; min-height: 40px; padding: 0 16px; border-radius: 6px; background: #0b0b0b; color: #fcfcfb; font-weight: 500; text-decoration: none; }
a:hover { background: #52514e; }
a:focus-visible { outline: 2px solid #7e8f47; outline-offset: 2px; }
</style>
</head>
<body>
<main>
<span class="code">404</span>
<h1>없는 짧은 주소</h1>
<p>주소가 틀렸거나 아직 만들지 않은 코드입니다.</p>
<a href="/">URL 줄이기</a>
</main>
</body>
</html>`;
}
