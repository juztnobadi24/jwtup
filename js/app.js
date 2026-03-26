// ======================== MAIN APPLICATION ========================

let headerComponent;
let sidebarComponent;
let playerComponent;
let fullscreenManager;
let gestureControls;

// Load channels from JSON
async function loadChannelsFromJson() {
    try {
        const response = await fetch('./channels.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const jsonData = await response.json();
        window.channelsData = jsonData.map((ch, index) => ({ 
            ...ch, 
            id: index + 1,
            type: ch.type || (ch.category === "Radio" ? "Radio" : "TV")
        }));
        
        const hasRadio = window.channelsData.some(ch => ch.type === "Radio");
        if (!hasRadio) {
            const radioSamples = [
                { name: "Heart FM", type: "Radio", category: "Music", streamUrl: "https://icecast.radio.com/heartfm.mp3", id: window.channelsData.length + 1 },
                { name: "News Radio", type: "Radio", category: "News", streamUrl: "https://icecast.radio.com/news.mp3", id: window.channelsData.length + 2 },
                { name: "Classic Rock Radio", type: "Radio", category: "Music", streamUrl: "https://icecast.radio.com/rock.mp3", id: window.channelsData.length + 3 }
            ];
            window.channelsData = [...window.channelsData, ...radioSamples];
        }
        
        return true;
    } catch (err) {
        console.warn("fetch failed, using fallback sample", err);
        const fallbackSample = [
            { "name": "Kapamilya Channel", "type": "TV", "category": "Entertainment", "streamUrl": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { "name": "GMA 7", "type": "TV", "category": "Entertainment", "streamUrl": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { "name": "CNN International", "type": "TV", "category": "News", "streamUrl": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
            { "name": "Radio Sample 1", "type": "Radio", "category": "Music", "streamUrl": "https://icecast.radio.com/stream.mp3" },
            { "name": "Radio Sample 2", "type": "Radio", "category": "News", "streamUrl": "https://icecast.radio.com/stream2.mp3" }
        ];
        window.channelsData = fallbackSample.map((ch, index) => ({ ...ch, id: index + 1 }));
        showError("Loaded sample channels. Please ensure channels.json is in the same folder.");
        return true;
    }
}

// Mode change handler
function onModeChange(mode) {
    window.currentMode = mode;
    
    if (headerComponent) headerComponent.updateModeUI(mode);
    if (playerComponent) playerComponent.updateModeUI(mode);
    
    window.currentCategory = "all";
    window.currentFilter = "all";
    window.searchQuery = "";
    
    if (sidebarComponent) {
        sidebarComponent.resetFilters();
        sidebarComponent.updateCategoriesDropdown();
        sidebarComponent.renderChannelList();
    }
}

// Filter change handler
function onFilterChange() {
    if (sidebarComponent) {
        sidebarComponent.renderChannelList();
    }
}

// Category change handler
function onCategoryChange() {
    if (sidebarComponent) {
        sidebarComponent.renderChannelList();
    }
}

// Search change handler
function onSearchChange() {
    if (sidebarComponent) {
        sidebarComponent.renderChannelList();
    }
}

// Global channel switching lock
window.isSwitchingChannel = false;
window.channelSwitchTimeout = null;

// Channel select handler - PLAYS CHANNEL AUTOMATICALLY
async function onChannelSelect(channel) {
    if (!playerComponent) return;
    
    console.log("Selected channel:", channel.name);
    
    if (window.isSwitchingChannel) {
        console.log("Already switching channel, waiting...");
        await new Promise(resolve => {
            const checkLock = setInterval(() => {
                if (!window.isSwitchingChannel) {
                    clearInterval(checkLock);
                    resolve();
                }
            }, 100);
            setTimeout(() => {
                clearInterval(checkLock);
                console.log("Lock timeout, forcing clear...");
                window.isSwitchingChannel = false;
                if (window.channelSwitchTimeout) clearTimeout(window.channelSwitchTimeout);
                resolve();
            }, 3000);
        });
        console.log("Lock cleared, playing channel...");
    }
    
    window.isSwitchingChannel = true;
    
    if (window.channelSwitchTimeout) {
        clearTimeout(window.channelSwitchTimeout);
    }
    
    try {
        // Destroy current player before loading new one
        if (playerComponent.destroyJWPlayer) {
            await playerComponent.destroyJWPlayer();
        } else if (playerComponent.destroyPlayers) {
            await playerComponent.destroyPlayers();
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const success = await playerComponent.playChannel(channel);
        
        if (success) {
            console.log("Channel playing successfully:", channel.name);
        } else {
            console.error("Failed to play channel:", channel.name);
            showError(`Failed to play ${channel.name}. Check stream URL.`);
        }
    } catch (error) {
        console.error("Error playing channel:", error);
        showError(`Error playing ${channel.name}: ${error.message}`);
    } finally {
        window.channelSwitchTimeout = setTimeout(() => {
            window.isSwitchingChannel = false;
            window.channelSwitchTimeout = null;
        }, 2000);
    }
}

// Initialize Firebase Chat features
function initFirebaseFeatures() {
    setTimeout(() => {
        if (typeof initFirebaseChat === 'function') {
            try {
                initFirebaseChat();
                console.log("Firebase Chat initialized successfully");
            } catch (error) {
                console.error("Failed to initialize Firebase Chat:", error);
            }
        } else {
            console.warn("Firebase Chat not available. Running without chat features.");
        }
    }, 1000);
}

// Initialize application
async function initApp() {
    console.log("Initializing JUZT IPTV App...");
    
    headerComponent = new HeaderComponent();
    sidebarComponent = new SidebarComponent();
    playerComponent = new PlayerComponent();
    
    window.sidebarComponent = sidebarComponent;
    
    headerComponent.render();
    sidebarComponent.render();
    playerComponent.render();
    
    window.onModeChange = onModeChange;
    window.onFilterChange = onFilterChange;
    window.onCategoryChange = onCategoryChange;
    window.onSearchChange = onSearchChange;
    window.onChannelSelect = onChannelSelect;
    
    await loadChannelsFromJson();
    
    if (window.channelsData.length === 0) {
        showError("No channels loaded. Check data source.");
        return;
    }
    
    sidebarComponent.updateCategoriesDropdown();
    
    const videoContainer = document.getElementById('videoContainer');
    const videoPlayer = document.getElementById('videoPlayer');
    const sidebar = document.getElementById('channelSidebar');
    const header = document.getElementById('appHeader');
    
    fullscreenManager = new FullscreenManager();
    fullscreenManager.init(videoContainer, videoPlayer, sidebar, header);
    
    if (videoPlayer && videoContainer) {
        gestureControls = new GestureControls(videoPlayer, videoContainer);
    }
    
    onModeChange("tv");
    initFirebaseFeatures();
    
    window.addEventListener('orientationchange', () => {
        console.log("Orientation changed - manual fullscreen only");
    });
    
    if (playerComponent && playerComponent.videoPlayer) {
        playerComponent.videoPlayer.addEventListener('play', () => {
            console.log("Video playing");
        });
    }
    
    console.log("✅ JUZT IPTV App Initialized");
    console.log(`📺 Loaded ${window.channelsData.length} channels`);
    console.log(`📺 TV Channels: ${window.channelsData.filter(ch => ch.type === "TV").length}`);
    console.log(`🎵 Radio Stations: ${window.channelsData.filter(ch => ch.type === "Radio").length}`);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log("App hidden - notifications will still work");
    } else {
        console.log("App visible - refreshing UI");
        if (sidebarComponent) {
            sidebarComponent.renderChannelList();
        }
        if (window.firebaseChat) {
            const badge = document.querySelector('.message-badge');
            if (badge && document.hasFocus()) {
                window.firebaseChat.unreadCount = 0;
                window.firebaseChat.updateBadge();
            }
        }
    }
});

window.addEventListener('online', () => {
    showError("Connection restored! 🎉");
    console.log("App is online");
    
    if (playerComponent && playerComponent.currentChannel) {
        setTimeout(() => {
            playerComponent.playChannel(playerComponent.currentChannel);
        }, 1000);
    }
});

window.addEventListener('offline', () => {
    showError("You're offline. Check your internet connection.");
    console.log("App is offline");
});

window.addEventListener('beforeunload', () => {
    if (window.firebaseChat && window.firebaseChat.destroy) {
        window.firebaseChat.destroy();
    }
    
    if (gestureControls && gestureControls.destroy) {
        gestureControls.destroy();
    }
    
    if (fullscreenManager && fullscreenManager.destroy) {
        fullscreenManager.destroy();
    }
    
    if (window.channelSwitchTimeout) {
        clearTimeout(window.channelSwitchTimeout);
    }
});

initApp().catch(err => {
    console.error("Init error:", err);
    showError("Failed to initialize app: " + err.message);
});
