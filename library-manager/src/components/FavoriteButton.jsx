export default function FavoriteButton({ isFavorite, onToggle, size = 20 }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    onToggle();
  };

  // 숫자나 '32px' 문자열 모두 숫자로 변환
  const numericSize = typeof size === 'string' ? parseInt(size, 10) || 20 : size;
  
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'auto',
        height: 'auto',
        minWidth: 'unset',
        minHeight: 'unset',
        flexShrink: 0,
        transition: 'transform 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <svg
        width={numericSize}
        height={numericSize}
        viewBox="0 0 24 24"
        fill={isFavorite ? '#FACC15' : 'none'}
        stroke={isFavorite ? '#FACC15' : '#9CA3AF'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          display: 'block',
          width: `${numericSize}px`,
          height: `${numericSize}px`,
          minWidth: `${numericSize}px`,
          minHeight: `${numericSize}px`,
          maxWidth: `${numericSize}px`,
          maxHeight: `${numericSize}px`,
        }}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}