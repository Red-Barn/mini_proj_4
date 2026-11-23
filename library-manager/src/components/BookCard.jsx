import { Link } from 'react-router-dom';
import BookCover from './BookCover';
import FavoriteButton from './FavoriteButton';
import { useFavorites } from './useFavorites';

// 도서 카드 1개: 표지 + 제목 + 저자. 클릭하면 상세 페이지로 이동
function BookCard({book}) {
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <Link to={`/books/${book.id}`} className="book-card">
        <BookCover src={book.coverImageUrl} alt={`${book.title} 표지`}/>

        <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <h3 className="book-card-title" style={{ margin: 0 }}>{book.title}</h3>
        <FavoriteButton
          isFavorite={isFavorite(book.id)}
          onToggle={() => toggleFavorite(book.id)}
        />
      </div>
        <p className="book-card-author">{book.author}</p>
    </Link>
  );
}
export default BookCard;