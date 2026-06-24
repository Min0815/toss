"""
토스증권 API 연결 테스트 - 정확한 엔드포인트
"""
import sys
import os
import json
import base64
import requests

BASE_URL = "https://openapi.tossinvest.com"

def main():
    print("=" * 50)
    print("  토스증권 Open API 연결 테스트")
    print("=" * 50)

    app_key = os.environ.get("TOSS_APP_KEY")
    app_secret = os.environ.get("TOSS_APP_SECRET")

    if not app_key or not app_secret:
        print("❌ 환경변수 없음")
        sys.exit(1)
    print(f"\n[1] 환경변수 확인 OK (키 앞 6자: {app_key[:6]}...)")

    # ── 토큰 발급 ──
    print("\n[2] 토큰 발급...")
    credentials = base64.b64encode(f"{app_key}:{app_secret}".encode()).decode()
    res = requests.post(
        f"{BASE_URL}/oauth2/token",
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={"grant_type": "client_credentials"},
        timeout=10,
    )
    print(f"    상태코드: {res.status_code}")
    if res.status_code != 200:
        print(f"    응답: {res.text}")
        sys.exit(1)

    token = res.json().get("access_token")
    expires_in = res.json().get("expires_in")
    print(f"    토큰 발급 OK (만료: {expires_in}초)")

    # ── 엔드포인트 후보 전부 시도 ──
    print("\n[3] 시세 엔드포인트 탐색...")
    endpoints = [
        ("/api/v1/stocks", {"symbols": "005930"}),
        ("/api/v1/quotes", {"symbol": "005930"}),
        ("/api/v1/market/stocks", {"symbols": "005930"}),
        ("/v1/stocks", {"symbols": "005930"}),
        ("/v1/quotes", {"symbol": "005930"}),
        ("/api/v2/stocks", {"symbols": "005930"}),
    ]

    for path, params in endpoints:
        try:
            r = requests.get(
                f"{BASE_URL}{path}",
                headers={"Authorization": f"Bearer {token}"},
                params=params,
                timeout=10,
            )
            print(f"\n  {path} → HTTP {r.status_code}")
            if r.status_code == 200:
                print(f"  ✅ 성공! 응답:\n{json.dumps(r.json(), ensure_ascii=False, indent=2)}")
            else:
                body = r.json()
                print(f"  응답: {body}")
        except Exception as e:
            print(f"  {path} → 예외: {e}")

    print("\n✅ 탐색 완료")

if __name__ == "__main__":
    main()
