import random
import string
from datetime import datetime, timedelta
from config import Config

def generate_otp(length: int = None) -> str:
    """
    Generate a random OTP code.
    
    Args:
        length: Length of OTP (default from config)
    
    Returns:
        Random numeric OTP string
    """
    if length is None:
        length = Config.OTP_LENGTH
    
    return ''.join(random.choices(string.digits, k=length))


def get_otp_expiry_time() -> datetime:
    """
    Get the expiry time for an OTP.
    
    Returns:
        Datetime object for OTP expiry
    """
    return datetime.utcnow() + timedelta(seconds=Config.OTP_EXPIRY_TIME)


def is_otp_valid(otp_token, expected_otp: str) -> tuple:
    """
    Validate an OTP token.
    
    Args:
        otp_token: The OTPToken object from database
        expected_otp: The OTP code to verify
    
    Returns:
        Tuple of (is_valid: bool, error_message: str or None)
    """
    # Check if OTP is already used
    if otp_token.is_used:
        return False, 'OTP has already been used'
    
    # Check if OTP is expired
    if otp_token.is_expired():
        return False, 'OTP has expired'
    
    # Check if OTP code matches
    if otp_token.otp_code != expected_otp:
        return False, 'Invalid OTP code'
    
    return True, None


def validate_email_format(email: str) -> bool:
    """
    Basic email format validation.
    
    Args:
        email: Email string to validate
    
    Returns:
        True if valid format, False otherwise
    """
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, email))


def validate_password_strength(password: str) -> tuple:
    """
    Validate password strength.
    
    Args:
        password: Password string to validate
    
    Returns:
        Tuple of (is_valid: bool, error_message: str or None)
    """
    if len(password) < 8:
        return False, 'Password must be at least 8 characters long'
    
    if not any(c.isupper() for c in password):
        return False, 'Password must contain at least one uppercase letter'
    
    if not any(c.islower() for c in password):
        return False, 'Password must contain at least one lowercase letter'
    
    if not any(c.isdigit() for c in password):
        return False, 'Password must contain at least one digit'
    
    return True, None
