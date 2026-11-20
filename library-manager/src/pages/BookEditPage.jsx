import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './BookCreatePage.css'

function BookEditPage() {
  const { id } = useParams()

  const [book, setBook] = useState(null)
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

        setBook(data)
        setTitle(data.title ?? '')
        setAuthor(data.author ?? '')
        setContent(data.content ?? '')
      } catch {
        setBook(null)
        setError('도서 정보를 불러오지 못했습니다.')
      }
    }

    fetchBook()
  }, [id])

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
        })
      })

      if (!response.ok) {
        throw new Error('도서 수정 실패')
      }

      const updatedBook = await response.json()
      setBook(updatedBook)
      setTitle(updatedBook.title ?? '')
      setAuthor(updatedBook.author ?? '')
      setContent(updatedBook.content ?? '')
      
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
            onChange={e => setTitle(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          저자
          <input
            required
            value={author}
            onChange={e => setAuthor(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          내용
          <textarea
            rows={4}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </label>
      </div>

      {error && <p role="alert">{error}</p>}

      <button type="submit">수정하기</button>
    </form>
  )
}

export default BookEditPage