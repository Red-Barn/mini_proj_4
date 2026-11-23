export default function FavoriteButton({ isFavorite, onToggle }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    onToggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "20px",
        lineHeight: 1,
        padding: "2px 4px",
        color: isFavorite ? "#FACC15" : "#9CA3AF", 
        flexShrink: 0, // 제목이 길어도 별 찌그러짐 방지
        transition: "transform 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {isFavorite ? "★" : "☆"}
    </button>
  );
}