# 📈 InvestKit — 장기 투자 시뮬레이터

> 토스증권 Open API 연동을 준비하는 장기 적립식 투자 시뮬레이터

## 🌐 사이트 바로가기
**https://[내 깃허브 아이디].github.io/investment-simulator**

---

## ✨ 기능

| 기능 | 설명 |
|------|------|
| 📊 수익 시뮬레이터 | 납입금·수익률 설정 후 1/3/5/10년 예상 자산 계산 |
| 🥧 포트폴리오 파이차트 | 선택 종목 비중 시각화 |
| ⚠️ 리스크 등급 | 종목별 리스크(낮음/중간/높음) 표시 |
| 📅 월별 납입 달력 | 매수일 설정 및 달력 표시 |
| ✅ 체크리스트 | 이달 종목별 매수 체크리스트 |
| 🎯 목표 달성일 | 목표 금액 달성 예상 월 자동 계산 |
| 📈 시나리오 비교 | 보수적/중립/낙관 3가지 10년 비교 |

---

## 📦 종목 탭

- **미국 ETF** : TIGER 미국S&P500, TIGER 미국나스닥100
- **국내 ETF** : TIGER 반도체, KODEX 고배당
- **국내 개별주** : 삼성전자, SK하이닉스
- **미국 개별주** : 테슬라(TSLA), 엔비디아(NVDA)
- **기타** : 스타벅스(SBUX), SOXL

---

## 🚀 GitHub Pages 배포 방법

### 1단계 — 레포지토리 생성
1. GitHub 접속 → **New repository**
2. Repository name: `investment-simulator`
3. **Public** 선택 → **Create repository**

### 2단계 — 파일 업로드
```bash
# 터미널에서
git init
git add .
git commit -m "첫 배포: InvestKit 투자 시뮬레이터"
git branch -M main
git remote add origin https://github.com/[내아이디]/investment-simulator.git
git push -u origin main
```

### 3단계 — GitHub Pages 활성화
1. 레포지토리 → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / Folder: **/ (root)**
4. **Save** 클릭

### 4단계 — 완료!
약 1~2분 후 `https://[내아이디].github.io/investment-simulator` 접속 가능

---

## 🔜 토스증권 API 연동 계획 (출시 후)

```
현재 (시뮬레이션 모드)
  └─ index.html만으로 동작

출시 후 추가 예정
  ├─ api/toss_trade.py      # 자동 매수/매도 스크립트
  ├─ api/portfolio_sync.py  # 잔고 → 대시보드 연동
  ├─ .github/workflows/
  │   └─ auto_trade.yml     # GitHub Actions 스케줄러 (매월 N일 자동 실행)
  └─ notify/telegram_bot.py # 체결 알림
```

---

## ⚠️ 면책 조항

이 사이트는 투자 정보 제공 목적으로 제작되었습니다.  
투자 권유가 아니며, 모든 투자 결정과 손익 책임은 본인에게 있습니다.
