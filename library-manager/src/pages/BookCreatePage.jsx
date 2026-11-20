import { useState } from 'react'
import './BookCreatePage.css'

function BookCreatePage({ onCreated }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  

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
          //coverImageUrl,
          createdAt: now,
          updatedAt: now,
        })
      })

      if (!response.ok) {
        throw new Error('도서 등록 요청에 실패했습니다.')
      }

      const createdBook = await response.json();
      onCreated(createdBook);

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

      <div>
        <button type="submit">작성</button>
      </div>
    </form>
  )
}

export default BookCreatePage;