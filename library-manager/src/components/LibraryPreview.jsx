import { useRef, useState } from 'react'

const samples = [
  { id: '1', title: '별빛 아래의 서점', author: '홍길동', content: '밤에만 문을 여는 작은 서점. 책 사이에 남겨진 편지를 따라 잊고 있던 꿈을 찾아가는 이야기.', createdAt: '2026-11-20', updatedAt: '2026-11-20', cover: 0 },
  { id: '2', title: '바다를 걷는 고양이', author: '이바다', content: '푸른 바닷가 마을의 고양이가 사라진 등대의 빛을 찾아 떠나는 작은 모험.', createdAt: '2026-11-19', updatedAt: '2026-11-20', cover: 1 },
  { id: '3', title: '시간을 담은 우체통', author: '박여름', content: '과거의 나에게 보낸 편지가 돌아왔다. 오래된 우체통에서 시작되는 따뜻한 이야기.', createdAt: '2026-11-18', updatedAt: '2026-11-19', cover: 2 },
  { id: '4', title: '숲의 가장 깊은 곳', author: '김초록', content: '지도에 없는 숲에서 만난 낯선 정원과 그곳을 지키는 사람들의 기록.', createdAt: '2026-11-17', updatedAt: '2026-11-18', cover: 3 },
]
const emptyForm = { title: '', author: '', content: '' }

function Cover({ book, variant = book.cover, small = false }) {
  return <div className={`book-cover cover-${variant} ${small ? 'cover-small' : ''}`} aria-label={`${book.title} 표지 시안`}>
    <span className="cover-label">STORY COLLECTION</span><span className="cover-orbit" />
    <strong>{book.title}</strong><span className="cover-author">{book.author || '저자 미입력'}</span>
    <span className="cover-bottom">A NEW CHAPTER BEGINS</span>
  </div>
}

export default function LibraryPreview() {
  const [books, setBooks] = useState(samples)
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('createdAt')
  const [favorites, setFavorites] = useState([])
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState('')
  const [choice, setChoice] = useState(null)
  const [round, setRound] = useState(0)
  const dialogRef = useRef(null)
  const book = books.find(item => item.id === selected)
  const filtered = books.filter(item => `${item.title} ${item.content}`.toLowerCase().includes(query.toLowerCase()) && (!onlyFavorites || favorites.includes(item.id)))
    .sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title, 'ko') : b[sort].localeCompare(a[sort]) || b.id.localeCompare(a.id))
  const pageCount = Math.max(1, Math.ceil(filtered.length / 12))
  const currentPage = Math.min(page, pageCount)
  const visible = filtered.slice((currentPage - 1) * 12, currentPage * 12)

  function toggleFavorite(id) {
    setFavorites(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id])
  }
  function openForm(item) {
    setSelected(item?.id || null)
    setForm(item ? { title: item.title, author: item.author, content: item.content } : emptyForm)
    setView('form')
    setNotice('')
  }
  function save(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.content.trim()) { setNotice('제목과 내용을 공백 없이 입력해 주세요.'); return }
    const values = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]))
    const date = new Date().toISOString()
    const id = selected || String(Date.now())
    setBooks(items => selected ? items.map(item => item.id === selected ? { ...item, ...values, updatedAt: date } : item) : [...items, { ...values, id, createdAt: date, updatedAt: date, cover: 0 }])
    setSelected(id); setView('detail'); setNotice('시안에 반영했습니다. 새로고침하면 샘플 데이터로 돌아갑니다.')
  }
  function openCandidates() { setChoice(null); dialogRef.current.showModal() }

  return <div className="library-app">
    <header className="site-header"><a href="#" className="brand" onClick={event => { event.preventDefault(); setView('list') }}><span className="brand-icon">▤</span> 책결<span className="brand-sub">나만의 작은 도서관</span></a><span className="header-note">이야기를 모으고, 표지를 상상하세요.</span></header>
    <main className="main-shell">
      <div className="preview-banner"><span className="status-dot" /> 화면 시안 · 샘플 데이터 사용 <span>저장·즐겨찾기는 현재 화면에서만 유지되며, 실제 AI 생성은 연결 전입니다.</span></div>
      {notice && <div className="notice" role="status">{notice}</div>}
      {view === 'list' && <>
        <section className="page-heading"><div><p className="eyebrow">MY LIBRARY</p><h1>책마다, 새로운 세계.</h1><p className="page-description">소중한 이야기를 모아 나만의 서가를 완성해 보세요.</p></div><button className="btn btn-primary" onClick={() => openForm(null)}>＋ 도서 등록</button></section>
        <section className="toolbar" aria-label="도서 검색 및 정렬"><label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">제목 또는 내용 검색</span><input type="search" placeholder="제목이나 내용으로 책을 찾아보세요" value={query} onChange={event => { setQuery(event.target.value); setPage(1) }} /></label><label className="sort-field"><span className="sr-only">정렬 기준</span><select value={sort} onChange={event => { setSort(event.target.value); setPage(1) }}><option value="createdAt">등록일 최신순</option><option value="updatedAt">수정일 최신순</option><option value="title">제목 가나다순</option></select></label></section>
        <div className="list-meta"><p>나의 서가 <strong>{filtered.length}</strong><span>권의 이야기</span></p><label className="favorite-filter"><input type="checkbox" checked={onlyFavorites} onChange={event => { setOnlyFavorites(event.target.checked); setPage(1) }} />즐겨찾기만 보기</label></div>
        {visible.length ? <section className="book-grid" aria-label="도서 목록">{visible.map(item => <article className="book-card" key={item.id}><div className="cover-wrap"><button className="cover-link" onClick={() => { setSelected(item.id); setView('detail'); setNotice('') }} aria-label={`${item.title} 상세 보기`}><Cover book={item} /></button><button className="favorite-button" aria-label={`${item.title} 즐겨찾기`} aria-pressed={favorites.includes(item.id)} onClick={() => toggleFavorite(item.id)}>{favorites.includes(item.id) ? '★' : '☆'}</button></div><button className="title-link" onClick={() => { setSelected(item.id); setView('detail') }}>{item.title}</button><p className="book-author">{item.author}</p><p className="book-date">등록 {item.createdAt.slice(0, 10).replaceAll('-', '.')}</p></article>)}</section> : <section className="empty-state"><span>▤</span><h2>{query || onlyFavorites ? '조건에 맞는 책이 없어요' : '첫 번째 이야기를 등록해 보세요'}</h2><p>검색 조건을 바꾸거나 새로운 책을 추가해 보세요.</p><button className="btn btn-primary" onClick={() => openForm(null)}>도서 등록</button></section>}
        <nav className="pagination" aria-label="도서 목록 페이지"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="이전 페이지">‹</button>{Array.from({ length: pageCount }, (_, i) => <button key={i} aria-current={currentPage === i + 1 ? 'page' : undefined} onClick={() => setPage(i + 1)}>{i + 1}</button>)}<button disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} aria-label="다음 페이지">›</button></nav>
      </>}
      {view === 'detail' && book && <><button className="back-link" onClick={() => setView('list')}>← 서가로 돌아가기</button><section className="detail-layout"><div><Cover book={book} /><button className="btn btn-primary full-width" onClick={openCandidates}>✧ 표지 후보 살펴보기</button><p className="helper-text">현재는 디자인 후보 시안입니다.</p></div><div className="detail-content"><p className="eyebrow">BOOK DETAIL</p><h1>{book.title}</h1><p className="detail-author">{book.author}</p><div className="date-row"><span>등록 {book.createdAt.slice(0, 10)}</span><span>수정 {book.updatedAt.slice(0, 10)}</span></div><h2>책 이야기</h2><p className="story-content">{book.content}</p><div className="button-row"><button className="btn btn-primary" onClick={() => openForm(book)}>도서 수정</button><button className="btn btn-secondary" aria-pressed={favorites.includes(book.id)} onClick={() => toggleFavorite(book.id)}>{favorites.includes(book.id) ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기'}</button><button className="btn btn-danger" onClick={() => { if (window.confirm('이 도서를 시안에서 삭제할까요?')) { setBooks(items => items.filter(item => item.id !== book.id)); setView('list'); setNotice('시안에서 삭제했습니다.') } }}>삭제</button></div></div></section></>}
      {view === 'form' && <section className="form-shell"><button className="back-link" onClick={() => setView(selected ? 'detail' : 'list')}>← 돌아가기</button><p className="eyebrow">{selected ? 'EDIT YOUR STORY' : 'A NEW STORY'}</p><h1>{selected ? '도서 수정' : '새로운 책 등록'}</h1><p className="page-description">한 권의 이야기를 서가에 담아 주세요.</p><form onSubmit={save} className="book-form"><label>도서 제목 <span className="required">*</span><input required maxLength={100} value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="도서 제목을 입력하세요" /></label><label>저자<input maxLength={60} value={form.author} onChange={event => setForm({ ...form, author: event.target.value })} placeholder="저자 이름을 입력하세요 (선택)" /></label><label>도서 내용 <span className="required">*</span><textarea required rows={8} value={form.content} onChange={event => setForm({ ...form, content: event.target.value })} placeholder="줄거리나 소개를 입력하세요" /></label><p className="helper-text">* 필수 입력 항목 · 이 시안의 데이터는 서버에 저장되지 않습니다.</p><div className="button-row"><button type="button" className="btn btn-secondary" onClick={() => setView(selected ? 'detail' : 'list')}>취소</button><button type="submit" className="btn btn-primary">{selected ? '수정 반영' : '등록 미리보기'}</button></div></form></section>}
      <footer className="site-footer"><span>책결</span> 당신의 이야기가 머무는 곳.</footer>
    </main>
    <dialog ref={dialogRef} className="cover-dialog" aria-labelledby="cover-dialog-title"><div className="dialog-heading"><div><p className="eyebrow">COVER STUDIO</p><h2 id="cover-dialog-title">이야기에 어울리는 표지를 골라보세요</h2></div><button className="icon-button" aria-label="닫기" onClick={() => dialogRef.current.close()}>×</button></div><p className="page-description">실제 AI 이미지 대신 디자인 시안 3개를 표시합니다.</p><div className="candidate-options"><label>스타일<select><option>감성 일러스트</option><option>미니멀</option><option>수채화</option></select></label><label>품질<select><option>표준</option><option>고품질</option></select></label><span className="helper-text">API 연결 후 생성에 반영 예정</span></div><div className="candidate-grid">{book && [0, 1, 2].map(i => { const variant = (i + round) % 4; return <button key={i} className={`candidate ${choice === variant ? 'is-selected' : ''}`} aria-pressed={choice === variant} onClick={() => setChoice(variant)}><Cover book={book} variant={variant} small /><span>{choice === variant ? '✓ 선택됨' : `후보 ${i + 1}`}</span></button> })}</div><div className="dialog-actions"><button className="btn btn-secondary" onClick={() => { setRound(value => value + 1); setChoice(null) }}>다른 시안 보기</button><button className="btn btn-primary" disabled={choice === null} onClick={() => { setBooks(items => items.map(item => item.id === selected ? { ...item, cover: choice, updatedAt: new Date().toISOString() } : item)); dialogRef.current.close(); setNotice('선택한 표지 시안을 반영했습니다.') }}>선택한 표지 적용</button></div></dialog>
  </div>
}
