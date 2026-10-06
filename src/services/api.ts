import { VideoItem } from '../types/video';
import { INITIAL_VIDEOS } from '../data/defaultVideos';

/**
 * Fetch all public videos from server (synced across all phones)
 */
export async function fetchPublicVideos(): Promise<VideoItem[]> {
  try {
    const res = await fetch('/api/videos');
    if (!res.ok) {
      throw new Error(`Failed to load server videos: ${res.status}`);
    }
    const data = await res.json();
    if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
      return data.videos;
    }
    return INITIAL_VIDEOS;
  } catch (err) {
    console.warn('Server offline or unavailable, using cached/default videos:', err);
    return INITIAL_VIDEOS;
  }
}

/**
 * Verify admin password (Ma44332211)
 */
export async function verifyAdminPassword(password: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    // If local test without backend
    if (password === 'Ma44332211') {
      return { success: true, message: 'সফলভাবে লগইন হয়েছে!' };
    }
    return { success: false, message: 'পাসওয়ার্ড যাচাই করতে সমস্যা হয়েছে।' };
  }
}

/**
 * Add video to central server
 */
export async function addVideoToServer(
  password: string,
  video: Partial<VideoItem>
): Promise<VideoItem> {
  const res = await fetch('/api/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, video }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'ভিডিও যোগ করতে সমস্যা হয়েছে।');
  }
  return data.video;
}

/**
 * Update video on server
 */
export async function updateVideoOnServer(
  password: string,
  id: string,
  updates: Partial<VideoItem>
): Promise<VideoItem> {
  const res = await fetch(`/api/videos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, updates }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'ভিডিও আপডেট করতে সমস্যা হয়েছে।');
  }
  return data.video;
}

/**
 * Delete video from server
 */
export async function deleteVideoFromServer(password: string, id: string): Promise<void> {
  const res = await fetch(`/api/videos/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'ভিডিও ডিলিট করতে সমস্যা হয়েছে।');
  }
}
