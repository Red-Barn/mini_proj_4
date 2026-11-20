import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './BookDetailPage.css'

// 팀의 json-server 주소에 맞춰 .env의 VITE_API_BASE_URL을 설정합니다.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')

function formatDate(value) {
  if (!value) return '정보 없음'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '정보 없음' : date.toLocaleString('ko-KR')
}

export default function BookDetailPage({ setNotice }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resource, setResource] = useState({ status: 'loading', book: null, message: '' })
  const [retry, setRetry] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const deleteLock = useRef(false)
  const deleteController = useRef(null)
  const deleteDialog = useRef(null)
  const deleteButton = useRef(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadBook() {
      setResource({ status: 'loading', book: null, message: '' })
      setDeleteError('')

      try {
        const response = await fetch(`${API_BASE}/books/${encodeURIComponent(id)}`, {
          signal: controller.signal
        })

        if (response.status === 404) {
          setResource({
            status: 'not-found',
            book: null,
            message: '삭제되었거나 존재하지 않는 도서입니다.'
          })
          return
        }

        if (!response.ok) throw new Error('request failed')

        const book = await response.json()

        if (!book || typeof book !== 'object' || Array.isArray(book) || book.id == null) {
          throw new Error('invalid data')
        }

        if (!controller.signal.aborted) {
          setResource({ status: 'success', book, message: '' })
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setResource({
            status: 'error',
            book: null,
            message: '도서 정보를 불러오지 못했습니다. 서버 연결을 확인하고 다시 시도해 주세요.'
          })
        }
      }
    }

    loadBook()
    return () => controller.abort()
  }, [id, retry])

  useEffect(() => () => deleteController.current?.abort(), [])

  async function deleteBook() {
    if (deleteLock.current) return

    deleteLock.current = true
    setDeleting(true)
    setDeleteError('')

    const controller = new AbortController()
    deleteController.current = controller

    try {
      const response = await fetch(`${API_BASE}/books/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        signal: controller.signal
      })

      if (!response.ok && response.status !== 404) throw new Error('delete failed')

      deleteDialog.current?.close()
      setNotice?.(response.status === 404 ? '이미 삭제된 도서입니다.' : '도서가 삭제되었습니다.')
      navigate('/')
    } catch (error) {
      if (error.name !== 'AbortError') {
        setDeleteError('삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }
    } finally {
      deleteLock.current = false
      if (!controller.signal.aborted) setDeleting(false)
    }
  }

  function handleGoToCoverPage(book) {
    navigate('/books/cover', {
      state: {
        bookId: book.id,
        returnTo: `/books/${encodeURIComponent(id)}`,
        formData: {
          title: book.title || '',
          author: book.author || '',
          content: book.content || '',
          coverImageUrl: book.coverImageUrl || ''
        }
      }
    })
  }

  const { status, book, message } = resource

  return (
    <section className="book-detail-page" aria-labelledby="detail-title">
      <Link className="bd-back" to="/">← 도서 목록으로</Link>

      {status === 'loading' && (
        <div className="bd-state" role="status">
          <span className="bd-spinner" aria-hidden="true" />
          <h1 id="detail-title">도서 정보를 불러오는 중입니다</h1>
          <p>잠시만 기다려 주세요.</p>
        </div>
      )}

      {(status === 'error' || status === 'not-found') && (
        <div className="bd-state" role={status === 'error' ? 'alert' : 'status'}>
          <h1 id="detail-title">
            {status === 'not-found' ? '도서를 찾을 수 없어요' : '도서를 불러오지 못했어요'}
          </h1>
          <p>{message}</p>

          <div className="bd-actions">
            {status === 'error' && (
              <button
                className="bd-button bd-primary"
                onClick={() => setRetry(value => value + 1)}
              >
                다시 시도
              </button>
            )}

            <Link className="bd-button bd-secondary" to="/">
              목록으로 이동
            </Link>
          </div>
        </div>
      )}

      {status === 'success' && book && (
        <div className="bd-layout">
          <aside className="bd-cover-column" aria-label="도서 표지">
            <div className="bd-cover">
              <div className="bd-placeholder">
                <span>나의 서가</span>
                <strong>{book.title || '제목 없음'}</strong>
                <span>아직 등록된 표지가 없습니다</span>
              </div>

              {book.coverImageUrl && (
                <img
                  key={book.coverImageUrl}
                  src={book.coverImageUrl}
                  alt={`${book.title || '도서'} 표지`}
                  onError={event => {
                    event.currentTarget.hidden = true
                  }}
                />
              )}
            </div>

            <button
              type="button"
              className="bd-button bd-primary bd-cover-action"
              onClick={() => handleGoToCoverPage(book)}
            >
              AI 표지 생성
            </button>
          </aside>

          <div className="bd-information">
            <p className="bd-eyebrow">도서 상세</p>
            <h1 id="detail-title">{book.title || '제목 없음'}</h1>
            <p className="bd-author">{book.author || '저자 정보 없음'}</p>

            <dl className="bd-dates">
              <div>
                <dt>등록일</dt>
                <dd>{formatDate(book.createdAt)}</dd>
              </div>

              <div>
                <dt>수정일</dt>
                <dd>{formatDate(book.updatedAt)}</dd>
              </div>
            </dl>

            <section className="bd-story" aria-labelledby="story-title">
              <h2 id="story-title">책 소개</h2>
              <p>{book.content || '등록된 내용이 없습니다.'}</p>
            </section>

            <div className="bd-actions">
              <Link
                className="bd-button bd-primary"
                to={`/books/${encodeURIComponent(id)}/edit`}
              >
                도서 수정
              </Link>

              <button
                ref={deleteButton}
                type="button"
                className="bd-button bd-danger"
                onClick={() => {
                  setDeleteError('')
                  deleteDialog.current.showModal()
                }}
              >
                도서 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      <dialog
        ref={deleteDialog}
        className="bd-dialog"
        aria-labelledby="delete-title"
        aria-describedby="delete-description"
        onCancel={event => {
          if (deleteLock.current) event.preventDefault()
        }}
        onClose={() => deleteButton.current?.focus()}
      >
        <h2 id="delete-title">도서를 삭제할까요?</h2>
        <p id="delete-description">삭제한 도서는 복구할 수 없습니다.</p>

        {deleteError && (
          <p className="bd-error" role="alert">
            {deleteError}
          </p>
        )}

        <div className="bd-actions">
          <button
            autoFocus
            type="button"
            className="bd-button bd-secondary"
            disabled={deleting}
            onClick={() => deleteDialog.current.close()}
          >
            취소
          </button>

          <button
            type="button"
            className="bd-button bd-danger"
            disabled={deleting}
            onClick={deleteBook}
          >
            {deleting ? '삭제 중…' : '삭제'}
          </button>
        </div>
      </dialog>
    </section>
  )
}