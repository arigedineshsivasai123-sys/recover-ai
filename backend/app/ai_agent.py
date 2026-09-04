import json
import httpx
from typing import Dict, Any
from app.config import settings
from app.models import Transaction, Customer, MerchantSettings

class AIAgent:
    """
    RecoverAI Reasoning Layer.
    Provides structured AI analysis based on customer context, transaction failure data, and merchant parameters.
    """

    def analyze_recovery_opportunity(
        self,
        transaction: Transaction,
        customer: Customer,
        merchant_rules: MerchantSettings
    ) -> Dict[str, Any]:
        
        context_payload = {
            "customer_name": customer.name,
            "customer_total_purchases": customer.total_purchases,
            "transaction_code": transaction.txn_code,
            "amount": transaction.amount,
            "item_name": transaction.item_name,
            "failure_reason": transaction.failure_reason,
            "attempt_count": transaction.attempt_count,
            "max_attempts": merchant_rules.max_attempts,
            "approval_threshold": merchant_rules.approval_threshold,
        }

        # Try Live LLM API if key is present
        if settings.AI_API_KEY:
            try:
                llm_response = self._call_llm_api(context_payload)
                if llm_response:
                    llm_response["demo_mode"] = False
                    return llm_response
            except Exception as e:
                print(f"LLM API Call Error: {e}, utilizing structured reasoning engine.")

        # Structured Contextual AI Reasoning Engine (Fallback / Offline Demo)
        return self._structured_contextual_reasoning(context_payload)

    def _call_llm_api(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
        You are RecoverAI, an expert AI revenue recovery agent.
        Analyze this failed e-commerce transaction context:
        {json.dumps(payload, indent=2)}

        Return strictly valid JSON with this schema:
        {{
          "recovery_probability": int (0 to 100),
          "recommended_action": "PAYMENT_RETRY" | "REMINDER" | "ALTERNATIVE_PAYMENT" | "MERCHANT_APPROVAL" | "NO_ACTION",
          "reason": "Detailed concise explanation for merchant",
          "risk_level": "LOW" | "MEDIUM" | "HIGH",
          "customer_message": "Friendly customer messaging text",
          "requires_approval": boolean
        }}
        """

        headers = {"Content-Type": "application/json"}
        # Primary supported Gemini model
        model_names = ["gemini-2.5-flash"]
        
        with httpx.Client(timeout=30.0) as client:
            for model in model_names:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.AI_API_KEY}"
                req_body = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"}
                }
                try:
                    resp = client.post(url, json=req_body, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        parsed = json.loads(text)
                        parsed["demo_mode"] = False
                        return parsed
                    else:
                        print(f"Gemini API ({model}) returned HTTP {resp.status_code}: {resp.text[:200]}")
                except Exception as err:
                    print(f"Gemini API ({model}) error: {err}")

        return None

    def _structured_contextual_reasoning(self, ctx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deterministic LLM Simulation Engine based on real behavioral signals:
        - Customer trust score (total purchases)
        - Transaction amount vs threshold
        - Failure reason patterns
        """
        amount = ctx["amount"]
        purchases = ctx["customer_total_purchases"]
        reason = ctx["failure_reason"].lower()
        attempts = ctx["attempt_count"]
        threshold = ctx["approval_threshold"]

        base_probability = 60

        # Adjust score based on customer loyalty
        if purchases >= 5:
            base_probability += 20
        elif purchases >= 2:
            base_probability += 10

        # Adjust score based on failure reason
        if "3ds" in reason or "verification" in reason or "otp" in reason:
            base_probability += 15
            action = "PAYMENT_RETRY"
            explanation = f"Customer encountered temporary 3DS/OTP authentication timeout. High purchase intent from customer with {purchases} order history."
        elif "declined" in reason or "funds" in reason:
            base_probability += 5
            action = "PAYMENT_RETRY"
            explanation = "Payment declined due to temporary card limit or funds. High likelihood of resolution on instant retry."
        elif "abandoned" in reason:
            base_probability += 10
            action = "REMINDER"
            explanation = f"Customer left item '{ctx['item_name']}' in cart recently. Personalized reminder recommended."
        elif "gateway" in reason or "timeout" in reason or "network" in reason:
            base_probability += 15
            action = "PAYMENT_RETRY"
            explanation = "Failure caused by upstream payment gateway network error. Retry has high success rate."
        else:
            action = "ALTERNATIVE_PAYMENT"
            explanation = "Standard payment failure detected. Suggesting alternative payment method (UPI / NetBanking)."

        # Check high value approval rule
        requires_approval = False
        risk_level = "LOW"

        if amount > threshold:
            requires_approval = True
            risk_level = "HIGH"
            explanation = f"High-value recovery opportunity (₹{amount:,.2f}). Contextual AI recommends recovery retry, but amount exceeds automatic threshold (₹{threshold:,.2f}) requiring merchant authorization."

        if attempts > 2:
            action = "NO_ACTION"
            base_probability = 15
            risk_level = "HIGH"
            explanation = "Maximum retry attempts reached. Risk of customer fatigue or duplicate transaction."

        final_prob = min(max(base_probability, 15), 96)

        customer_msg = (
            f"Hi {ctx['customer_name']}, your payment of ₹{amount:,.2f} for '{ctx['item_name']}' was incomplete. "
            f"We've reserved your order—click below to complete your checkout safely."
        )

        return {
            "recovery_probability": final_prob,
            "recommended_action": action,
            "reason": explanation,
            "risk_level": risk_level,
            "customer_message": customer_msg,
            "requires_approval": requires_approval,
            "demo_mode": True
        }

ai_agent = AIAgent()
