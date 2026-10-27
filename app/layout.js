import "./globals.css";
import TopBar from "../components/top-bar";

export const metadata = {
  title: "URL Shortener",
  description: "긴 URL을 6자리 짧은 주소로 바꾸는 서비스",
};

export const viewport = {
  themeColor: "#f4f4f2",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <a href="#main" className="skip-link">
          본문으로 건너뛰기
        </a>
        <TopBar />
        {children}
      </body>
    </html>
  );
}
