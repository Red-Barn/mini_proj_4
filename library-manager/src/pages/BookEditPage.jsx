import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import './BookCreatePage.css'

function BookEditPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const restored = location.state?.formData

  const [title, setTitle] = useState(restored?.title ?? '')
  const [author, setAuthor] = useState(restored?.author ?? '')
  const [content, setContent] = useState(restored?.content ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(restored?.coverImageUrl ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    // 표지 생성 페이지에서 돌아온 경우 기존 DB 데이터로 덮어쓰지 않음
    if (restored) return

    async function fetchBook() {
      setError('')

      try {
        const response = await fetch(`http://localhost:3000/books/${id}`)
        if (!response.ok) {
          throw new Error('도서 조회 실패')
        }
        const data = await response.json()

        setTitle(data.title ?? '')
        setAuthor(data.author ?? '')
        setContent(data.content ?? '')
        setCoverImageUrl(data.coverImageUrl ?? '')
      } catch {
        setError('도서 정보를 불러오지 못했습니다.')
      }
    }

    fetchBook()
  }, [id, restored])

  function handleGoToCoverPage() {
    if (!title.trim() || !content.trim()) {
      setError('AI 표지를 생성하려면 제목과 내용을 먼저 입력해 주세요.')
      return
    }

    setError('')
    navigate('/books/cover', {
      state: {
        returnTo: `/books/${id}/edit`,
        formData: { title, author, content, coverImageUrl }
      }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim() || !author.trim()) {
      setError('제목과 저자를 입력해 주세요.')
      return
    }

    setError('')

    try {
      const response = await fetch(`http://localhost:3000/books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          content: content.trim(),
          coverImageUrl,
          updatedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('도서 수정 실패')
      }

      navigate(`/books/${id}`)
    } catch {
      setError('도서를 수정하지 못했습니다.')
    }
  }

  return (
    <form className="book-create-form" onSubmit={handleSubmit}>
      <h1>도서 수정</h1>

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
            alt="현재 도서 표지 미리보기"
            style={{ width: '140px', display: 'block', marginBottom: '8px' }}
          />
        )}
        <button type="button" onClick={handleGoToCoverPage}>
          {coverImageUrl ? 'AI 표지 수정' : 'AI 표지 생성'}
        </button>
      </div>

      {error && <p role="alert">{error}</p>}

      <button type="submit">수정하기</button>
    </form>
  )
}

export default BookEditPage