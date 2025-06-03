// SmartList - Minimal Frontend
class SmartListApp {
    constructor() {
        this.currentListId = null;
        this.baseURL = 'http://localhost:5000/api';
        this.init();
    }

    init() {
        this.bindEvents();
        this.handleRouting();
    }

    bindEvents() {
        // Create list form
        document.getElementById('create-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateList();
        });

        // Entry submission form
        document.getElementById('entry-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmitEntry();
        });        // Navigation
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showView('home');
            window.history.pushState({}, '', window.location.pathname);
        });

        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            if (this.currentListId) {
                this.loadEntries();
            }
        });

        // Copy share URL
        document.getElementById('copy-btn').addEventListener('click', () => {
            this.copyShareURL();
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleRouting();
        });
    }    handleRouting() {
        const urlParams = new URLSearchParams(window.location.search);
        const listParam = urlParams.get('list');
        
        if (listParam) {
            this.loadList(listParam);
        } else {
            this.showView('home');
        }
    }

    async handleCreateList() {
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();

        if (!title || !description) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        this.showLoading(true);        try {
            const response = await fetch(`${this.baseURL}/lists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description }),
            });

            if (!response.ok) {
                throw new Error('Failed to create list');
            }            const data = await response.json();
            this.showToast('List created successfully!', 'success');
            
            // Navigate to the new list using query parameter
            window.history.pushState({}, '', `?list=${data.shareableId}`);
            this.loadList(data.shareableId);
            
            // Clear form
            document.getElementById('create-form').reset();
        } catch (error) {
            console.error('Error creating list:', error);
            this.showToast('Failed to create list', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadList(shareableId) {
        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.baseURL}/lists/${shareableId}`);
            
            if (!response.ok) {
                throw new Error('List not found');
            }            const data = await response.json();
            this.currentListId = shareableId;
            
            // Store the share URL for the copy button
            this.shareURL = `${window.location.origin}?list=${shareableId}`;
              // Show list view first to ensure DOM elements are visible
            this.showView('list');
            
            // Wait for DOM to be ready and update list info
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const titleElement = document.getElementById('list-title');
            const descriptionElement = document.getElementById('list-description');
            
            if (titleElement && descriptionElement) {
                titleElement.textContent = data.title;
                descriptionElement.textContent = data.description;
            } else {
                console.error('Could not find list title or description elements');
            }
            
            // Load entries
            this.loadEntries();
        } catch (error) {
            console.error('Error loading list:', error);
            this.showToast('Failed to load list', 'error');
            this.showView('home');
        } finally {
            this.showLoading(false);
        }
    }

    async loadEntries() {
        if (!this.currentListId) return;

        try {
            const response = await fetch(`${this.baseURL}/lists/${this.currentListId}/entries`);
            
            if (!response.ok) {
                throw new Error('Failed to load entries');
            }

            const entries = await response.json();
            this.renderEntries(entries);
        } catch (error) {
            console.error('Error loading entries:', error);
            this.showToast('Failed to load entries', 'error');
        }
    }

    renderEntries(entries) {
        const container = document.getElementById('entries-list');
        const countElement = document.getElementById('entry-count');
        
        countElement.textContent = entries.length;

        if (entries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No submissions yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = entries.map(entry => `
            <div class="entry-item">
                <div class="entry-info">
                    <div class="entry-name">${this.escapeHtml(entry.name)}</div>
                    <div class="entry-roll">${this.escapeHtml(entry.rollNo)}</div>
                </div>
                <div class="entry-time">
                    ${this.formatDate(entry.submittedAt)}
                </div>
            </div>
        `).join('');
    }

    async handleSubmitEntry() {
        const name = document.getElementById('name').value.trim();
        const rollNo = document.getElementById('rollNo').value.trim();

        if (!name || !rollNo) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        if (!this.currentListId) {
            this.showToast('No list selected', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/lists/${this.currentListId}/entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, rollNo }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit entry');
            }

            this.showToast('Entry submitted successfully!', 'success');
            
            // Clear form
            document.getElementById('entry-form').reset();
            
            // Reload entries
            this.loadEntries();
        } catch (error) {
            console.error('Error submitting entry:', error);
            this.showToast(error.message, 'error');
        }
    }    copyShareURL() {
        if (this.shareURL) {
            // Use the modern Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(this.shareURL).then(() => {
                    this.showToast('Share link copied!', 'success');
                }).catch(() => {
                    this.fallbackCopyTextToClipboard(this.shareURL);
                });
            } else {
                // Fallback for older browsers
                this.fallbackCopyTextToClipboard(this.shareURL);
            }
        } else {
            this.showToast('No share link available', 'error');
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Share link copied!', 'success');
        } catch (err) {
            this.showToast('Failed to copy link', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show target view
        document.getElementById(`${viewName}-view`).classList.add('active');
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.smartList = new SmartListApp();
});
