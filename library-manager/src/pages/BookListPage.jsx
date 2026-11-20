import { useState, useEffect } from 'react'

import BookListHeader from '../components/BookListHeader'
import BookGrid from '../components/BookGrid'
import Pagination from '../components/Pagination'
import './BookListPage.css'

const BASE_URL = 'http://localhost:3000/books'

function BookListPage({ searchQuery = '' }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadBooks() {
      try {
        const res = await fetch(BASE_URL)
        if (!res.ok) throw new Error(`책 요청 실패: ${res.status}`)
        const data = await res.json()
        setBooks(data)
      } catch (err) {
        setError('책 불러오기 실패')
      } finally {
        setLoading(false)
      }
    }
    loadBooks()
  }, [])

  if (loading) return <p>불러오는 중...</p>
  if (error) return <p>에러: {error}</p>

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredBooks = normalizedQuery
    ? books.filter((book) => {
        const title = (book.title || '').toLowerCase()
        const author = (book.author || '').toLowerCase()
        const content = (book.content || '').toLowerCase()
        return (
          title.includes(normalizedQuery) ||
          author.includes(normalizedQuery) ||
          content.includes(normalizedQuery)
        )
      })
    : books

  return (
    <section className="book-list-page">
      <BookListHeader total={filteredBooks.length} />
      {filteredBooks.length > 0 ? (
        <BookGrid books={filteredBooks} />
      ) : (
        <p className="empty-message">
          {normalizedQuery
            ? `'${searchQuery}'에 해당하는 도서가 없습니다.`
            : '등록된 도서가 없습니다.'}
        </p>
      )}
      <Pagination />
    </section>
  )
}

export default BookListPage