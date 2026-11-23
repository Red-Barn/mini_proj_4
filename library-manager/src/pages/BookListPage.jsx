import { useState, useEffect } from 'react'

import BookListHeader from '../components/BookListHeader'
import BookGrid from '../components/BookGrid'
import Pagination from '../components/Pagination'
import './BookListPage.css'

const BASE_URL ='http://localhost:3000/books'

function BookListPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(8)

  useEffect(() => {
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
        // AbortError 제외하고 항상 실행 -> fetch 취소
        // AbortError 실행 시 -> 정상 -> fetch 취소 안함
        if(!controller.signal.aborted) setLoading(false)
      }
    }
    loadBooks()

    // cleanup 함수 -> 이전 요청을 취소하고 항상 마지막 요청 결과만 반영
    return () => controller.abort()
    // 의존성 배열: currentPage, itemsPerPage가 바뀌면 다시 실행
  }, [currentPage, itemsPerPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' }) // 페이지 이동 시 맨 위로
  }

  const handleItemsPerPageChange = (size) => {
    setItemsPerPage(size)
    setCurrentPage(1) // 개수가 바뀌면 1페이지로 이동
  }

  if(loading) return <p>불러오는 중...</p>
  if(error) return <p>에러: {error}</p>
  return(
    <section className="book-list-page">
        <BookListHeader 
          total={total}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          />
        <BookGrid books={books}/>
        <Pagination
          currentPage={currentPage}
          total={total}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
    </section>
  )
}
export default BookListPage