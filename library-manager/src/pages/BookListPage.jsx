import { useState, useEffect } from 'react'

import BookListHeader from '../components/BookListHeader'
import BookGrid from '../components/BookGrid'
import Pagination from '../components/Pagination'
import './BookListPage.css'
import { useSearchParams } from 'react-router-dom'
import { searchBooks } from '../services/bookApi'
import { SORT_OPTIONS } from '../components/SortSelect'
import { useFavorites } from '../components/useFavorites'

const BASE_URL ='http://localhost:3000/books'

function compareBooks(a, b, {field, order}, isFavorite){
  if (field === 'favorite') {
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''), 'ko')
  }

  const x = String(a[field] ?? '')
  const y = String(b[field] ?? '')
  const result = x.localeCompare(y, 'ko')
  return order === 'asc' ? result : -result
}

function BookListPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [sortKey, setSortKey] = useState('title')
  const [allBooksForFav, setAllBooksForFav] = useState([])
  const { favorites, isFavorite } = useFavorites()
  

  // 지금 정렬과 value가 같은 sort 딕셔너리
  const sort = SORT_OPTIONS.find((option) => option.value === sortKey)

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
        // 즐겨찾기순은 localStorage 기반이므로 전체 목록을 받아 정렬 후 페이지네이션 적용
        if (sortKey === 'favorite') {
          const res = await fetch(`${BASE_URL}?_sort=createdAt&_order=desc`, {
            signal: controller.signal
          })
          if (!res.ok) throw new Error(`책 요청 실패: ${res.status}`)

          const data = await res.json()
          setAllBooksForFav(data)
          return
        }

        const params = new URLSearchParams({
          _page: currentPage,
          _limit: itemsPerPage,
          _sort: sort.field,
          _order: sort.order,
        })
        const res = await fetch(`${BASE_URL}?${params}`, {
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
    // 의존성 배열: isSearching, currentPage, itemsPerPage가 바뀌면 다시 실행
  }, [isSearching, currentPage, itemsPerPage, sortKey])

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

  const favoriteFilteredBooks = allBooksForFav.filter((book) => isFavorite(book.id))
  const safePage =
    !isSearching && sortKey === 'favorite'
      ? Math.min(currentPage, Math.max(1, Math.ceil(favoriteFilteredBooks.length / itemsPerPage)))
      : currentPage

  useEffect(() => {
    if (safePage !== currentPage) {
      setCurrentPage(safePage)
    }
  }, [safePage, currentPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' }) // 페이지 이동 시 맨 위로
  }

  const handleItemsPerPageChange = (size) => {
    setItemsPerPage(size)
    setCurrentPage(1) // 개수가 바뀌면 1페이지로 이동
  }

  const handleSortChange = (key) => {
    setSortKey(key)
    setCurrentPage(1) // 정렬이 바뀌면 1페이지로 이동
  }

  // 검색 결과 필터링 및 정렬 
  const filteredSearchResults =
    sortKey === 'favorite'
      ? searchResults.filter((book) => isFavorite(book.id))
      : searchResults
  const sortResults = [...filteredSearchResults].sort((a, b) => compareBooks(a, b, sort))

  // 화면 출력 데이터 계산
  const start = (safePage - 1) * itemsPerPage

  const displayBooks = isSearching
    ? sortResults.slice(start, start + itemsPerPage)
    : sortKey === 'favorite'
      ? favoriteFilteredBooks.slice(start, start + itemsPerPage)
      : books

  const displayTotal = isSearching
    ? sortResults.length
    : sortKey === 'favorite'
      ? favoriteFilteredBooks.length
      : total

  if(loading) return <p>불러오는 중...</p>
  if(error) return <p>에러: {error}</p>
  return(
    <section className="book-list-page">
        <BookListHeader 
          total={displayTotal}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          sortKey={sortKey}
          onSortChange={handleSortChange}
          />
        <BookGrid books={displayBooks}/>
        <Pagination
          currentPage={safePage}
          total={displayTotal}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
    </section>
  )
}
export default BookListPage