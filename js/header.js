// ======================== HEADER COMPONENT ========================

class HeaderComponent {
    constructor() {
        this.container = document.getElementById("appHeader");
        this.currentMode = "tv";
        this.settingsModal = null;
        this.menuOpen = false;
        this.messageBadgeCount = 0;
        this.notificationBadgeCount = 0;
    }
    
    hideAddressBar() {
        window.scrollTo(0, 1);
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            setTimeout(() => {
                window.scrollTo(0, 1);
            }, 50);
        }
    }

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="logo-area">
                <h1><i class="fas fa-tv"></i> JUZT</h1>
            </div>
            <div class="header-controls">
                <!-- Glass Toggle for TV/Radio/Movies - Icons Only -->
                <div class="glass-radio-group">
                    <input type="radio" name="media-mode" id="glass-tv" value="tv" checked>
                    <label for="glass-tv">
                        <i class="fas fa-tv"></i>
                    </label>
                    
                    <input type="radio" name="media-mode" id="glass-radio" value="radio">
                    <label for="glass-radio">
                        <i class="fas fa-headphones"></i>
                    </label>
                    
                    <input type="radio" name="media-mode" id="glass-movies" value="movies">
                    <label for="glass-movies">
                        <i class="fas fa-film"></i>
                    </label>
                    
                    <div class="glass-glider"></div>
                </div>
                
                <!-- Hamburger Menu Button -->
                <div class="hamburger" id="hamburgerBtn">
                    <svg viewBox="0 0 32 32">
                        <path class="line line-top-bottom" d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"></path>
                        <path class="line" d="M7 16 27 16"></path>
                    </svg>
                    <span class="hamburger-badge" id="hamburgerBadge" style="display: none;"></span>
                </div>
                
                <!-- Dropdown Menu -->
                <div class="dropdown-menu-icons" id="dropdownMenu">
                    <button class="icon-btn dropdown-item" id="messageBtn" title="Chat">
                        <div class="icon-with-badge">
                            <svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H8L12 22L16 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                                <path d="M7 9H17M7 13H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                            <span class="badge-marker" id="messageBadge" style="display: none;"></span>
                        </div>
                        <span class="dropdown-label">Chat</span>
                    </button>
                    <button class="icon-btn dropdown-item" id="notificationBtn" title="Announcements">
                        <div class="icon-with-badge">
                            <svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8V11.1C6 12.4 5.5 13.6 4.7 14.5L4.5 14.7C3.5 15.9 4.2 17.6 5.8 17.9C10.4 18.7 13.6 18.7 18.2 17.9C19.8 17.6 20.5 15.9 19.5 14.7L19.3 14.5C18.5 13.6 18 12.3 18 11.1V8Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                                <path d="M9 19C9.3978 20.1648 10.3356 21.0826 11.5 21.478C12.6644 21.8734 13.9356 21.7246 15 20.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                            <span class="badge-marker" id="notificationBadge" style="display: none;"></span>
                        </div>
                        <span class="dropdown-label">Announcements</span>
                    </button>
                    <button class="icon-btn dropdown-item" id="settingsBtn" title="Settings">
                        <svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.9,10.59,20,8.69V6a2,2,0,0,0-2-2H15.31l-1.9-1.9a2,2,0,0,0-2.82,0L8.69,4H6A2,2,0,0,0,4,6V8.69l-1.9,1.9a2,2,0,0,0,0,2.82L4,15.31V18a2,2,0,0,0,2,2H8.69l1.9,1.9a2,2,0,0,0,2.82,0l1.9-1.9H18a2,2,0,0,0,2-2V15.31l1.9-1.9A2,2,0,0,0,21.9,10.59ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                        </svg>
                        <span class="dropdown-label">Settings</span>
                    </button>
                </div>
            </div>
        `;
        
        // Add styles for badges
        this.addBadgeStyles();
        this.attachEvents();
    }
    
    addBadgeStyles() {
        if (document.getElementById('badge-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'badge-styles';
        style.textContent = `
            .icon-with-badge {
                position: relative;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            .badge-marker {
                position: absolute;
                top: -6px;
                right: -8px;
                min-width: 18px;
                height: 18px;
                background: #ef4444;
                color: white;
                border-radius: 20px;
                font-size: 10px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 5px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.2);
                z-index: 10;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                line-height: 1;
                white-space: nowrap;
            }
            
            .hamburger {
                position: relative;
            }
            
            .hamburger-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                min-width: 18px;
                height: 18px;
                background: #ef4444;
                color: white;
                border-radius: 20px;
                font-size: 10px;
                font-weight: 600;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 5px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.2);
                z-index: 15;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                line-height: 1;
            }
            
            .dropdown-item {
                position: relative;
            }
            
            /* Animation for badge update */
            @keyframes badgePulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
            
            .badge-marker.update, .hamburger-badge.update {
                animation: badgePulse 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    updateMessageBadge(count) {
        this.messageBadgeCount = count;
        const messageBadge = document.getElementById('messageBadge');
        const hamburgerBadge = document.getElementById('hamburgerBadge');
        
        if (count > 0) {
            if (messageBadge) {
                messageBadge.textContent = count > 99 ? '99+' : count;
                messageBadge.style.display = 'flex';
                messageBadge.classList.add('update');
                setTimeout(() => messageBadge.classList.remove('update'), 300);
            }
            this.updateTotalBadge();
        } else {
            if (messageBadge) {
                messageBadge.style.display = 'none';
            }
            this.updateTotalBadge();
        }
    }
    
    updateAnnouncementBadge(count) {
        this.notificationBadgeCount = count;
        const notificationBadge = document.getElementById('notificationBadge');
        const hamburgerBadge = document.getElementById('hamburgerBadge');
        
        if (count > 0) {
            if (notificationBadge) {
                notificationBadge.textContent = count > 99 ? '99+' : count;
                notificationBadge.style.display = 'flex';
                notificationBadge.classList.add('update');
                setTimeout(() => notificationBadge.classList.remove('update'), 300);
            }
            this.updateTotalBadge();
        } else {
            if (notificationBadge) {
                notificationBadge.style.display = 'none';
            }
            this.updateTotalBadge();
        }
    }
    
    updateTotalBadge() {
        const total = this.messageBadgeCount + this.notificationBadgeCount;
        const hamburgerBadge = document.getElementById('hamburgerBadge');
        
        if (total > 0) {
            if (hamburgerBadge) {
                hamburgerBadge.textContent = total > 99 ? '99+' : total;
                hamburgerBadge.style.display = 'flex';
                hamburgerBadge.classList.add('update');
                setTimeout(() => hamburgerBadge.classList.remove('update'), 300);
            }
        } else {
            if (hamburgerBadge) {
                hamburgerBadge.style.display = 'none';
            }
        }
    }
    
    attachEvents() {
        // Get toggle radio inputs
        const tvRadio = document.getElementById("glass-tv");
        const radioRadio = document.getElementById("glass-radio");
        const moviesRadio = document.getElementById("glass-movies");
        const hamburgerBtn = document.getElementById("hamburgerBtn");
        const dropdownMenu = document.getElementById("dropdownMenu");
        
        // TV mode handler
        if (tvRadio) {
            tvRadio.addEventListener("change", () => {
                if (tvRadio.checked && window.currentMode !== "tv") {
                    this.hideAddressBar();
                    if (typeof window.onModeChange === "function") {
                        window.onModeChange("tv");
                    }
                }
            });
        }
        
        // Radio mode handler
        if (radioRadio) {
            radioRadio.addEventListener("change", () => {
                if (radioRadio.checked && window.currentMode !== "radio") {
                    this.hideAddressBar();
                    if (typeof window.onModeChange === "function") {
                        window.onModeChange("radio");
                    }
                }
            });
        }
        
        // Movies mode handler
        if (moviesRadio) {
            moviesRadio.addEventListener("change", () => {
                if (moviesRadio.checked && window.currentMode !== "movies") {
                    this.hideAddressBar();
                    if (typeof window.onModeChange === "function") {
                        window.onModeChange("movies");
                    }
                }
            });
        }
        
        // Function to open dropdown
        const openDropdown = () => {
            hamburgerBtn.classList.add("active");
            dropdownMenu.classList.add("show");
            this.menuOpen = true;
        };
        
        // Function to close dropdown
        const closeDropdown = () => {
            hamburgerBtn.classList.remove("active");
            dropdownMenu.classList.remove("show");
            this.menuOpen = false;
        };
        
        // Toggle dropdown function
        const toggleDropdown = () => {
            if (this.menuOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        };
        
        // Hamburger button click handler
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.hideAddressBar();
                toggleDropdown();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (this.menuOpen && hamburgerBtn && !hamburgerBtn.contains(e.target) && 
                dropdownMenu && !dropdownMenu.contains(e.target)) {
                closeDropdown();
            }
        });
        
        // Prevent clicks inside dropdown from closing it
        if (dropdownMenu) {
            dropdownMenu.addEventListener("click", (e) => {
                e.stopPropagation();
            });
        }
        
        // Message button
        const messageBtn = document.getElementById("messageBtn");
        const notificationBtn = document.getElementById("notificationBtn");
        const settingsBtn = document.getElementById("settingsBtn");
        
        const removeActiveFromIcons = () => {
            [messageBtn, notificationBtn, settingsBtn].forEach(icon => {
                if (icon) icon.classList.remove('active');
            });
        };
        
        if (messageBtn) {
            messageBtn.addEventListener("click", () => {
                this.hideAddressBar();
                removeActiveFromIcons();
                messageBtn.classList.add('active');
                
                // Clear message badge immediately when opening chat
                if (window.firebaseChat && this.messageBadgeCount > 0) {
                    window.firebaseChat.markAllMessagesAsRead();
                    this.updateMessageBadge(0);
                }
                
                // Close the dropdown
                closeDropdown();
                
                if (window.chatUI) {
                    window.chatUI.open();
                }
                
                const checkModalClose = setInterval(() => {
                    if (window.chatUI && !window.chatUI.isOpen) {
                        messageBtn.classList.remove('active');
                        clearInterval(checkModalClose);
                    }
                }, 100);
            });
        }
        
        if (notificationBtn) {
            notificationBtn.addEventListener("click", () => {
                this.hideAddressBar();
                removeActiveFromIcons();
                notificationBtn.classList.add('active');
                
                // Clear notification badge immediately when opening announcements
                if (window.firebaseChat && this.notificationBadgeCount > 0) {
                    window.firebaseChat.markAllNotificationsAsRead();
                    this.updateAnnouncementBadge(0);
                }
                
                // Close the dropdown
                closeDropdown();
                
                if (window.notificationsUI) {
                    window.notificationsUI.open();
                }
                
                const checkModalClose = setInterval(() => {
                    if (window.notificationsUI && !window.notificationsUI.isOpen) {
                        notificationBtn.classList.remove('active');
                        clearInterval(checkModalClose);
                    }
                }, 100);
            });
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener("click", () => {
                this.hideAddressBar();
                removeActiveFromIcons();
                settingsBtn.classList.add('active');
                
                // Close the dropdown
                closeDropdown();
                
                if (!this.settingsModal) {
                    this.settingsModal = new SettingsModal();
                    this.settingsModal.createModal();
                }
                this.settingsModal.open();
                
                const checkModalClose = setInterval(() => {
                    if (!this.settingsModal.isOpen) {
                        settingsBtn.classList.remove('active');
                        clearInterval(checkModalClose);
                    }
                }, 100);
            });
        }
        
        if (this.container) {
            this.container.addEventListener('click', () => this.hideAddressBar());
            this.container.addEventListener('touchstart', () => this.hideAddressBar());
        }
    }
    
    updateModeUI(mode) {
        this.currentMode = mode;
        
        // Update radio buttons based on mode
        const tvRadio = document.getElementById("glass-tv");
        const radioRadio = document.getElementById("glass-radio");
        const moviesRadio = document.getElementById("glass-movies");
        
        if (mode === "tv" && tvRadio && !tvRadio.checked) {
            tvRadio.checked = true;
        } else if (mode === "radio" && radioRadio && !radioRadio.checked) {
            radioRadio.checked = true;
        } else if (mode === "movies" && moviesRadio && !moviesRadio.checked) {
            moviesRadio.checked = true;
        }
        
        this.hideAddressBar();
    }
}

window.HeaderComponent = HeaderComponent;
