
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import './BookDetailPage.css'
import { generateCover } from '../services/coverApi'

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

  // AI 이미지 생성 관련 상태
  const [aiLoading, setAiLoading] = useState(false)
  const [generatedImages, setGeneratedImages] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)

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

  // AI 표지 이미지 3개 생성
  async function handleGenerateCover(book) {
    setAiLoading(true)
    setGeneratedImages([])
    setIsModalOpen(false)
    setIsErrorModalOpen(false)

    try {
      const images = await generateCover(book.title, book.content)

      if (!Array.isArray(images) || images.length !== 3 || images.some(image => !image)) {
        throw new Error('이미지 생성 실패')
      }

      setGeneratedImages(images)
      setIsModalOpen(true)

    } catch (error) {
      console.error('AI 이미지 생성 실패:', error)
      setIsErrorModalOpen(true)

    } finally {
      setAiLoading(false)
    }
  }

  // 선택한 이미지를 현재 페이지 표지에 반영
  function handleSelectImage(image) {
    setResource(prev => ({
      ...prev,
      book: {
        ...prev.book,
        coverImageUrl: image
      }
    }))

    setIsModalOpen(false)
  }

  const { status, book, message } = resource

  return (
    <>
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
                className="bd-button bd-primary bd-cover-action"
                onClick={() => handleGenerateCover(book)}
                disabled={aiLoading}
              >
                {aiLoading ? 'AI 표지 생성 중...' : '✧ AI 표지 생성'}
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
              className="bd-button bd-secondary"
              disabled={deleting}
              onClick={() => deleteDialog.current.close()}
            >
              취소
            </button>

            <button
              className="bd-button bd-danger"
              disabled={deleting}
              onClick={deleteBook}
            >
              {deleting ? '삭제 중…' : '삭제'}
            </button>
          </div>
        </dialog>
      </section>

      {/* AI 표지 선택 팝업 */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="AI 표지 선택"
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '1100px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 style={{ marginBottom: '20px' }}>AI 표지 선택</h2>

            <div
              style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}
            >
              {generatedImages.map((image, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <img
                    src={image}
                    alt={`표지 후보 ${index + 1}`}
                    style={{
                      width: '220px',
                      height: '330px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      display: 'block',
                      marginBottom: '10px'
                    }}
                  />

                  <button
                    className="bd-button bd-primary"
                    onClick={() => handleSelectImage(image)}
                  >
                    이 이미지 선택
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                className="bd-button bd-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI 이미지 생성 실패 팝업 */}
      {isErrorModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ai-error-title"
            style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
            }}
          >
            <h2
              id="ai-error-title"
              style={{
                marginBottom: '20px',
                color: '#dc2626'
              }}
            >
              오류. 이미지 생성실패
            </h2>

            <button
              className="bd-button bd-primary"
              style={{
                backgroundColor: '#00782e',
                color: '#ffffff',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '6px',
                cursor: 'pointer',
                opacity: 1,
                visibility: 'visible'
              }}
              onClick={() => setIsErrorModalOpen(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  )
}
