import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './BookCreatePage.css'

function BookCreatePage({ onCreated }) {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    if (!title.trim() || !author.trim() || !content.trim()) {
      setError('제목, 저자, 내용을 입력해 주세요.')
      return
    }

    if (title.trim().length > 100 || author.trim().length > 50) {
      setError('제목은 100자, 저자는 50자 이내로 입력해 주세요.')
      return
    }

    setError('')
    const now = new Date().toISOString()

    try {
      const checkResponse = await fetch(
        `http://localhost:3000/books?title=${encodeURIComponent(title.trim())}&content=${encodeURIComponent(content.trim())}`
      )

      if (!checkResponse.ok) {
        throw new Error('중복 검사 요청에 실패했습니다.')
      }

      const sameBooks = await checkResponse.json()
      if (sameBooks.length > 0) {
        setError('이미 등록된 도서입니다.')
        return
      }

      const response = await fetch('http://localhost:3000/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),  
          content: content.trim(),
          createdAt: now,
          updatedAt: now
        })
      })

      if (!response.ok) {
        throw new Error('도서 등록 요청에 실패했습니다.')
      }

      const createdBook = await response.json()
      onCreated?.(createdBook)
      navigate('/')
    } catch {
      setError('도서를 등록하지 못했습니다. 서버 연결을 확인해 주세요.')
    }
  }

  return (
    <form className="book-create-form" onSubmit={handleSubmit}>
      <h1>새 도서 등록</h1>

      <div>
        <label>
          제목
          <input
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          저자
          <input
            required
            maxLength={50}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          내용
          <textarea
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
      </div>

      {error && <p role="alert">{error}</p>}

      <div>
        <button type="submit">작성</button>
      </div>
    </form>
  )
}

export default BookCreatePage