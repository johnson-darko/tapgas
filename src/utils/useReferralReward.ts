import { useEffect, useState } from 'react';

export function useReferralReward() {
  const [reward, setReward] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem('tapgas_referral_reward');
    if (raw) {
      setReward(parseFloat(raw) || 0);
    }
  }, []);

  return reward;
}
