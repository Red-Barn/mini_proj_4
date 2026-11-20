import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { generateCover } from '../services/coverApi'

export default function CoverGeneratePage() {
  const location = useLocation()
  const navigate = useNavigate()

  // 글 추가/수정 페이지에서 넘겨받은 데이터
  const returnTo = location.state?.returnTo || '/books/new'
  const formData = location.state?.formData || { title: '', author: '', content: '', coverImageUrl: '' }

  const [apiKey, setApiKey] = useState('')
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setImages([])
    setSelectedImage('')

    try {
      const result = await generateCover(formData.title, formData.content, apiKey)
      setImages(result)
    } catch (err) {
      setError(err.message || '이미지 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function handleApply() {
    if (!selectedImage) return
    // 선택한 표지를 formData에 합쳐서 원래 페이지(추가 또는 수정)로 복귀
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
        <button type="submit" disabled={loading}>
          {loading ? '표지 생성 중...' : '표지 3장 생성하기'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {images.length > 0 && (
        <div className="cover-candidates">
          {images.map((imgUrl, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(imgUrl)}
              style={{
                border: selectedImage === imgUrl ? '3px solid #2563eb' : '1px solid #d1d5db'
              }}
            >
              <img src={imgUrl} alt={`생성된 표지 후보 ${index + 1}`} width="180" />
            </button>
          ))}
        </div>
      )}

      <div>
        <button type="button" onClick={() => navigate(returnTo, { state: { formData } })}>
          취소
        </button>
        <button type="button" disabled={!selectedImage} onClick={handleApply}>
          선택한 표지 적용
        </button>
      </div>
    </section>
  )
}