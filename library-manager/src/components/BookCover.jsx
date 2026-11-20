// 표지 이미지. 이미지가 없으면 책 아이콘 + "책 표지" 자리 표시
function BookCover() {
  return (
    <div className="book-cover book-cover--empty" aria-label="표지 없음">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
      </svg>
      <span>책 표지</span>
    </div>
  )
}
export default BookCover