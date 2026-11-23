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

  // results는 [[제목 결과], [내용 결과], [저자 결과]] 형태 → flat()으로 한 배열로
  const map = new Map()
  results.flat().forEach((book) => map.set(book.id, book))

  // id 순으로 정렬
  // 이후 정렬 방법에 따라 바꿔야 함
  return [...map.values()].sort((a, b) => Number(a.id) - Number(b.id))
}
export {searchBooks}