import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import BookListPage from './pages/BookListPage'
import BookDetailPage from './pages/BookDetailPage'
import BookCreatePage from './pages/BookCreatePage'
import BookEditPage from './pages/BookEditPage'

export default function App() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <BrowserRouter>
      <div className="library-app">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <main className="main-shell">
          <Routes>
            <Route
              path="/"
              element={<BookListPage searchQuery={searchQuery} />}
            />
            <Route
              path="/books/new"
              element={<BookCreatePage />}
            />
            <Route
              path="/books/:id"
              element={<BookDetailPage />}
            />
            <Route
              path="/books/:id/edit"
              element={<BookEditPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}