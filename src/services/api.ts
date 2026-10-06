import { VideoItem } from '../types/video';
import { INITIAL_VIDEOS } from '../data/defaultVideos';

const LOCAL_STORAGE_VIDEOS_KEY = 'sniptok_custom_videos_list';
const ADMIN_PASSWORD_FALLBACK = 'Ma44332211';

function getLocalCustomVideos(): VideoItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomVideos(videos: VideoItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(videos));
  } catch (err) {
    console.error('LocalStorage save error:', err);
  }
}

export async function fetchPublicVideos(): Promise<VideoItem[]> {
  try {
    const res = await fetch('/api/videos');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
        return data.videos;
      }
    }
  } catch {}
  return [...getLocalCustomVideos(), ...INITIAL_VIDEOS];
}

export async function verifyAdminPassword(password: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {}

  if (password === ADMIN_PASSWORD_FALLBACK) {
    return { success: true, message: 'সফলভাবে লগইন হয়েছে!' };
  }
  return { success: false, message: 'ভুল পাসওয়ার্ড! দয়া করে সঠিক পাসওয়ার্ড দিন।' };
}

export async function addVideoToServer(password: string, video: Partial<VideoItem>): Promise<VideoItem> {
  const newVideoItem: VideoItem = {
    id: video.id || `vid_${Date.now()}`,
    slotNumber: video.slotNumber || Date.now(),
    title: video.title || 'নতুন ভিডিও',
    description: video.description || '',
    creator: video.creator || 'মাহবুব',
    creatorHandle: video.creatorHandle || '@mahabub',
    videoUrl: video.videoUrl || '',
    tags: video.tags || ['shorts'],
    audioTrack: video.audioTrack || 'অরিজিনাল সুর',
    likes: 1,
    commentsCount: 0,
    sharesCount: 0,
    createdAt: Date.now(),
  };

  const current = getLocalCustomVideos();
  saveLocalCustomVideos([newVideoItem, ...current]);
  return newVideoItem;
}

export async function updateVideoOnServer(password: string, id: string, updates: Partial<VideoItem>): Promise<VideoItem> {
  const current = getLocalCustomVideos();
  const index = current.findIndex((v) => v.id === id);
  if (index !== -1) {
    current[index] = { ...current[index], ...updates };
    saveLocalCustomVideos(current);
    return current[index];
  }
  return { id, ...updates } as VideoItem;
}

export async function deleteVideoFromServer(password: string, id: string): Promise<void> {
  const current = getLocalCustomVideos();
  saveLocalCustomVideos(current.filter((v) => v.id !== id));
}
