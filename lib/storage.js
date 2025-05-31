import { list, put, del } from '@vercel/blob';

export async function getUserPreferences(userId) {
  try {
    const response = await fetch(`${process.env.BLOB_READ_URL}/user-preferences/${userId}.json`);
    if (!response.ok) throw new Error('Preferences not found');
    return await response.json();
  } catch (error) {
    return { model: 'gpt41-mini' };
  }
}

export async function saveUserPreferences(userId, preferences) {
  const blob = await put(`user-preferences/${userId}.json`, JSON.stringify(preferences), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json'
  });
  return blob;
}

export async function getUserHistory(userId) {
  try {
    const response = await fetch(`${process.env.BLOB_READ_URL}/chat-histories/${userId}.json`);
    if (!response.ok) throw new Error('History not found');
    return await response.json();
  } catch (error) {
    return [{
      role: "system",
      content: "You are a helpful assistant who responds succinctly. Maintain context of our conversation."
    }];
  }
}

export async function saveUserHistory(userId, messages) {
  const blob = await put(`chat-histories/${userId}.json`, JSON.stringify(messages), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json'
  });
  return blob;
}

export async function clearUserData(userId) {
  try {
    await del(`user-preferences/${userId}.json`);
    await del(`chat-histories/${userId}.json`);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
} 