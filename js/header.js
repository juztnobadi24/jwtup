// ======================== HEADER COMPONENT ========================

class HeaderComponent {
    constructor() {
        this.container = document.getElementById("appHeader");
        this.currentMode = "tv";
        this.settingsModal = null;
        this.menuOpen = false;
        this.unreadMessages = 0;
        this.unreadNotifications = 0;
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
                
                <!-- Hamburger Menu Button with Badge -->
                <div class="hamburger" id="hamburgerBtn">
                    <svg viewBox="0 0 32 32">
                        <path class="line line-top-bottom" d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"></path>
                        <path class="line" d="M7 16 27 16"></path>
                    </svg>
                    <span class="burger-badge" id="burgerBadge" style="display: none;"></span>
                </div>
                
                <!-- Dropdown Menu -->
                <div class="dropdown-menu-icons" id="dropdownMenu">
                    <button class="icon-btn dropdown-item" id="messageBtn" title="Chat">
                        <svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H8L12 22L16 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                            <path d="M7 9H17M7 13H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        <span class="dropdown-label">Chat</span>
                        <span class="dropdown-badge message-badge-dropdown" id="messageBadgeDropdown" style="display: none;"></span>
                    </button>
                    <button class="icon-btn dropdown-item" id="notificationBtn" title="Notifications">
                        <svg class="icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.1892 14.0608L19.0592 12.1808C18.8092 11.7708 18.5892 10.9808 18.5892 10.5008V8.63078C18.5892 5.00078 15.6392 2.05078 12.0192 2.05078C8.38923 2.06078 5.43923 5.00078 5.43923 8.63078V10.4908C5.43923 10.9708 5.21923 11.7608 4.97923 12.1708L3.84923 14.0508C3.41923 14.7808 3.31923 15.6108 3.58923 16.3308C3.85923 17.0608 4.46923 17.6408 5.26923 17.9008C6.34923 18.2608 7.43923 18.5208 8.54923 18.7108C8.65923 18.7308 8.76923 18.7408 8.87923 18.7608C9.01923 18.7808 9.16923 18.8008 9.31923 18.8208C9.57923 18.8608 9.83923 18.8908 10.1092 18.9108C10.7392 18.9708 11.3792 19.0008 12.0192 19.0008C12.6492 19.0008 13.2792 18.9708 13.8992 18.9108C14.1292 18.8908 14.3592 18.8708 14.5792 18.8408C14.7592 18.8208 14.9392 18.8008 15.1192 18.7708C15.2292 18.7608 15.3392 18.7408 15.4492 18.7208C16.5692 18.5408 17.6792 18.2608 18.7592 17.9008C19.5292 17.6408 20.1192 17.0608 20.3992 16.3208C20.6792 15.5708 20.5992 14.7508 20.1892 14.0608Z" stroke="currentColor" stroke-width="1.2" fill="none"/>
                            <path d="M14.8297 20.01C14.4097 21.17 13.2997 22 11.9997 22C11.2097 22 10.4297 21.68 9.87969 21.11C9.55969 20.81 9.31969 20.41 9.17969 20C9.30969 20.02 9.43969 20.03 9.57969 20.05C9.80969 20.08 10.0497 20.11 10.2897 20.13C10.8597 20.18 11.4397 20.21 12.0197 20.21C12.5897 20.21 13.1597 20.18 13.7197 20.13C13.9297 20.11 14.1397 20.1 14.3397 20.07C14.4997 20.05 14.6597 20.03 14.8297 20.01Z" stroke="currentColor" stroke-width="1.2" fill="none"/>
                        </svg>
                        <span class="dropdown-label">Notifications</span>
                        <span class="dropdown-badge notification-badge-dropdown" id="notificationBadgeDropdown" style="display: none;"></span>
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
        
        this.attachEvents();
        this.setupBadgeListeners();
    }
    
    setupBadgeListeners() {
        // Listen for message count updates from Firebase Chat
        window.addEventListener('newChatMessage', (event) => {
            const message = event.detail;
            if (message.userId !== window.firebaseChat?.userId) {
                this.updateMessageBadge(1);
            }
        });
        
        // Listen for notification updates
        window.addEventListener('newNotification', () => {
            this.updateNotificationBadge(1);
        });
        
        // Check existing badges on page load
        setTimeout(() => {
            this.syncBadgesFromFirebase();
        }, 2000);
    }
    
    async syncBadgesFromFirebase() {
        if (window.firebaseChat) {
            // Get message unread count
            const messageCount = window.firebaseChat.getUnreadCount?.() || 0;
            if (messageCount > 0) {
                this.updateMessageBadge(messageCount);
            }
            
            // Get notification unread count
            const notifications = window.firebaseChat.getNotifications?.() || [];
            const unreadNotifications = notifications.filter(n => {
                const notifTime = n.timestampMs || (n.timestamp?.toMillis?.() || 0);
                const lastView = window.firebaseChat.lastNotificationViewTime || Date.now();
                return notifTime > lastView && !window.firebaseChat.isNotificationRead?.(n.id);
            }).length;
            
            if (unreadNotifications > 0) {
                this.updateNotificationBadge(unreadNotifications);
            }
        }
    }
    
    updateMessageBadge(count = null) {
        if (count === null) {
            this.unreadMessages++;
        } else {
            this.unreadMessages = count;
        }
        
        // Update dropdown badge
        const messageBadge = document.getElementById("messageBadgeDropdown");
        if (messageBadge) {
            if (this.unreadMessages > 0) {
                messageBadge.textContent = this.unreadMessages > 99 ? '99+' : this.unreadMessages;
                messageBadge.style.display = 'flex';
                messageBadge.classList.add('pulse');
                setTimeout(() => messageBadge.classList.remove('pulse'), 500);
            } else {
                messageBadge.style.display = 'none';
            }
        }
        
        // Update burger badge
        this.updateBurgerBadge();
    }
    
    updateNotificationBadge(count = null) {
        if (count === null) {
            this.unreadNotifications++;
        } else {
            this.unreadNotifications = count;
        }
        
        // Update dropdown badge
        const notificationBadge = document.getElementById("notificationBadgeDropdown");
        if (notificationBadge) {
            if (this.unreadNotifications > 0) {
                notificationBadge.textContent = this.unreadNotifications > 99 ? '99+' : this.unreadNotifications;
                notificationBadge.style.display = 'flex';
                notificationBadge.classList.add('pulse');
                setTimeout(() => notificationBadge.classList.remove('pulse'), 500);
            } else {
                notificationBadge.style.display = 'none';
            }
        }
        
        // Update burger badge
        this.updateBurgerBadge();
    }
    
    updateBurgerBadge() {
        const burgerBadge = document.getElementById("burgerBadge");
        if (!burgerBadge) return;
        
        const totalUnread = this.unreadMessages + this.unreadNotifications;
        
        if (totalUnread > 0) {
            burgerBadge.textContent = totalUnread > 99 ? '99+' : totalUnread;
            burgerBadge.style.display = 'flex';
            burgerBadge.classList.add('pulse');
            setTimeout(() => burgerBadge.classList.remove('pulse'), 500);
        } else {
            burgerBadge.style.display = 'none';
        }
    }
    
    resetMessageBadge() {
        this.unreadMessages = 0;
        const messageBadge = document.getElementById("messageBadgeDropdown");
        if (messageBadge) messageBadge.style.display = 'none';
        this.updateBurgerBadge();
    }
    
    resetNotificationBadge() {
        this.unreadNotifications = 0;
        const notificationBadge = document.getElementById("notificationBadgeDropdown");
        if (notificationBadge) notificationBadge.style.display = 'none';
        this.updateBurgerBadge();
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
                
                // Reset message badge when opening chat
                this.resetMessageBadge();
                
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
                
                // Reset notification badge when opening notifications
                this.resetNotificationBadge();
                
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
