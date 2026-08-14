export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  tone: 'danger' | 'warning' | 'success';
}

export function evaluatePassword(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(score, 4) as PasswordStrength['score'];
  const labels = ['Too short', 'Weak', 'Fair', 'Strong', 'Excellent'];
  const tone: PasswordStrength['tone'] =
    clamped <= 1 ? 'danger' : clamped <= 2 ? 'warning' : 'success';
  return { score: clamped, label: labels[clamped], tone };
}
