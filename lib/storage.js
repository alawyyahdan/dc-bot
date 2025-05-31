import { put, get } from '@vercel/blob';

export async function getUserPreferences(userId) {
  try {
    const { blob } = await get(`user-preferences/${userId}.json`);
    if (!blob) throw new Error('Preferences not found');
    return await blob.json();
  } catch (error) {
    return { model: 'gpt41-mini' };
  }
}

export async function saveUserPreferences(userId, preferences) {
  return await put(`user-preferences/${userId}.json`, JSON.stringify(preferences), {
    contentType: 'application/json',
  });
}

export async function getUserHistory(userId) {
  try {
    const { blob } = await get(`chat-histories/${userId}.json`);
    if (!blob) throw new Error('History not found');
    return await blob.json();
  } catch (error) {
    return [{
      role: "system",
      content: "You are a helpful assistant who responds succinctly. Maintain context of our conversation."
    }];
  }
}

export async function saveUserHistory(userId, messages) {
  return await put(`chat-histories/${userId}.json`, JSON.stringify(messages), {
    contentType: 'application/json',
  });
} 