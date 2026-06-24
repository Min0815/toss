"""
토스증권 API 연결 테스트 - 응답 상세 출력
"""
import sys
import os
import json
import base64
import requests

def main():
    print("=" * 50)
    print("  토스증권 Open API 연결 테스트")
    print("=" * 50)

    app_key = os.environ.get("TOSS_APP_KEY")
    app_secret = os.environ.get("TOSS_APP_SECRET")

    if not app_key or not app_secret:
        print("❌ 환경변수 없음: TOSS_APP_KEY / TOSS_APP_SECRET")
        sys.exit(1)
    print(f"\n[1] 환경변수 확인 OK")
    print(f"    APP_KEY 앞 6자리: {app_key[:6]}...")

    # ── 토큰 발급 ──
    print("\n[2] 토큰 발급 시도...")
    credentials = base64.b64encode(f"{app_key}:{app_secret}".encode()).decode()

    try:
        res = requests.post(
            "https://openapi.tossinvest.com/oauth2/token",
            headers={
                "Authorization": f"Basic {credentials}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={"grant_type": "client_credentials"},
            timeout=10,
        )
        print(f"    HTTP 상태코드: {res.status_code}")
        print(f"    응답 전체: {res.text}")

        if res.status_code != 200:
            print("❌ 토큰 발급 실패")
            sys.exit(1)

        body = res.json()
        token = body.get("access_token")
        print(f"    토큰 앞 20자: {token[:20]}...")

    except Exception as e:
        print(f"❌ 토큰 발급 예외: {e}")
        sys.exit(1)

    # ── 시세 조회 ──
    print("\n[3] 삼성전자(005930) 시세 조회...")
    try:
        res2 = requests.get(
            "https://openapi.tossinvest.com/v1/market/price",
            headers={"Authorization": f"Bearer {token}"},
            params={"stockCode": "005930"},
            timeout=10,
        )
        print(f"    HTTP 상태코드: {res2.status_code}")
        print(f"    응답 전체:\n{json.dumps(res2.json(), ensure_ascii=False, indent=2)}")

    except Exception as e:
        print(f"❌ 시세 조회 예외: {e}")
        sys.exit(1)

    print("\n✅ 테스트 완료")

if __name__ == "__main__":
    main()
