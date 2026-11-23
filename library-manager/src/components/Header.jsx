import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './Header.css'
import { useState } from 'react'
export default function Header() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [text, setText] = useState(searchParams.get('q') ?? '')
  const [message, setMessage] = useState('')

  // 검색창에서 엔터를 누르거나 검색 버튼을 눌렀을 때 목록 페이지로 이동
  function handleSearchSubmit(event) {
    event.preventDefault()
    const keyword = text.trim()

    // 빈 검색 -> 전체 목록
    if(keyword.length === 0){
      setMessage('')
      navigate('/')
      return
    }

    // 두글자 미만 입력
    if(keyword.length < 2){
      setMessage('검색어는 2글자 이상 입력해주세요.')
      return
    }
    setMessage('')
    // URL 변경
    navigate(`/?q=${encodeURIComponent(keyword)}`)
  }

  // 홈 버튼 클릭 시 검색어를 초기화하고 목록 페이지로 이동
  function handleHomeClick() {
    setText('')
    setMessage('')
  }

  return (
    <header className="site-header">
      {/* 1. 홈 버튼 (목록 페이지로 이동) */}
      <Link to="/" className="brand" onClick={handleHomeClick}>
        <span className="brand-icon"></span> 도서관리 시스템
      </Link>

      {/* 2. 검색창 */}
      <form className="header-search" onSubmit={handleSearchSubmit}>
        <input
          type="search"
          placeholder="제목, 내용, 저자로 책을 찾아보세요"
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            setMessage('')
          }}
          aria-label="도서 검색"
        />
        <button type="submit" className="btn btn-secondary">
          검색
        </button>
        {message && <p className="search-message">{message}</p>}
      </form>

      {/* 3. 새 책 등록 버튼 (등록 페이지로 이동) */}
      <Link to="/books/new" className="btn-create">
        책 등록
      </Link>
    </header>
  )
}