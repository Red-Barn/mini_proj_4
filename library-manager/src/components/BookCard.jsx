import BookCover from './BookCover';

// 도서 카드 1개: 표지 + 제목 + 저자. 클릭하면 상세 페이지로 이동
function BookCard({book}) {
  return (
    <>
        <BookCover src={book.coverImageUrl}/>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
    </>
  )
}
export default BookCard