import { Link, useNavigate } from 'react-router-dom'

export default function Header({ searchQuery, onSearchChange }) {
  const navigate = useNavigate()

  // 검색창에서 엔터를 누르거나 검색 버튼을 눌렀을 때 목록 페이지로 이동
  function handleSearchSubmit(event) {
    event.preventDefault()
    navigate('/')
  }

  // 홈 버튼 클릭 시 검색어를 초기화하고 목록 페이지로 이동
  function handleHomeClick() {
    onSearchChange('')
  }

  return (
    <header className="site-header">
      {/* 1. 홈 버튼 (목록 페이지로 이동) */}
      <Link to="/" className="brand" onClick={handleHomeClick}>
        <span className="brand-icon"></span> 도서관리 시스템
        <span className="brand-sub">나만의 작은 도서관</span>
      </Link>

      {/* 2. 검색창 */}
      <form className="header-search" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="제목이나 내용으로 책을 찾아보세요"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="도서 검색"
        />
        <button type="submit" className="btn btn-secondary">
          검색
        </button>
      </form>

      {/* 3. 새 책 등록 버튼 (등록 페이지로 이동) */}
      <Link to="/books/new" className="btn btn-primary">
        + 새 책 등록
      </Link>
    </header>
  )
}