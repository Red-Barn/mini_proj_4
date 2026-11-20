import SortSelect from './SortSelect';

// "전체 도서 총 N개" + 정렬 드롭다운
function BookListHeader({total}) {
  return (
    <div>
      <h2>전체 도서 <span>총 {total}개</span></h2>
      <SortSelect />
    </div>
  );
}
export default BookListHeader