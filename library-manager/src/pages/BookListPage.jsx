import { useState, useEffect } from 'react'

import BookListHeader from '../components/BookListHeader'
import BookGrid from '../components/BookGrid'
import BookList from '../components/BookList'
import Pagination from '../components/Pagination'
import '../css/BookListPage.css'
import { useSearchParams } from 'react-router-dom'
import { searchBooks } from '../services/bookApi'
import { SORT_OPTIONS } from '../components/SortSelect'
import { useFavorites } from '../services/useFavorites'

const BASE_URL = 'http://localhost:3000/books'
const VIEW_MODE_KEY = 'viewMode'

function loadViewMode() {
  try{
    const saved = localStorage.getItem(VIEW_MODE_KEY)
    return saved === 'list' ? 'list' : 'grid'
  } catch{
    return 'grid'
  }
}

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
  const [viewMode, setViewMode] = useState(loadViewMode)
  const [allBooksForFav, setAllBooksForFav] = useState([])
  const { favorites, isFavorite } = useFavorites()
  

  const sort = SORT_OPTIONS.find((option) => option.value === sortKey)

  const [searchParams] = useSearchParams()
  const keyword = (searchParams.get('q') ?? '').trim()
  const isSearching = keyword.length >= 2

  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    if (isSearching) return
    const controller = new AbortController()
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
        if (!res.ok) throw new Error(`책 요청 실패: ${res.status}`)

        const data = await res.json()
        setBooks(data)
        setTotal(Number(res.headers.get('X-Total-Count')))
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    loadBooks()

    return () => controller.abort()
  }, [isSearching, currentPage, itemsPerPage, sortKey])

  useEffect(() => {
    if (!isSearching) return
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    async function loadSearchResults() {
      try {
        const results = await searchBooks(keyword, controller.signal)
        setSearchResults(results)
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (size) => {
    setItemsPerPage(size)
    setCurrentPage(1)
  }

  const handleSortChange = (key) => {
    setSortKey(key)
    setCurrentPage(1)
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    try{
      localStorage.setItem(VIEW_MODE_KEY, mode)
    } catch{

    }
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

  if (loading) return <p>불러오는 중...</p>
  if (error) return <p>에러: {error}</p>

  return (
    <section className="book-list-page">
      <BookListHeader
        total={displayTotal}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        sortKey={sortKey}
        onSortChange={handleSortChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {displayTotal === 0 ? (
        <p>검색 도서 없음</p>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <BookGrid books={displayBooks} />
          ) : (
            <BookList books={displayBooks} />
          )}
            
          <Pagination
            currentPage={safePage}
            total={displayTotal}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  )
}

export default BookListPage