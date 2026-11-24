export const PAGE_SIZE_OPTIONS = [
  { value: 8, label: '8개씩 보기' },
  { value: 12, label: '12개씩 보기' },
  { value: 16, label: '16개씩 보기' },
  { value: 20, label: '20개씩 보기' },
];

// 한 페이지에 보여줄 개수 드롭다운
function PageSizeSelect({value, onChange}) {
  return (
    <select 
      className="list-select" 
      aria-label="보기 개수"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      >
      {PAGE_SIZE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
export default PageSizeSelect
