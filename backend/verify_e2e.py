import httpx
from dotenv import load_dotenv
load_dotenv()

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("==========================================")
    print("RecoverAI End-to-End Automated Verification")
    print("==========================================")

    # 0. Reset Demo Database
    httpx.post(f"{BASE_URL}/demo/reset")

    # 1. Dashboard Check
    r = httpx.get(f"{BASE_URL}/dashboard")
    assert r.status_code == 200, "Dashboard endpoint failed"
    dash = r.json()
    print(f"[OK] Dashboard OK: Revenue at Risk = INR {dash['revenue_at_risk']:,.2f}, Recovered = INR {dash['recovered_revenue']:,.2f}")

    # 2. Opportunities Check
    r = httpx.get(f"{BASE_URL}/opportunities")
    assert r.status_code == 200, "Opportunities endpoint failed"
    opps = r.json()
    print(f"[OK] Opportunities Table OK: Total Opportunities = {len(opps)}")

    # 3. AI Analysis Test
    r = httpx.post(f"{BASE_URL}/ai/analyze/txn_1024", timeout=30.0)
    assert r.status_code == 200, "AI Analysis failed"
    ai_res = r.json()
    print(f"[OK] AI Reasoning Agent OK: TXN_1024 Score = {ai_res['recovery_probability']}%, Action = '{ai_res['recommended_action']}'")
    print(f"   Reason: {ai_res['reason']}")
    safety_msg = ai_res['safety_message'].replace('₹', 'INR ')
    print(f"   Safety Verdict: {safety_msg}")

    # 4. Razorpay Order Creation Test
    r = httpx.post(f"{BASE_URL}/payments/create-order", json={"transaction_id": "txn_1024"})
    assert r.status_code == 200, "Razorpay Order Creation failed"
    order = r.json()
    print(f"[OK] Razorpay Test Order Created OK: Order ID = '{order['order_id']}', Key ID = '{order['key_id']}'")

    # 5. Payment Verification & Revenue Recovery Test
    import hmac, hashlib, os
    secret = os.getenv("RAZORPAY_KEY_SECRET", "dummy")
    msg = f"{order['order_id']}|pay_test_verified_1024"
    sig = hmac.new(secret.encode(), msg.encode(), hashlib.sha256).hexdigest()

    r = httpx.post(f"{BASE_URL}/payments/verify", json={
        "transaction_id": "txn_1024",
        "razorpay_order_id": order["order_id"],
        "razorpay_payment_id": "pay_test_verified_1024",
        "razorpay_signature": sig
    })
    assert r.status_code == 200, "Payment verification failed"
    pay_res = r.json()
    assert pay_res["success"] is True, "Payment should succeed"
    print(f"[OK] Razorpay Payment Verification OK: Status = '{pay_res['status']}', Recovered Amount = INR {pay_res['recovered_amount']:,.2f}")

    # 6. Audit Trail Logging Check
    r = httpx.get(f"{BASE_URL}/audit?transaction_id=txn_1024")
    assert r.status_code == 200, "Audit trail endpoint failed"
    logs = r.json()
    print(f"[OK] Audit Trail OK: Found {len(logs)} audit trail entries for txn_1024")
    for log in logs[:4]:
        desc = log['description'].replace('₹', 'INR ')
        print(f"   [{log['actor']}] {log['event_type']}: {desc}")

    # 7. Edge Case: Simulated Payment Retry Failure
    # Create another failed payment
    r_sim = httpx.post(f"{BASE_URL}/demo/fail-payment")
    new_tx = r_sim.json()

    # Create order
    r_ord = httpx.post(f"{BASE_URL}/payments/create-order", json={"transaction_id": new_tx["id"]})
    new_order = r_ord.json()

    # Simulate payment retry failure
    r_fail = httpx.post(f"{BASE_URL}/payments/verify", json={
        "transaction_id": new_tx["id"],
        "razorpay_order_id": new_order["order_id"],
        "razorpay_payment_id": "pay_fail_test",
        "razorpay_signature": "INVALID_SIGNATURE",
        "simulate_failure": True
    })
    fail_res = r_fail.json()
    assert fail_res["success"] is False, "Simulated failure should return success=False"
    print(f"[OK] Failure Scenario Handled Gracefully OK: Message = '{fail_res['message']}'")

    print("\nALL END-TO-END VERIFICATION CHECKS PASSED PERFECTLY!")


if __name__ == "__main__":
    run_tests()
