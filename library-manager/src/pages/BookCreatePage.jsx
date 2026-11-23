import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './BookCreatePage.css'

function BookCreatePage({ onCreated }) {
  const location = useLocation()
  const navigate = useNavigate()
  const restored = location.state?.formData

  const [title, setTitle] = useState(restored?.title ?? '')
  const [author, setAuthor] = useState(restored?.author ?? '')
  const [content, setContent] = useState(restored?.content ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(restored?.coverImageUrl ?? '')
  const [error, setError] = useState('')

  function handleGoToCoverPage() {
    if (!title.trim() || !content.trim()) {
      setError('AI 표지를 생성하려면 제목과 내용을 먼저 입력해 주세요.')
      return
    }

    setError('')
    navigate('/books/cover', {
      state: {
        returnTo: '/books/new',
        formData: { title, author, content, coverImageUrl }
      }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!title.trim() || !author.trim()) {
      setError('제목과 저자를 입력해 주세요.')
      return
    }

    setError('')
    const now = new Date().toISOString()

    try {
      const response = await fetch('http://localhost:3000/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          content: content.trim(),
          coverImageUrl,
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
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          내용
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
      </div>

      <div>
        <p>도서 표지</p>
        {coverImageUrl && (
          <img
            src={coverImageUrl}
            alt="선택된 도서 표지 미리보기"
            style={{ width: '140px', display: 'block', marginBottom: '8px' }}
          />
        )}
        <button type="button" onClick={handleGoToCoverPage}>
          {coverImageUrl ? 'AI 표지 다시 생성' : 'AI 표지 생성'}
        </button>
      </div>

      {error && <p role="alert">{error}</p>}

      <div>
        <button type="submit">작성</button>
      </div>
    </form>
  )
}

export default BookCreatePage