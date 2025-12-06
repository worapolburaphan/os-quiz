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
		// Save the full session
		await sessionStore.setItem(session.id, session);

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

		const sessionsList = await getSessionsList();
		const existingIndex = sessionsList.findIndex((s) => s.id === session.id);

		if (existingIndex >= 0) {
			sessionsList[existingIndex] = metadata;
		} else {
			sessionsList.push(metadata);
		}

		// Sort by timestamp (newest first)
		sessionsList.sort((a, b) => b.timestamp - a.timestamp);

		await sessionStore.setItem(SESSIONS_LIST_KEY, sessionsList);
	} catch (error) {
		console.error('Error saving session:', error);
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
		const list = await sessionStore.getItem<SessionMetadata[]>(SESSIONS_LIST_KEY);
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
