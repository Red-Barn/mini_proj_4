import { useState, useEffect } from 'react'

import BookListHeader from '../components/BookListHeader'
import BookGrid from '../components/BookGrid'
import Pagination from '../components/Pagination'
import './BookListPage.css'

function BookListPage() {
  const [books, setBooks] = useState([
    {
      "id": "1",
      "title": "별빛 아래의 서점",
      "author": "홍길동",
      "content": "밤에만 문을 여는 작은 서점. 책 사이에 남겨진 편지를 따라 잊고 있던 꿈을 찾아가는 이야기.",
      "coverImageUrl": "",
      "createdAt": "2026-11-20T09:00:00.000Z",
      "updatedAt": "2026-11-20T09:00:00.000Z"
    },
    {
      "id": "2",
      "title": "바다를 걷는 고양이",
      "author": "이바다",
      "content": "푸른 바닷가 마을의 고양이가 사라진 등대의 빛을 찾아 떠나는 작은 모험.",
      "coverImageUrl": "",
      "createdAt": "2026-11-19T09:00:00.000Z",
      "updatedAt": "2026-11-20T09:00:00.000Z"
    },
    {
      "id": "3",
      "title": "시간을 담은 우체통",
      "author": "박여름",
      "content": "과거의 나에게 보낸 편지가 돌아왔다. 오래된 우체통에서 시작되는 따뜻한 이야기.",
      "coverImageUrl": "",
      "createdAt": "2026-11-18T09:00:00.000Z",
      "updatedAt": "2026-11-19T09:00:00.000Z"
    },
    {
      "id": "4",
      "title": "숲의 가장 깊은 곳",
      "author": "김초록",
      "content": "지도에 없는 숲에서 만난 낯선 정원과 그곳을 지키는 사람들의 기록.",
      "coverImageUrl": "",
      "createdAt": "2026-11-17T09:00:00.000Z",
      "updatedAt": "2026-11-18T09:00:00.000Z"
    }
  ])

  return(
    <section className="book-list-page">
        <BookListHeader total={books.length}/>
        <BookGrid books={books}/>
        <Pagination />
    </section>
  )
}
export default BookListPage