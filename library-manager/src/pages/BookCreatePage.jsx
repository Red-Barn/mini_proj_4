import { useRef, useState } from 'react'


function BookCreatePage({ onCreated, onGenerateCover }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  

  async function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim() || !author.trim()) {
      setError('제목과 저자를 입력해 주세요.')
      return
    }

    setError('')

    let createdBook

    try {
      const response = await fetch('http://localhost:3000/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          author: author.trim(),
          content: content.trim(),
          //coverImageUrl,
        })
      })

      const createdBook = await response.json();
      onCreated(createdBook);

    } catch {
      setError('도서를 등록하지 못했습니다. 서버 연결을 확인해 주세요.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>새 도서 등록</h1>

      <div>
        <label>
          제목
          <input
            required
            value={title}
            onChange={event => setTitle(event.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          저자
          <input
            required
            value={author}
            onChange={event => setAuthor(event.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          내용
          <textarea
            rows={4}
            value={content}
            onChange={event => setContent(event.target.value)}
          />
        </label>
      </div>


      <div>
        <button type="submit" >
          작성
        </button>
      </div>
    </form>
  )
}

export default BookCreatePage;