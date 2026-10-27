import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "없는 페이지 | URL Shortener",
};

export default function NotFound() {
  return (
    <main id="main" className="content content-narrow">
      <div className="empty-state">
        <MagnifyingGlass size={20} aria-hidden="true" />
        <h1>없는 페이지</h1>
        <p>주소가 틀렸거나 지금은 없는 페이지입니다.</p>
        <a className="btn btn-primary" href="/">
          URL 줄이기
        </a>
      </div>
    </main>
  );
}
