const OPENAI_URL = "https://api.openai.com/v1/images/generations";

function createCoverPrompt(title, content) {
  return `
다음 도서의 정보를 분석하여 책의 내용과 분위기에 어울리는 표지 이미지를 생성해주세요.

도서 제목: ${title}
도서 내용: ${content}

다음 사항을 분석하여 이미지에 반영해주세요.
- 작품의 장르와 전체적인 분위기
- 이야기의 배경과 주요 장면
- 등장인물의 감정과 작품의 핵심 메시지
- 작품을 상징적으로 표현할 수 있는 시각적 요소

이미지 생성 요구사항:
1. 책의 내용과 감정을 시각적으로 표현해주세요.
2. 작품의 특징이 드러나도록 색상, 구도, 분위기를 구성해주세요.
3. 독자의 관심을 끌 수 있는 창의적이고 완성도 높은 표지를 제작해주세요.
4. 세로형 책 표지 비율로 제작해주세요.
5. 실제 출판물에 사용할 수 있을 정도의 높은 디자인 품질을 유지해주세요.
6. 이미지에는 제목, 글자, 문자 등의 텍스트를 포함하지 마세요.
`;
}

// apiKey를 매개변수로 받도록 변경
export async function generateCover(title, content, apiKey) {
  if (!apiKey?.trim()) {
    throw new Error("OpenAI API 키를 입력해주세요.");
  }
  if (!title?.trim() || !content?.trim()) {
    throw new Error("제목과 내용을 입력해주세요.");
  }

  const prompt = createCoverPrompt(title, content);

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: "gpt-image-2",
      prompt: prompt,
      n: 3,
      size: "1024x1536",
      quality: "medium",
      output_format: "png"
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenAI 이미지 생성 실패");
  }

  const images = data.data.map((image) => `data:image/png;base64,${image.b64_json}`);

  if (images.length !== 3) {
    throw new Error("이미지 3개를 받지 못했습니다.");
  }

  return images;
}

// 상세 페이지 등에서 bookId가 이미 있을 때 바로 저장하는 용도로 유지
export async function saveCover(bookId, imageUrl) {
  const response = await fetch(`http://localhost:3000/books/${bookId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      coverImageUrl: imageUrl,
      updatedAt: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new Error("표지 저장 실패");
  }

  return await response.json();
}