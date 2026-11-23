# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## 양태호 담당 — 2일차 상세 조회 및 삭제

### 실행
`library-manager` 폴더에서 터미널 두 개를 열어 각각 실행합니다.

```powershell
npx.cmd json-server --watch db.json --port 3000
```

```powershell
npm.cmd run dev
```

두 서버를 모두 유지하고 Vite가 출력한 Local 주소를 엽니다.
상세 API 기본 주소는 `http://localhost:3000`이며 `VITE_API_BASE_URL`로 변경할 수 있습니다.
목록 등 다른 페이지의 API 설정과 같은 주소를 사용해야 합니다.

### 상세 API 명세
| 메서드 | 경로 | 기능 | 처리 |
|---|---|---|---|
| GET | /books/:id | 단일 도서 조회 | 제목·저자·본문·표지·등록일·수정일 표시 |
| DELETE | /books/:id | 도서 삭제 | 사용자 확인 후 실행, 성공 시 목록으로 이동하고 완료 안내 |

- GET 요청 중 로딩, 404 시 존재하지 않는 도서 안내, 기타 실패 시 재시도 버튼을 표시합니다.
- URL id 변경 또는 화면 이탈 시 이전 조회를 취소해 오래된 응답 반영을 막습니다.
- 표지가 없거나 이미지 로딩이 실패하면 기본 표지를 표시합니다.
- 수정 버튼은 `/books/:id/edit`로 이동합니다.
- 삭제 취소 시 요청하지 않습니다. 삭제 중 중복 클릭과 모달 닫기를 방지합니다.
- DELETE 실패 시 확인창을 유지하고 오류를 안내합니다. 404는 이미 삭제된 것으로 처리합니다.
- 삭제 후 목록 페이지가 마운트되며 도서 목록을 다시 조회합니다.
- 성공 안내는 닫기 버튼으로 해제합니다.

### QA 범위
실제 조회, 없는 id, 수정 링크, 삭제 취소, 테스트 도서 삭제 및 목록 반영을 확인합니다.
서버 장애·느린 응답 등 미검증 항목은 완료로 표시하지 않습니다.
AI 생성·표지 영구 저장은 3일차 연동 범위로 별도 관리합니다.

### 2026-11-23 검증 결과
- 빌드 및 App.jsx / BookDetailPage.jsx ESLint 통과.
- 실제 도서 상세 조회와 수정 링크 경로 확인.
- QA 전용 도서 생성 → 삭제 취소 → 상세 유지 확인.
- QA 전용 도서 삭제 → 버튼 비활성화 → 목록 복귀 및 삭제 완료 안내 확인.
- 목록 재조회에서 QA 전용 도서 제거 확인.
- 삭제된 id 재접근 시 도서 없음 안내 확인.
- 서버 장애에 따른 조회 재시도·삭제 실패, 모바일 레이아웃은 이번 검증에서 미수행.

### 상세 페이지 오류 처리 추가 QA (2026-11-23)
- 별도 QA 서버에서 실제 상세 페이지 코드를 실행하고 API 오류를 재현했습니다.
- GET /books/1에 HTTP 503 응답: 조회 실패 안내 및 다시 시도 버튼 표시 확인.
- GET 응답 정상 복구 후 같은 화면에서 다시 시도: 오류 안내가 사라지고 실제 도서 정보가 표시됨을 확인.
- DELETE /books/1에 HTTP 503 응답: 삭제 확인창 유지, 오류 안내, 취소·삭제 버튼 재활성화 확인.
- 실패 후 취소: 상세 화면 유지 확인.
- QA 서버가 실제 DELETE 전달을 차단했으며 운영 중인 로컬 DB를 수정하지 않았습니다.
- HTTP 오류에 대한 UI 검증 결과입니다. 연결 끊김·타임아웃·모바일 검증은 별도입니다.
- 두 항목 모두 기존 코드로 통과하여 기능 코드 수정은 하지 않았습니다.
