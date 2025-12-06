import localforage from 'localforage';
import type { QuizSession, SessionMetadata } from '$lib/types';

// Configure localForage
const sessionStore = localforage.createInstance({
	name: 'quiz-app',
	storeName: 'sessions',
	description: 'Quiz session storage'
});

const SESSIONS_LIST_KEY = '__sessions_list__';

/**
 * Save a quiz session
 */
export async function saveSession(session: QuizSession): Promise<void> {
	try {
		console.log('💾 Attempting to save session:', session.id, {
			timestamp: session.timestamp,
			chapters: session.selectedChapters,
			totalQuestions: session.totalQuestions,
			score: session.score,
			isCompleted: session.isCompleted
		});

		// Serialize the session to ensure it's cloneable
		const serializedSession = JSON.parse(JSON.stringify(session));
		console.log('✅ Session serialized successfully');

		// Save the full session
		await sessionStore.setItem(session.id, serializedSession);
		console.log('✅ Session saved to IndexedDB');

		// Update sessions list
		const metadata: SessionMetadata = {
			id: session.id,
			timestamp: session.timestamp,
			selectedChapters: session.selectedChapters,
			totalQuestions: session.totalQuestions,
			score: session.score,
			scorePercentage: session.scorePercentage,
			isCompleted: session.isCompleted,
			completedAt: session.completedAt
		};
		console.log('📋 Created metadata:', metadata);

		const sessionsList = await getSessionsList();
		console.log('📂 Current sessions list:', sessionsList);

		const existingIndex = sessionsList.findIndex((s) => s.id === session.id);
		console.log('🔍 Existing session index:', existingIndex);

		if (existingIndex >= 0) {
			sessionsList[existingIndex] = metadata;
			console.log('🔄 Updated existing session at index', existingIndex);
		} else {
			sessionsList.push(metadata);
			console.log('➕ Added new session to list');
		}

		// Sort by timestamp (newest first)
		sessionsList.sort((a, b) => b.timestamp - a.timestamp);
		console.log('📊 Sorted sessions list. Total:', sessionsList.length);

		try {
			// Serialize the sessions list to ensure it's cloneable
			const serializedList = JSON.parse(JSON.stringify(sessionsList));
			console.log('🔄 Serialized sessions list:', serializedList);

			await sessionStore.setItem(SESSIONS_LIST_KEY, serializedList);
			console.log('✅ Sessions list updated in storage. Total sessions:', serializedList.length);
		} catch (listError) {
			console.error('❌ Error saving sessions list:', listError);
			// Try without serialization as fallback
			try {
				await sessionStore.setItem(SESSIONS_LIST_KEY, sessionsList);
				console.log('✅ Sessions list saved (without serialization)');
			} catch (fallbackError) {
				console.error('❌ Fallback save also failed:', fallbackError);
			}
		}
	} catch (error) {
		console.error('❌ Error saving session:', error);
		throw error;
	}
}

/**
 * Load a quiz session by ID
 */
export async function loadSession(sessionId: string): Promise<QuizSession | null> {
	try {
		const session = await sessionStore.getItem<QuizSession>(sessionId);
		return session;
	} catch (error) {
		console.error('Error loading session:', error);
		return null;
	}
}

/**
 * Get list of all session metadata
 */
export async function getSessionsList(): Promise<SessionMetadata[]> {
	try {
		console.log('📖 Reading sessions list from storage...');
		const list = await sessionStore.getItem<SessionMetadata[]>(SESSIONS_LIST_KEY);
		console.log('📖 Sessions list retrieved:', list ? `${list.length} sessions` : 'null/empty');
		return list || [];
	} catch (error) {
		console.error('Error getting sessions list:', error);
		return [];
	}
}

/**
 * Delete a session by ID
 */
export async function deleteSession(sessionId: string): Promise<void> {
	try {
		// Remove from storage
		await sessionStore.removeItem(sessionId);

		// Update sessions list
		const sessionsList = await getSessionsList();
		const filteredList = sessionsList.filter((s) => s.id !== sessionId);
		await sessionStore.setItem(SESSIONS_LIST_KEY, filteredList);
	} catch (error) {
		console.error('Error deleting session:', error);
		throw error;
	}
}

/**
 * Clear all sessions
 */
export async function clearAllSessions(): Promise<void> {
	try {
		await sessionStore.clear();
	} catch (error) {
		console.error('Error clearing sessions:', error);
		throw error;
	}
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
	return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
