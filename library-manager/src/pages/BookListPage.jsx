import { useState, useEffect } from 'react'

import BookListHeader from '../components/BookListHeader'
import BookGrid from '../components/BookGrid'
import Pagination from '../components/Pagination'
import './BookListPage.css'
import { useSearchParams } from 'react-router-dom'
import { searchBooks } from '../services/bookApi'

const BASE_URL ='http://localhost:3000/books'

function BookListPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(8)

  // 검색 내용 및 글자 수 검사
  // URL을 직접 고쳐서 1글자를 넣어도 안전하게
  const [searchParams] = useSearchParams()
  const keyword = (searchParams.get('q') ?? '').trim()
  const isSearching = keyword.length >= 2

  const [searchResults, setSearchResults] = useState([])  // 검색 결과 전체

  // 일반 목록 Effect
  useEffect(() => {
    if(isSearching) return
    // 요청 취소 장치
    const controller = new AbortController()
    // useEffect 실행시 상태 초기화
    setLoading(true)
    setError(null)

    async function loadBooks() {
      try{
        const res = await fetch(`${BASE_URL}?_page=${currentPage}&_limit=${itemsPerPage}`, {
          signal: controller.signal
        })
        if(!res.ok) throw new Error(`책 요청 실패: ${res.status}`)

        const data = await res.json()
        setBooks(data)
        setTotal(Number(res.headers.get('X-Total-Count')))  // 전체 권수
      } catch(err){
        // controller에 의해 요청 취소 -> 정상
        if (err.name === 'AbortError') return
        setError(err.message)
      } finally {
        // 취소되지 않은 요청만 로딩 종료
        if(!controller.signal.aborted) setLoading(false)
      }
    }
    loadBooks()

    // cleanup 함수 -> 이전 요청을 취소하고 항상 마지막 요청 결과만 반영
    return () => controller.abort()
    // 의존성 배열: currentPage, itemsPerPage가 바뀌면 다시 실행
  }, [isSearching, currentPage, itemsPerPage])

  // 검색 Effect
  useEffect(() => {
    if(!isSearching) return
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    async function loadSearchResults() {
      try{
        // service/searchBooks -> searchBooks() 실행
        const results = await searchBooks(keyword, controller.signal)
        setSearchResults(results)
      } catch(err){
        if(err.name === 'AbortError') return
        setError(err.message)
      } finally{
        if(!controller.signal.aborted) setLoading(false)
      }
    }
    loadSearchResults()

    return () => controller.abort()
  }, [isSearching, keyword])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' }) // 페이지 이동 시 맨 위로
  }

  const handleItemsPerPageChange = (size) => {
    setItemsPerPage(size)
    setCurrentPage(1) // 개수가 바뀌면 1페이지로 이동
  }

  // Effect 종류에 따라 책 화면 구성 변경 및 Pagination 최대 값 변경
  const start = (currentPage - 1) * itemsPerPage
  const displayBooks = isSearching ? searchResults.slice(start, start + itemsPerPage) : books
  const displayTotal = isSearching ? searchResults.length : total

  if(loading) return <p>불러오는 중...</p>
  if(error) return <p>에러: {error}</p>
  return(
    <section className="book-list-page">
        <BookListHeader 
          total={displayTotal}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          />
        <BookGrid books={displayBooks}/>
        <Pagination
          currentPage={currentPage}
          total={displayTotal}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
    </section>
  )
}
export default BookListPage