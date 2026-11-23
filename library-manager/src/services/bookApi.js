const BASE_URL = 'http://localhost:3000/books'
const SEARCH_FIELDS = ['title', 'content', 'author']

// _like는 정규식으로 처리되므로 특수문자를 이스케이프해야 함
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 파라미터 : 검색어, 컨트롤러
async function searchBooks(keyword, signal) {
  // 특수문자 제거 후 URL로 변경
  const pattern = encodeURIComponent(escapeRegex(keyword))

  // 필드마다 요청을 만들어 동시에 보냄
  const responses = await Promise.all(
    SEARCH_FIELDS.map((field) =>
      fetch(`${BASE_URL}?${field}_like=${pattern}`, { signal })
    )
  )
  if (responses.some((res) => !res.ok)) throw new Error('검색 요청 실패')

  const results = await Promise.all(responses.map((res) => res.json()))

  // 중복 제거를 위해 Map사용
  const map = new Map()
  // results는 [[제목 결과], [내용 결과], [저자 결과]] 형태 → flat()으로 한 배열로
  results.flat().forEach((book) => map.set(book.id, book))
  return [...map.values()]
}
export {searchBooks}