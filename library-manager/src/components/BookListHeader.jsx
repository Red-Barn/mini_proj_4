import SortSelect from './SortSelect';

// "전체 도서 총 N개" + 정렬 드롭다운
function BookListHeader({total}) {
  return (
    <div className="book-list-header">
      <h2 className="book-list-title">전체 도서 
        <span className="book-list-count">총 {total}개</span>
      </h2>
      <SortSelect />
    </div>
  )
}
export default BookListHeader