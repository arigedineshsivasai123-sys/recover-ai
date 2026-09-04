from typing import Dict, Any, Tuple
from app.models import Transaction, MerchantSettings

class SafetyEngine:
    """
    Deterministic Safety Rule Engine.
    Ensures AI recommendations strictly comply with merchant financial safety policies.
    The Safety Engine HAS FINAL AUTHORIZATION AUTHORITY over all AI suggestions.
    """

    @staticmethod
    def evaluate_transaction_safety(
        transaction: Transaction,
        recommended_action: str,
        ai_probability: int,
        settings: MerchantSettings
    ) -> Tuple[bool, str, str]:
        """
        Returns:
            (safety_passed: bool, final_action: str, reason: str)
        """
        # Rule 1: Attempt Count Check
        if transaction.attempt_count > settings.max_attempts:
            return (
                False,
                "NO_ACTION",
                f"SAFETY BLOCK: Transaction has reached maximum allowed attempts ({transaction.attempt_count}/{settings.max_attempts})."
            )

        # Rule 2: Amount Threshold Check for Auto-Recovery
        if transaction.amount > settings.approval_threshold:
            return (
                False,
                "MERCHANT_APPROVAL",
                f"SAFETY RULE ENFORCED: Amount ₹{transaction.amount:,.2f} exceeds automatic limit of ₹{settings.approval_threshold:,.2f}. Merchant manual approval required."
            )

        # Rule 3: High Risk / Low Probability Check
        if ai_probability < 30:
            return (
                False,
                "NO_ACTION",
                f"SAFETY RULE ENFORCED: AI recovery probability ({ai_probability}%) is below minimum threshold (30%). No recovery attempted."
            )

        # Rule 4: Check if Auto Recovery is disabled globally
        if not settings.auto_recovery_enabled:
            return (
                False,
                "MERCHANT_APPROVAL",
                "SAFETY RULE ENFORCED: Automatic recovery is currently disabled by merchant settings."
            )

        # All deterministic safety checks passed
        return (
            True,
            recommended_action,
            f"SAFETY CHECK PASSED: Amount ₹{transaction.amount:,.2f} <= ₹{settings.approval_threshold:,.2f}, attempts ({transaction.attempt_count}/{settings.max_attempts}). Safe for automated action."
        )

safety_engine = SafetyEngine()
