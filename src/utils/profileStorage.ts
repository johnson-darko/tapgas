// Utility for managing profile info in local storage
export const PROFILE_STORAGE_KEY = 'tapgas_profile';

export function getProfile() {
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return { name: '', phone: '' };
  try {
    return JSON.parse(raw);
  } catch {
    return { name: '', phone: '' };
  }
}

// ...existing code...
export type Profile = {
  name: string;
  phone: string;
  email?: string;
  // add other fields as needed
};
export function saveProfile(profile: Profile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
