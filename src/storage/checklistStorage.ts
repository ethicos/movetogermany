
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = 'move-to-germany-profile';
const COMPLETED_KEY = 'move-to-germany-completed-tasks';

export type UserProfile = {
  city: string;
  arrivalDate: string;
  stage: string;
};

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadProfile(): Promise<UserProfile | null> {
  const value = await AsyncStorage.getItem(PROFILE_KEY);

  if (!value) return null;

  try {
    return JSON.parse(value) as UserProfile;
  } catch {
    return null;
  }
}

export async function saveCompletedTasks(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(ids));
}

export async function loadCompletedTasks(): Promise<string[]> {
  const value = await AsyncStorage.getItem(COMPLETED_KEY);

  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}
