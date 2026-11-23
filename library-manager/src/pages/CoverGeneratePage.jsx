import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { generateCover, saveCover } from '../services/coverApi'
import './CoverGeneratePage.css'
export default function CoverGeneratePage() {
  const location = useLocation()
  const navigate = useNavigate()

  const bookId = location.state?.bookId ?? null
  const returnTo = location.state?.returnTo || '/'
  const formData = location.state?.formData || {
    title: '',
    author: '',
    content: '',
    coverImageUrl: ''
  }

  const existingCover = formData.coverImageUrl || ''

  const [apiKey, setApiKey] = useState('')
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(existingCover)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setImages([])
    setSelectedImage(existingCover)

    try {
      const result = await generateCover(formData.title, formData.content, apiKey)
      setImages(result)
    } catch (err) {
      setError(err.message || '이미지 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleApply() {
    if (!selectedImage) return

    // 상세 페이지에서 진입했고, 기존 표지와 다른 이미지를 선택한 경우 DB에 저장
    if (bookId != null && selectedImage !== existingCover) {
      setSaving(true)
      setError('')
      try {
        await saveCover(bookId, selectedImage)
        navigate(returnTo)
      } catch (err) {
        setError(err.message || '표지 저장 중 오류가 발생했습니다.')
      } finally {
        setSaving(false)
      }
      return
    }

    // 기존 표지를 그대로 유지했거나 bookId가 없는 경우 그대로 복귀
    navigate(returnTo, {
      state: {
        formData: {
          ...formData,
          coverImageUrl: selectedImage
        }
      }
    })
  }

  return (
    <section className="cover-generate-page">
      <h1>AI 표지 생성</h1>
      <p>대상 도서: <strong>{formData.title || '제목 없음'}</strong></p>

      <form onSubmit={handleGenerate}>
        <label htmlFor="openai-key">OpenAI API Key</label>
        <input
          id="openai-key"
          type="password"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          autoComplete="off"
          required
        />
        <button type="submit" disabled={loading || saving}>
          {loading ? '표지 생성 중...' : '표지 3장 생성하기'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {(existingCover || images.length > 0) && (
        <div
          className="cover-candidates"
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '16px 0' }}
        >
          {existingCover && (
            <button
              type="button"
              onClick={() => setSelectedImage(existingCover)}
              style={{
                border: selectedImage === existingCover ? '3px solid #2563eb' : '1px solid #d1d5db',
                padding: '6px'
              }}
            >
              <div style={{ marginBottom: '4px', fontSize: '0.8rem' }}>기존 표지</div>
              <img src={existingCover} alt="기존 도서 표지" width="180" />
            </button>
          )}

          {images.map((imgUrl, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(imgUrl)}
              style={{
                border: selectedImage === imgUrl ? '3px solid #2563eb' : '1px solid #d1d5db',
                padding: '6px'
              }}
            >
              <div style={{ marginBottom: '4px', fontSize: '0.8rem' }}>신규 후보 {index + 1}</div>
              <img src={imgUrl} alt={`생성된 표지 후보 ${index + 1}`} width="180" />
            </button>
          ))}
        </div>
      )}

      <div>
        <button
          type="button"
          disabled={saving}
          onClick={() => navigate(returnTo)}
        >
          취소
        </button>
        <button
          type="button"
          disabled={!selectedImage || saving}
          onClick={handleApply}
        >
          {saving
            ? '저장 중...'
            : selectedImage === existingCover
              ? '기존 표지 유지'
              : '선택한 표지 적용'}
        </button>
      </div>
    </section>
  )
}