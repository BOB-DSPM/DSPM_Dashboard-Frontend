# DSPM Dashboard

이 프로젝트는 보안 지표, 인벤토리, 알림, 정책, 데이터 흐름(Lineage)을 시각화하는 **React 기반 대시보드**입니다.  
차트는 **Recharts**, 아이콘은 **Lucide React**를 사용했습니다.

---

## 기능

- Overview 탭: 주요 지표(Security Score, Total Assets, Active Alerts, Compliance) 표시
- Inventory 탭: 데이터 리소스 목록
- Alerts 탭: 최근 보안 알림
- Policies 탭: 정책 준수 상태
- Lineage 탭: 데이터 흐름 시각화
- 검색(Search) 및 필터(Filter) 기능
- Recharts 기반 반응형 차트

---

## 기술 스택

- React (Functional Component + Hooks)
- Recharts (BarChart, PieChart, AreaChart 등)
- Lucide React (아이콘)
- Tailwind CSS (스타일링)

---

## 시작하기

### 사전 준비

**Node.js**와 **npm**이 설치되어 있어야 합니다.

```bash
node -v
npm -v

###설치

레포지토리 클론:

git clone <YOUR_REPO_URL>
cd <YOUR_REPO_DIRECTORY>

의존성 설치:

npm install
package.json에 react, recharts, lucide-react, tailwindcss가 포함되어 있어야 합니다.

###대시보드 실행
npm start

http://localhost:3000 에서 실행
