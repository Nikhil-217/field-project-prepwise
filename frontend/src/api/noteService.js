// ─── src/api/noteService.js ───────────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// Dedicated service layer for Notes. 
// This keeps our UI components (like Notes.js) focused on rendering,
// while this file handles the "how" of talking to the backend.
// ─────────────────────────────────────────────────────────────────────────────

import api from "./axios";

/**
 * FETCH NOTES
 * @param {Object} filters - { subject, unit }
 * @returns {Promise} - List of notes matching user's batch/filters
 */
export const fetchNotes = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.subject) params.append("subject", filters.subject);
        if (filters.unit) params.append("unit", filters.unit);

        const response = await api.get(`/notes?${params.toString()}`);
        return response.data; // { success: true, notes: [...] }
    } catch (err) {
        throw err; // Our axios interceptor returns the error message string
    }
};

/**
 * UPLOAD NOTE (Teacher Only)
 * @param {FormData} formData - Multipart data containing PDF and metadata
 * @returns {Promise} - The created note object
 */
export const uploadNote = async (formData) => {
    try {
        const response = await api.post("/notes", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (err) {
        throw err;
    }
};

/**
 * DELETE NOTE (Teacher Only)
 * @param {String} id - Note ID
 * @returns {Promise} - Success message
 */
export const deleteNote = async (id) => {
    try {
        const response = await api.delete(`/notes/${id}`);
        return response.data;
    } catch (err) {
        throw err;
    }
};
