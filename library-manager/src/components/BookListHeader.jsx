import SortSelect from './SortSelect';
import ViewModeSelect from './ViewModeSelect';
import PageSizeSelect from './PageSizeSelect';

// "전체 도서 총 N개" + 정렬 / 보기 형식 / 보기 개수 드롭다운
function BookListHeader({total, itemsPerPage, onItemsPerPageChange}) {
  return (
    <div className="book-list-header">
      <h2 className="book-list-title">전체 도서 
        <span className="book-list-count">총 {total}개</span>
      </h2>
      <div className="book-list-controls">
        <SortSelect />
        <ViewModeSelect />
        <PageSizeSelect 
          value={itemsPerPage}
          onChange={onItemsPerPageChange}
        />
      </div>
    </div>
  )
}
export default BookListHeader