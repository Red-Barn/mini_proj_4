// 페이지 번호 목록 (이전 / 1 2 3 ... / 다음)
function Pagination() {
  return (
    <nav className="pagination" aria-label="페이지 이동">
      <button type="button" className="pagination-btn">이전</button>
      <button type="button" className="pagination-btn is-active" aria-current="page">1</button>
      <button type="button" className="pagination-btn">다음</button>
    </nav>
  )
}
export default Pagination
