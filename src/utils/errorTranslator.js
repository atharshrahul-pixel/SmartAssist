export function translateError(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  const msg = typeof error === 'string' 
    ? error 
    : (error.message || error.toString());

  const lowercaseMsg = msg.toLowerCase();

  if (lowercaseMsg.includes('failed to fetch') || lowercaseMsg.includes('networkerror') || lowercaseMsg.includes('could not connect')) {
    return 'Could not connect to our server. Please check your internet connection and try again.';
  }
  
  if (lowercaseMsg.includes('user with this email already exists') || lowercaseMsg.includes('email already exists') || lowercaseMsg.includes('email is already registered')) {
    return 'This email address is already registered. Please sign in instead or use another email.';
  }

  if (lowercaseMsg.includes('invalid credentials') || lowercaseMsg.includes('invalid email or password')) {
    return 'Incorrect email or password. Please check spelling and try again.';
  }

  if (lowercaseMsg.includes('password must be at least 6 characters')) {
    return 'Choose a longer password. It must contain at least 6 characters.';
  }

  if (lowercaseMsg.includes('already on the waitlist for this slot') || lowercaseMsg.includes('already waitlisted')) {
    return 'You are already signed up on the waitlist for this appointment slot.';
  }

  if (lowercaseMsg.includes('please provide all required fields') || lowercaseMsg.includes('missing waitlist appointment details')) {
    return 'Please fill in all requested details before continuing.';
  }

  if (lowercaseMsg.includes('waitlist entry not found')) {
    return 'We could not find this waitlist spot. It may have expired.';
  }

  if (lowercaseMsg.includes('slot is not notified for booking')) {
    return 'This slot is not ready for booking yet.';
  }

  if (lowercaseMsg.includes('selected specialist was not found')) {
    return 'We could not locate this doctor. Please go back and select another doctor.';
  }

  return msg;
}
