import BookCard from './BookCard';

// 도서 카드를 4열 그리드로 배치
export default function BookGrid({books}) {
  return (
    <ul className="book-grid">
        {books.map((book) => (
            <li key={book.id} className="book-grid-item">
                <BookCard book={book} />
            </li>
        ))}
    </ul>
  );
}