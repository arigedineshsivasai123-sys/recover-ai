from typing import Tuple

# Allowed State Transitions Map
ALLOWED_TRANSITIONS = {
    "CREATED": ["PAYMENT_FAILED"],
    "PAYMENT_FAILED": ["AI_ANALYZED", "MAX_ATTEMPTS_REACHED"],
    "AI_ANALYZED": ["RECOVERY_PENDING", "RECOVERY_APPROVED", "RECOVERY_REJECTED", "MAX_ATTEMPTS_REACHED"],
    "RECOVERY_PENDING": ["RECOVERY_APPROVED", "RECOVERY_REJECTED", "EXPIRED"],
    "RECOVERY_APPROVED": ["RETRY_PAYMENT", "EXPIRED"],
    "RETRY_PAYMENT": ["PAYMENT_SUCCESS", "PAYMENT_FAILED", "MAX_ATTEMPTS_REACHED"],
    "PAYMENT_SUCCESS": ["RECOVERED"],
    "RECOVERED": [],
    "RECOVERY_REJECTED": [],
    "MAX_ATTEMPTS_REACHED": [],
    "EXPIRED": []
}

class StateMachineError(Exception):
    pass

def validate_state_transition(current_status: str, target_status: str) -> Tuple[bool, str]:
    if current_status == target_status:
        return True, "No transition needed"
    
    allowed = ALLOWED_TRANSITIONS.get(current_status, [])
    if target_status not in allowed:
        return False, f"Invalid state transition from {current_status} to {target_status}. Allowed: {allowed}"
    
    return True, "Transition valid"
