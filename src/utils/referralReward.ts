// Utility to get referral reward from localStorage
export function getReferralReward() {
  const raw = localStorage.getItem('tapgas_referral_reward');
  if (!raw) return 0;
  try {
    return parseFloat(raw) || 0;
  } catch {
    return 0;
  }
}

// Utility to set referral reward in localStorage
export function setReferralReward(value: number) {
  localStorage.setItem('tapgas_referral_reward', value.toString());
}
