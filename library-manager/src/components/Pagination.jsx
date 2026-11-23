// 페이지 번호 목록 (이전 / 1 2 3 ... / 다음)
function Pagination({ currentPage, total, itemsPerPage, onPageChange }) {
  // 전체 책 수와 한 페이지 개수로 전체 페이지 수 계산
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage))

  // 페이지가 1개 이하이면 표시하지 않음
  if (totalPages <= 1) return null

  // pages = [1, 2, 3, ... , totalPages]
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="pagination" aria-label="페이지 이동">
      <button
        type="button"
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        이전
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={`pagination-btn ${page === currentPage ? 'is-active' : ''}`}
          aria-current={page === currentPage ? 'page' : undefined}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        다음
      </button>
    </nav>
  )
}
export default Pagination
