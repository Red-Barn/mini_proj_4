import { Link } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';
import { useFavorites } from './useFavorites';
import './BookList.css';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('ko-KR');
}

function BookList({ books }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!books || books.length === 0) {
    return <p className="book-list-empty">표시할 도서가 없습니다.</p>;
  }

  return (
    <div className="book-list-wrapper">
      <table className="book-list-table">
        <thead>
          <tr>
            <th className="book-list-fav-col">즐겨찾기</th>
            <th>제목</th>
            <th>저자</th>
            <th>등록일</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td className="book-list-fav-cell">
                <FavoriteButton
                  isFavorite={isFavorite(book.id)}
                  onToggle={() => toggleFavorite(book.id)}
                  size={20}
                />
              </td>
              <td className="book-list-title-cell">
                <Link to={`/books/${book.id}`}>
                  {book.title || '제목 없음'}
                </Link>
              </td>
              <td>{book.author || '저자 미상'}</td>
              <td>{formatDate(book.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BookList;