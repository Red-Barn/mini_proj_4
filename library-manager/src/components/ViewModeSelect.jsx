const VIEW_MODE_OPTIONS = [
  { value: 'grid', label: '카드형' },
  { value: 'list', label: '목록형' },
];

// 보기 형식 드롭다운
function ViewModeSelect() {
  return (
    <select className="list-select" aria-label="보기 형식" defaultValue='grid'>
      {VIEW_MODE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
export default ViewModeSelect
