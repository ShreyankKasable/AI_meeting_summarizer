const { ipcRenderer } = require('electron');
const axios = require('axios');

const API_BASE_URL = 'http://127.0.0.1:5000';

// State
let currentMeetingId = null;
let recordingStartTime = null;
let timerInterval = null;

// Audio capture state (Web Audio API)
let audioContext = null;
let audioStream = null;
let audioSource = null;
let audioProcessor = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeRecording();
    initializeSettings();
    loadMeetings();
    loadActionItems();
    setupIPCListeners();
});

// Navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.dataset.view;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding view
            views.forEach(view => view.classList.remove('active'));
            document.getElementById(`${viewName}View`).classList.add('active');
        });
    });
    
    // New Meeting button
    document.getElementById('newMeetingBtn').addEventListener('click', () => {
        switchToView('recording');
    });
}

function switchToView(viewName) {
    const navItem = document.querySelector(`[data-view="${viewName}"]`);
    if (navItem) navItem.click();
}

// Recording functionality
function initializeRecording() {
    const startBtn = document.getElementById('startRecordBtn');
    const stopBtn = document.getElementById('stopRecordBtn');
    
    startBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
}

async function startRecording() {
    const titleInput = document.getElementById('meetingTitle');
    const title = titleInput.value.trim() || 'Untitled Meeting';

    const participantsInput = document.getElementById('meetingParticipants');
    const participants = participantsInput.value.trim();

    // Request microphone access and start capturing audio in the renderer.
    try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
        showNotification('Microphone Error', 'Could not access microphone: ' + e.message);
        return;
    }

    // Tell the backend to create the meeting record.
    ipcRenderer.send('start-recording', { title, participants });

    // Set up a Web Audio pipeline that streams raw PCM blocks to the main process.
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioSource = audioContext.createMediaStreamSource(audioStream);
    audioProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    ipcRenderer.send('recording-audio-start', { sampleRate: audioContext.sampleRate });

    audioProcessor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        // Copy and transfer the underlying ArrayBuffer to the main process.
        const copy = new Float32Array(input);
        ipcRenderer.send('audio-chunk', copy.buffer);
    };
    audioSource.connect(audioProcessor);
    audioProcessor.connect(audioContext.destination);

    // Update UI
    document.getElementById('startRecordBtn').disabled = true;
    document.getElementById('stopRecordBtn').disabled = false;
    document.getElementById('recordingStatus').innerHTML = `
        <span class="status-icon">🔴</span>
        <span class="status-text">Recording...</span>
    `;
    
    // Show live transcript
    const liveTranscriptContainer = document.getElementById('liveTranscriptContainer');
    if (liveTranscriptContainer) {
        liveTranscriptContainer.style.display = 'block';
        document.getElementById('liveTranscript').innerHTML = '<span style="color: var(--text-secondary);">Listening for speech...</span>';
    }
    
    // Start timer
    recordingStartTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    
    // Animate visualizer
    document.getElementById('audioVisualizer').classList.add('active');
}

function stopRecording() {
    if (!currentMeetingId) {
        showNotification('Error', 'No active recording found');
        return;
    }

    // Tear down the audio pipeline and flush the captured WAV via the main process.
    if (audioProcessor) { audioProcessor.disconnect(); audioProcessor.onaudioprocess = null; audioProcessor = null; }
    if (audioSource) { audioSource.disconnect(); audioSource = null; }
    if (audioStream) { audioStream.getTracks().forEach(t => t.stop()); audioStream = null; }
    if (audioContext) { audioContext.close(); audioContext = null; }

    // Signals main to write the full WAV and trigger the processing pipeline.
    ipcRenderer.send('recording-audio-stop');

    // Update UI
    document.getElementById('startRecordBtn').disabled = false;
    document.getElementById('stopRecordBtn').disabled = true;
    document.getElementById('recordingStatus').innerHTML = `
        <span class="status-icon">⏸️</span>
        <span class="status-text">Processing...</span>
    `;
    
    // Hide and clear live transcript
    const liveTranscriptContainer = document.getElementById('liveTranscriptContainer');
    if (liveTranscriptContainer) {
        liveTranscriptContainer.style.display = 'none';
        document.getElementById('liveTranscript').textContent = 'Transcription will appear here...';
    }
    
    // Stop timer
    clearInterval(timerInterval);
    
    // Stop visualizer
    document.getElementById('audioVisualizer').classList.remove('active');
    
    // Show processing status
    document.getElementById('processingStatus').style.display = 'block';
}

function updateTimer() {
    if (!recordingStartTime) return;
    
    const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('recordingTimer').textContent = timeStr;
}

// Load meetings
// (Now handled by enhanced filter function below)

function displayMeetings(meetings) {
    const container = document.getElementById('meetingsList');
    
    if (meetings.length === 0) {
        container.innerHTML = '<div class="loading">No meetings yet. Start your first recording!</div>';
        return;
    }
    
    container.innerHTML = meetings.map(meeting => `
        <div class="meeting-card" onclick="showMeetingDetail(${meeting.id})">
            <h3>${escapeHtml(meeting.title)}</h3>
            <div class="meeting-date">${formatDate(meeting.start_time)}</div>
            <div class="meeting-summary">${escapeHtml(meeting.summary || 'No summary available')}</div>
            <div class="mt-2">
                <span class="priority-badge priority-medium">${meeting.action_items ? meeting.action_items.length : 0} action items</span>
            </div>
        </div>
    `).join('');
}

async function showMeetingDetail(meetingId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/meetings/${meetingId}`);
        const meeting = response.data;
        
        const modal = document.getElementById('meetingModal');
        const detailContainer = document.getElementById('meetingDetail');
        
        detailContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <input type="text" 
                       id="meetingTitleInput" 
                       value="${escapeHtml(meeting.title)}" 
                       style="flex: 1; padding: 0.5rem; font-size: 1.5rem; font-weight: bold; border: 1px solid var(--border); border-radius: 4px; background: var(--background);">
                <button class="btn btn-secondary" onclick="saveMeetingTitle(${meetingId})">
                    💾 Save Title
                </button>
            </div>
            <p class="meeting-date">${formatDate(meeting.start_time)} - ${formatDate(meeting.end_time)}</p>
            
            ${meeting.participants && meeting.participants.length > 0 ? `
            <div style="margin: 0.5rem 0; padding: 0.5rem; background: var(--background); border-radius: 4px;">
                <strong>👥 Participants:</strong> ${meeting.participants.map(p => p.name).join(', ')}
            </div>
            ` : ''}
            
            ${meeting.audio_file_path ? `
            <div style="margin: 1rem 0; padding: 1rem; background: var(--background); border-radius: 8px;">
                <h3 style="margin-bottom: 0.5rem;">🎵 Audio Recording</h3>
                <audio controls style="width: 100%;" src="${API_BASE_URL}${meeting.audio_file_path}">
                    Your browser does not support audio playback.
                </audio>
            </div>
            ` : ''}
            
            <h3 class="mt-2">Summary</h3>
            <div class="meeting-summary">${escapeHtml(meeting.summary || 'No summary available')}</div>
            
            <h3 class="mt-2">Action Items</h3>
            <div class="action-items-list">
                ${meeting.action_items.map(item => `
                    <div class="action-item ${item.completed ? 'completed' : ''}">
                        <input type="checkbox" class="action-item-checkbox" 
                               ${item.completed ? 'checked' : ''} 
                               onchange="toggleActionItem(${item.id})">
                        <div class="action-item-content">
                            <div class="action-item-description">${escapeHtml(item.description)}</div>
                            <div class="action-item-meta">
                                <span class="priority-badge priority-${item.priority}">${item.priority}</span>
                                ${item.assignee ? `<span>👤 ${escapeHtml(item.assignee)}</span>` : ''}
                                ${item.due_date ? `<span>📅 ${formatDate(item.due_date)}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <h3 class="mt-2">Transcript</h3>
            <div style="max-height: 300px; overflow-y: auto; background: var(--background); padding: 1rem; border-radius: 8px;">
                ${escapeHtml(getTranscriptText(meeting.transcript))}
            </div>
            
            <div class="mt-2">
                <button class="btn btn-primary" onclick="syncMeetingTasks(${meetingId})">
                    🔄 Sync to Services
                </button>
                <button class="btn btn-secondary" onclick="syncToGoogleCalendar(${meetingId})" style="margin-left: 0.5rem;">
                    📅 Sync to Google Calendar
                </button>
                <button class="btn btn-secondary" onclick="exportToNotion(${meetingId})" style="margin-left: 0.5rem;">
                    📝 Export to Notion
                </button>
                <button class="btn btn-secondary" onclick="syncToJira(${meetingId})" style="margin-left: 0.5rem;">
                    🎯 Sync to Jira
                </button>
                <button class="btn btn-secondary" onclick="showTranslationOptions(${meetingId})" style="margin-left: 0.5rem;">
                    🌐 Translate
                </button>
            </div>
        `;
        
        modal.classList.add('active');
    } catch (error) {
        console.error('Error loading meeting detail:', error);
    }
}

// Load action items
async function loadActionItems() {
    try {
        console.log('Loading action items...');
        const response = await axios.get(`${API_BASE_URL}/api/meetings`);
        const meetings = response.data;
        
        const allActionItems = [];
        meetings.forEach(meeting => {
            if (meeting.action_items) {
                meeting.action_items.forEach(item => {
                    allActionItems.push({
                        ...item,
                        meeting_title: meeting.title
                    });
                });
            }
        });
        
        console.log('Action items loaded:', allActionItems.length);
        displayActionItems(allActionItems);
    } catch (error) {
        console.error('Error loading action items:', error);
        const container = document.getElementById('actionItemsList');
        if (container) {
            container.innerHTML = '<div class="loading">No action items yet</div>';
        }
    }
}

function displayActionItems(items) {
    const container = document.getElementById('actionItemsList');
    
    if (items.length === 0) {
        container.innerHTML = '<div class="loading">No action items yet</div>';
        return;
    }
    
    // Sort by priority and completion status
    items.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    container.innerHTML = items.map(item => `
        <div class="action-item ${item.completed ? 'completed' : ''}">
            <input type="checkbox" class="action-item-checkbox" 
                   ${item.completed ? 'checked' : ''} 
                   onchange="toggleActionItem(${item.id})">
            <div class="action-item-content">
                <div class="action-item-description">${escapeHtml(item.description)}</div>
                <div class="action-item-meta">
                    <span>📋 ${escapeHtml(item.meeting_title)}</span>
                    <span class="priority-badge priority-${item.priority}">${item.priority}</span>
                    ${item.assignee ? `<span>👤 ${escapeHtml(item.assignee)}</span>` : ''}
                    ${item.due_date ? `<span>📅 ${formatDate(item.due_date)}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

async function toggleActionItem(itemId) {
    try {
        await axios.put(`${API_BASE_URL}/api/action-items/${itemId}/complete`);
        loadActionItems();
    } catch (error) {
        console.error('Error toggling action item:', error);
    }
}

function syncMeetingTasks(meetingId) {
    const services = [];
    
    // Show dialog to select services
    const selected = confirm('Sync to Google Calendar? (OK = Yes, Cancel = No)');
    if (selected) services.push('google_calendar');
    
    const notionSelected = confirm('Sync to Notion? (OK = Yes, Cancel = No)');
    if (notionSelected) services.push('notion');
    
    const jiraSelected = confirm('Sync to Jira? (OK = Yes, Cancel = No)');
    if (jiraSelected) services.push('jira');
    
    if (services.length > 0) {
        ipcRenderer.send('sync-tasks', { meeting_id: meetingId, services });
        showNotification('Syncing', 'Syncing action items to selected services...');
    }
}

// Settings
function initializeSettings() {
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('connectGoogleBtn').addEventListener('click', connectGoogleCalendar);
    document.getElementById('notionApiKey').addEventListener('blur', configureNotion);
    document.getElementById('connectJiraBtn').addEventListener('click', configureJira);
    loadSettings();
    checkGoogleAuthStatus();
    checkNotionStatus();
    checkJiraStatus();
}

function loadSettings() {
    // Load settings from localStorage or backend
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    
    if (settings.transcriptionModel) {
        document.getElementById('transcriptionModel').value = settings.transcriptionModel;
    }
    if (settings.useLocalModel !== undefined) {
        document.getElementById('useLocalModel').checked = settings.useLocalModel;
    }
    if (settings.enableNotifications !== undefined) {
        document.getElementById('enableNotifications').checked = settings.enableNotifications;
    }
}

function saveSettings() {
    const settings = {
        transcriptionModel: document.getElementById('transcriptionModel').value,
        useLocalModel: document.getElementById('useLocalModel').checked,
        notionApiKey: document.getElementById('notionApiKey').value,
        jiraUrl: document.getElementById('jiraUrl').value,
        jiraToken: document.getElementById('jiraToken').value,
        enableNotifications: document.getElementById('enableNotifications').checked
    };
    
    localStorage.setItem('appSettings', JSON.stringify(settings));
    showNotification('Settings Saved', 'Your settings have been saved successfully');
}

// IPC Listeners
function setupIPCListeners() {
    ipcRenderer.on('backend-status', (event, data) => {
        const statusEl = document.getElementById('backendStatus');
        if (data.connected) {
            statusEl.classList.add('connected');
            statusEl.querySelector('.status-text').textContent = 'Connected';
            // Reload meetings when backend connects
            loadMeetings();
            loadActionItems();
        } else {
            statusEl.classList.remove('connected');
            statusEl.querySelector('.status-text').textContent = 'Disconnected';
        }
    });
    
    // Live transcript updates
    ipcRenderer.on('live-transcript-update', (event, data) => {
        const liveTranscriptEl = document.getElementById('liveTranscript');
        if (liveTranscriptEl) {
            // Append new text
            const currentText = liveTranscriptEl.textContent;
            if (currentText === 'Listening for speech...' || currentText === 'Transcription will appear here...') {
                liveTranscriptEl.textContent = data.text;
            } else {
                liveTranscriptEl.textContent = currentText + ' ' + data.text;
            }
            
            // Auto-scroll to bottom
            liveTranscriptEl.parentElement.scrollTop = liveTranscriptEl.parentElement.scrollHeight;
        }
    });
    
    ipcRenderer.on('recording-started', (event, data) => {
        currentMeetingId = data.meeting_id;
        showNotification('Recording Started', `Recording "${data.title}"`);
    });
    
    ipcRenderer.on('processing-status', (event, data) => {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        progressFill.style.width = `${data.progress}%`;
        progressText.textContent = data.status.replace(/_/g, ' ').toUpperCase();
    });
    
    ipcRenderer.on('meeting-processed', (event, data) => {
        document.getElementById('processingStatus').style.display = 'none';
        document.getElementById('recordingStatus').innerHTML = `
            <span class="status-icon">✅</span>
            <span class="status-text">Meeting processed successfully!</span>
        `;
        
        // Reset
        currentMeetingId = null;
        recordingStartTime = null;
        document.getElementById('recordingTimer').textContent = '00:00:00';
        document.getElementById('meetingTitle').value = '';
        
        // Reload meetings and action items
        loadMeetings();
        loadActionItems();
        
        showNotification('Processing Complete', 'Meeting has been summarized and action items extracted');
        
        // Show meeting detail
        setTimeout(() => {
            showMeetingDetail(data.meeting_id);
        }, 1000);
    });
    
    ipcRenderer.on('sync-complete', (event, data) => {
        let message = 'Sync results:\n';
        for (const [service, result] of Object.entries(data.results)) {
            message += `${service}: ${result.success ? 'Success' : 'Failed'}\n`;
        }
        alert(message);
    });
    
    ipcRenderer.on('new-meeting', () => {
        switchToView('recording');
    });
    
    ipcRenderer.on('start-recording', () => {
        if (document.querySelector('[data-view="recording"]').classList.contains('active')) {
            startRecording();
        }
    });
    
    ipcRenderer.on('stop-recording', () => {
        if (currentMeetingId) {
            stopRecording();
        }
    });
}

// Modal handling
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('meetingModal').classList.remove('active');
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('meetingModal');
    if (event.target === modal) {
        modal.classList.remove('active');
    }
});

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(title, body) {
    ipcRenderer.send('show-notification', { title, body });
}

// Search functionality
let allMeetings = []; // Store all meetings for filtering

async function loadMeetings() {
    try {
        console.log('Loading meetings from:', `${API_BASE_URL}/api/meetings`);
        const response = await axios.get(`${API_BASE_URL}/api/meetings`);
        allMeetings = response.data; // Store all meetings
        
        console.log('Meetings loaded:', allMeetings.length);
        applyMeetingFilters();
    } catch (error) {
        console.error('Error loading meetings:', error);
        const container = document.getElementById('meetingsList');
        if (container) {
            container.innerHTML = '<div class="loading">Loading meetings...</div>';
        }
        // Retry after 2 seconds if backend not ready
        setTimeout(() => {
            loadMeetings();
        }, 2000);
    }
}

function applyMeetingFilters() {
    let filtered = [...allMeetings];
    
    // Search filter
    const searchTerm = document.getElementById('searchMeetings').value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(meeting => {
            const title = (meeting.title || '').toLowerCase();
            const summary = (meeting.summary || '').toLowerCase();
            return title.includes(searchTerm) || summary.includes(searchTerm);
        });
    }
    
    // Date range filter
    const dateRange = document.getElementById('dateRangeFilter').value;
    const now = new Date();
    
    if (dateRange !== 'all') {
        filtered = filtered.filter(meeting => {
            const meetingDate = new Date(meeting.start_time);
            
            if (dateRange === 'today') {
                return meetingDate.toDateString() === now.toDateString();
            } else if (dateRange === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return meetingDate >= weekAgo;
            } else if (dateRange === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return meetingDate >= monthAgo;
            } else if (dateRange === 'custom') {
                const dateFrom = document.getElementById('dateFrom').value;
                const dateTo = document.getElementById('dateTo').value;
                if (dateFrom && dateTo) {
                    const from = new Date(dateFrom);
                    const to = new Date(dateTo);
                    to.setHours(23, 59, 59); // Include full day
                    return meetingDate >= from && meetingDate <= to;
                }
            }
            return true;
        });
    }
    
    // Action item filter
    const actionFilter = document.getElementById('actionItemFilter').value;
    if (actionFilter !== 'all') {
        filtered = filtered.filter(meeting => {
            const items = meeting.action_items || [];
            const hasItems = items.length > 0;
            const hasPending = items.some(item => !item.completed);
            const allComplete = hasItems && items.every(item => item.completed);
            
            if (actionFilter === 'has_pending') return hasPending;
            if (actionFilter === 'all_complete') return allComplete;
            if (actionFilter === 'no_actions') return !hasItems;
            return true;
        });
    }
    
    // Sort
    const sortBy = document.getElementById('sortByFilter').value;
    if (sortBy === 'date_desc') {
        filtered.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
    } else if (sortBy === 'date_asc') {
        filtered.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    } else if (sortBy === 'title_asc') {
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'title_desc') {
        filtered.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    }
    
    displayMeetings(filtered);
}

// Filter event listeners
document.getElementById('searchMeetings').addEventListener('input', applyMeetingFilters);
document.getElementById('dateRangeFilter').addEventListener('change', (e) => {
    const customRange = document.getElementById('customDateRange');
    customRange.style.display = e.target.value === 'custom' ? 'block' : 'none';
    applyMeetingFilters();
});
document.getElementById('dateFrom').addEventListener('change', applyMeetingFilters);
document.getElementById('dateTo').addEventListener('change', applyMeetingFilters);
document.getElementById('actionItemFilter').addEventListener('change', applyMeetingFilters);
document.getElementById('sortByFilter').addEventListener('change', applyMeetingFilters);
document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    document.getElementById('searchMeetings').value = '';
    document.getElementById('dateRangeFilter').value = 'all';
    document.getElementById('actionItemFilter').value = 'all';
    document.getElementById('sortByFilter').value = 'date_desc';
    document.getElementById('customDateRange').style.display = 'none';
    applyMeetingFilters();
});

// Filter functionality
document.getElementById('filterPriority').addEventListener('change', filterActionItems);
document.getElementById('filterStatus').addEventListener('change', filterActionItems);

function filterActionItems() {
    const priority = document.getElementById('filterPriority').value;
    const status = document.getElementById('filterStatus').value;
    const actionItems = document.querySelectorAll('#actionItemsView .action-item');
    
    actionItems.forEach(item => {
        let show = true;
        
        if (priority !== 'all') {
            const itemPriority = item.querySelector('.priority-badge').textContent.trim();
            if (itemPriority !== priority) show = false;
        }
        
        if (status !== 'all') {
            const isCompleted = item.classList.contains('completed');
            if (status === 'completed' && !isCompleted) show = false;
            if (status === 'pending' && isCompleted) show = false;
        }
        
        item.style.display = show ? 'flex' : 'none';
    });
}

// Helper function to extract text from transcript object or string
function getTranscriptText(transcript) {
    if (!transcript) {
        return 'No transcript available';
    }
    
    // If it's an object, extract the text field
    if (typeof transcript === 'object' && transcript.text) {
        return transcript.text;
    }
    
    // If it's already a string, return it
    if (typeof transcript === 'string') {
        return transcript;
    }
    
    return 'No transcript available';
}

// Save meeting title
async function saveMeetingTitle(meetingId) {
    const titleInput = document.getElementById('meetingTitleInput');
    const newTitle = titleInput.value.trim();
    
    if (!newTitle) {
        alert('Title cannot be empty!');
        return;
    }
    
    try {
        await axios.put(`${API_BASE_URL}/api/meetings/${meetingId}/title`, { title: newTitle });
        
        // Reload meetings list to show updated title
        loadMeetings();
        
        // Show success message (replace input temporarily)
        const saveBtn = event.target;
        saveBtn.textContent = '✅ Saved!';
        saveBtn.disabled = true;
        setTimeout(() => {
            saveBtn.textContent = '💾 Save Title';
            saveBtn.disabled = false;
        }, 2000);
    } catch (error) {
        console.error('Error saving title:', error);
        alert('Failed to save title. Please try again.');
    }
}

// ============ GOOGLE CALENDAR SYNC ============

async function checkGoogleAuthStatus() {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/google/auth-status`);
        const btn = document.getElementById('connectGoogleBtn');
        
        if (!response.data.available) {
            btn.textContent = '❌ Not Available';
            btn.disabled = true;
            btn.title = 'Google Calendar API not installed';
        } else if (response.data.authenticated) {
            btn.textContent = '✅ Connected';
            btn.classList.add('btn-success');
            btn.disabled = true;
        } else {
            btn.textContent = 'Connect to Google';
            btn.classList.remove('btn-success');
            btn.disabled = false;
        }
    } catch (error) {
        console.error('Error checking Google auth status:', error);
        const btn = document.getElementById('connectGoogleBtn');
        // Don't disable on error - still allow connection attempt
        btn.textContent = 'Connect to Google';
        btn.classList.remove('btn-success');
        btn.disabled = false;
    }
}

async function connectGoogleCalendar() {
    try {
        // First check if available
        const statusResponse = await axios.get(`${API_BASE_URL}/api/google/auth-status`);
        if (!statusResponse.data.available) {
            alert('Google Calendar API is not installed.\n\nTo enable this feature, restart the backend and ensure the packages are installed.');
            return;
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/google/auth-url`);
        const authUrl = response.data.auth_url;
        
        // Open OAuth URL in new window
        const authWindow = window.open(authUrl, 'Google Calendar Auth', 'width=600,height=700');
        
        // Poll for window close
        const pollTimer = setInterval(() => {
            if (authWindow.closed) {
                clearInterval(pollTimer);
                checkGoogleAuthStatus();
            }
        }, 1000);
    } catch (error) {
        console.error('Error connecting to Google Calendar:', error);
        alert('Failed to connect to Google Calendar: ' + (error.response?.data?.error || error.message));
    }
}

async function syncToGoogleCalendar(meetingId) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/meetings/${meetingId}/sync-all-calendar`);
        
        if (response.data.success) {
            alert(`Synced ${response.data.synced_count} action items to Google Calendar!`);
            
            if (response.data.errors.length > 0) {
                console.error('Sync errors:', response.data.errors);
            }
            
            // Reload meeting details
            showMeetingDetail(meetingId);
        }
    } catch (error) {
        console.error('Error syncing to Google Calendar:', error);
        
        if (error.response?.status === 401) {
            alert('Please connect to Google Calendar first (Settings > Integrations)');
        } else {
            alert('Failed to sync to Google Calendar: ' + (error.response?.data?.error || error.message));
        }
    }
}

// ============ NOTION EXPORT ============

async function checkNotionStatus() {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/notion/status`);
        updateNotionStatusUI(response.data.connected);
    } catch (error) {
        console.error('Error checking Notion status:', error);
    }
}

function updateNotionStatusUI(connected) {
    const notionInput = document.getElementById('notionApiKey');
    if (connected) {
        notionInput.style.borderColor = 'green';
        notionInput.placeholder = '✅ Connected to Notion';
    } else {
        notionInput.style.borderColor = '';
        notionInput.placeholder = 'Enter Notion API key';
    }
}

async function configureNotion() {
    const apiKey = document.getElementById('notionApiKey').value.trim();
    const databaseId = document.getElementById('notionDatabaseId')?.value.trim();
    
    if (!apiKey) {
        return; // Don't configure if empty
    }
    
    try {
        const response = await axios.post(`${API_BASE_URL}/api/notion/configure`, {
            api_key: apiKey,
            database_id: databaseId || null
        });
        
        if (response.data.success) {
            updateNotionStatusUI(true);
            alert('Notion configured successfully!');
        }
    } catch (error) {
        console.error('Error configuring Notion:', error);
        updateNotionStatusUI(false);
        alert('Failed to configure Notion: ' + (error.response?.data?.error || error.message));
    }
}

async function exportToNotion(meetingId) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/meetings/${meetingId}/export-notion`);
        
        if (response.data.success) {
            alert('Meeting exported to Notion successfully!');
        }
    } catch (error) {
        console.error('Error exporting to Notion:', error);
        
        if (error.response?.status === 401) {
            alert('Please configure Notion API key first (Settings > Integrations)');
        } else {
            alert('Failed to export to Notion: ' + (error.response?.data?.error || error.message));
        }
    }
}

// ============ JIRA SYNC ============

async function checkJiraStatus() {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/jira/status`);
        updateJiraStatusUI(response.data.connected);
    } catch (error) {
        console.error('Error checking Jira status:', error);
    }
}

function updateJiraStatusUI(connected) {
    const btn = document.getElementById('connectJiraBtn');
    if (connected) {
        btn.textContent = '✅ Connected';
        btn.classList.add('btn-success');
    } else {
        btn.textContent = 'Configure Jira';
        btn.classList.remove('btn-success');
    }
}

async function configureJira() {
    const serverUrl = document.getElementById('jiraServerUrl').value.trim();
    const email = document.getElementById('jiraEmail').value.trim();
    const apiToken = document.getElementById('jiraApiToken').value.trim();
    const projectKey = document.getElementById('jiraProjectKey').value.trim();
    
    if (!serverUrl || !email || !apiToken || !projectKey) {
        alert('Please fill in all Jira fields');
        return;
    }
    
    try {
        const response = await axios.post(`${API_BASE_URL}/api/jira/configure`, {
            server_url: serverUrl,
            email: email,
            api_token: apiToken,
            project_key: projectKey
        });
        
        if (response.data.success) {
            updateJiraStatusUI(true);
            alert('Jira configured successfully!');
        }
    } catch (error) {
        console.error('Error configuring Jira:', error);
        updateJiraStatusUI(false);
        alert('Failed to configure Jira: ' + (error.response?.data?.error || error.message));
    }
}

async function syncToJira(meetingId) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/meetings/${meetingId}/sync-all-jira`);
        
        if (response.data.success) {
            alert(`Synced ${response.data.synced_count} action items to Jira!`);
            
            if (response.data.errors.length > 0) {
                console.error('Sync errors:', response.data.errors);
            }
            
            // Reload meeting details
            showMeetingDetail(meetingId);
        }
    } catch (error) {
        console.error('Error syncing to Jira:', error);
        
        if (error.response?.status === 401) {
            alert('Please configure Jira first (Settings > Integrations)');
        } else {
            alert('Failed to sync to Jira: ' + (error.response?.data?.error || error.message));
        }
    }
}

// ============ TRANSLATION ============

async function showTranslationOptions(meetingId) {
    try {
        const languagesResponse = await axios.get(`${API_BASE_URL}/api/translation/languages`);
        const languages = languagesResponse.data;
        
        // Create language selection prompt
        let languageOptions = Object.entries(languages)
            .map(([code, name]) => `${code}: ${name}`)
            .join('\n');
        
        const selectedLang = prompt(`Select language code:\n\n${languageOptions}\n\nEnter code (e.g., es):`, 'es');
        
        if (selectedLang && languages[selectedLang]) {
            await translateMeeting(meetingId, selectedLang);
        }
    } catch (error) {
        console.error('Error getting languages:', error);
        alert('Failed to load languages');
    }
}

async function translateMeeting(meetingId, targetLanguage) {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/meetings/${meetingId}/translate`, {
            language: targetLanguage
        });
        
        if (response.data.success) {
            // Show translated content in a modal/alert
            const translatedContent = `
Translated Summary (${targetLanguage}):
${response.data.translated_summary || 'N/A'}

Translated Transcript:
${response.data.translated_transcript.substring(0, 500)}...
            `;
            
            alert(translatedContent);
        }
    } catch (error) {
        console.error('Error translating meeting:', error);
        alert('Failed to translate meeting: ' + (error.response?.data?.error || error.message));
    }
}
