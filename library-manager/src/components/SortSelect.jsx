export const SORT_OPTIONS = [
  { value: 'latest', label: '최신 등록순', field: 'createdAt', order: 'desc' },
  { value: 'updated', label: '최근 수정순', field: 'updatedAt', order: 'desc' },
  { value: 'title', label: '제목순', field: 'title', order: 'asc' },
];

// 정렬 드롭다운
function SortSelect({value, onChange}) {
  return (
    <select
      className="sort-select"
      aria-label="정렬 기준"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
export default SortSelect