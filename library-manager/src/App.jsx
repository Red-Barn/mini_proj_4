import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import BookListPage from './pages/BookListPage'
import BookDetailPage from './pages/BookDetailPage'
import BookCreatePage from './pages/BookCreatePage'
import BookEditPage from './pages/BookEditPage'
import CoverGeneratePage from './pages/CoverGeneratePage'
import './App.css'

// URL 변경시 재 랜더링 -> key 변경 -> BookListPage 초기화 -> currentPage: 1
function BookListRoute() {
  const [sp] = useSearchParams()
  return <BookListPage key={sp.get('q') ?? ''} />
}

export default function App() {
  const [notice, setNotice] = useState('')

  return (
    <BrowserRouter>
      <div className="library-app">
        <Header />

        <main className="main-shell">
          {notice && (
            <div className="bd-notice" role="status">
              <span>{notice}</span>
              <button type="button" aria-label="알림 닫기" onClick={() => setNotice('')}>×</button>
            </div>
          )}
          <Routes>
            <Route
              path="/"
              element={<BookListRoute />}
            />
            <Route
              path="/books/new"
              element={<BookCreatePage/>}
            />
            <Route
              path="/books/:id"
              element={<BookDetailPage setNotice={setNotice} />}
            />
            <Route
              path="/books/:id/edit"
              element={<BookEditPage/>}
            />
            <Route path="/books/cover" element={<CoverGeneratePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}