import { Link } from 'react-router-dom';
import BookCover from './BookCover';

// 도서 카드 1개: 표지 + 제목 + 저자. 클릭하면 상세 페이지로 이동
function BookCard({book}) {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
        <BookCover src={book.coverImageUrl} alt={`${book.title} 표지`}/>
        <h3 className="book-card-title">{book.title}</h3>
        <p className="book-card-author">{book.author}</p>
    </Link>
  )
}
export default BookCard