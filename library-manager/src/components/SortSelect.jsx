const SORT_OPTIONS = [
  { value: 'latest', label: '최신 등록순' },
  { value: 'updated', label: '최근 수정순' },
  { value: 'title', label: '제목순' },
];

// 정렬 드롭다운
function SortSelect() {
  return (
    <select aria-label="정렬 기준" defaultValue='title'>
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
export default SortSelect