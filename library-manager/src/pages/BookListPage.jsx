import { useState, useEffect } from 'react'

import BookListHeader from '../components/BookListHeader'
import BookGrid from '../components/BookGrid'
import BookList from '../components/BookList'
import Pagination from '../components/Pagination'
import './BookListPage.css'
import { useSearchParams } from 'react-router-dom'
import { searchBooks } from '../services/bookApi'
import { SORT_OPTIONS } from '../components/SortSelect'

const BASE_URL = 'http://localhost:3000/books'

function compareBooks(a, b, { field, order }) {
  const x = a[field]
  const y = b[field]
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
  const [viewMode, setViewMode] = useState('grid')

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
      try {
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

  const sortResults = [...searchResults].sort((a, b) => compareBooks(a, b, sort))

  const start = (currentPage - 1) * itemsPerPage
  const displayBooks = isSearching ? sortResults.slice(start, start + itemsPerPage) : books
  const displayTotal = isSearching ? searchResults.length : total

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
        onViewModeChange={setViewMode}
      />

      {viewMode === 'grid' ? (
        <BookGrid books={displayBooks} />
      ) : (
        <BookList books={displayBooks} />
      )}

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