import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { generateCover, saveCover } from '../services/coverApi'
import '../css/CoverGeneratePage.css'

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
  const [quality, setQuality] = useState('medium')
  const [customPrompt, setCustomPrompt] = useState('')
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
      const result = await generateCover(formData.title, formData.content, apiKey, {
        quality,
        customPrompt
      })
      setImages(result)
    } catch (err) {
      setError(err.message || '이미지 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleApply() {
    if (!selectedImage) return

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

        <label htmlFor="cover-quality">이미지 품질</label>
        <select
          id="cover-quality"
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          disabled={loading || saving}
        >
          <option value="low">낮음 (빠름 / 저비용)</option>
          <option value="medium">보통 (기본값)</option>
          <option value="high">높음 (느림 / 고비용)</option>
        </select>

        <label htmlFor="custom-prompt" style={{ width: '100%' }}>
          추가 프롬프트 (선택)
        </label>
        <textarea
          id="custom-prompt"
          rows={3}
          placeholder="예: 따뜻한 수채화 화풍, 새벽녘 숲속 분위기, 미니멀한 구도"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          disabled={loading || saving}
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        />

        <button type="submit" disabled={loading || saving}>
          {loading ? '표지 생성 중...' : '표지 3장 생성하기'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {(existingCover || images.length > 0) && (
        <div className="cover-candidates">
          {existingCover && (
            <button
              type="button"
              onClick={() => setSelectedImage(existingCover)}
              style={{
                border: selectedImage === existingCover ? '3px solid #2563eb' : '1px solid #d1d5db'
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
                border: selectedImage === imgUrl ? '3px solid #2563eb' : '1px solid #d1d5db'
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