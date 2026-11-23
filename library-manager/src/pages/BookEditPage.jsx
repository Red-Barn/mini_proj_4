import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './BookCreatePage.css'

function BookEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
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
      } catch {
        setError('도서 정보를 불러오지 못했습니다.')
      }
    }

    fetchBook()
  }, [id])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim() || !author.trim() || !content.trim()) {
      setError('제목, 저자, 내용을 입력해 주세요.')
      return
    }

    if (title.trim().length > 100 || author.trim().length > 50) {
      setError('제목은 100자, 저자는 50자 이내로 입력해 주세요.')
      return
    }

    setError('')

    try {
      const checkResponse = await fetch(
        `http://localhost:3000/books?title=${encodeURIComponent(title.trim())}&content=${encodeURIComponent(content.trim())}`
      )

      if (!checkResponse.ok) {
        throw new Error('중복 검사 요청에 실패했습니다.')
      }

      const sameBooks = await checkResponse.json()
      if (sameBooks.some((book) => String(book.id) !== id)) {
        setError('이미 등록된 도서입니다.')
        return
      }

      const response = await fetch(`http://localhost:3000/books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          content: content.trim(),
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

      <button type="submit">수정하기</button>
    </form>
  )
}

export default BookEditPage