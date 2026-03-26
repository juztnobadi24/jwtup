// ======================== PLAYER COMPONENT WITH HEADERS SUPPORT ========================

class PlayerComponent {
    constructor() {
        this.container = document.getElementById("playerArea");
        this.videoPlayer = null;
        this.errorMessageDiv = null;
        this.videoContainer = null;
        this.radioLogoContainer = null;
        
        this.jwPlayer = null;
        this.jwPlayerContainer = null;
        this.currentChannel = null;
        this.isLoading = false;
        this.loadRetryCount = 0;
        this.maxRetries = 2;
        this.loaderOverlay = null;
        
        this.fullscreenBtn = null;
        this.fullscreenTimeout = null;
        this.isFullscreenBtnVisible = false;
        this.isFullscreen = false;
        
        this.jwPlayerReady = false;
        this.jwPlayerLoaded = false;
        
        // Store current headers for use in playlist
        this.currentHeaders = null;
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="video-container" id="videoContainer">
                <video id="videoPlayer" playsinline disablePictureInPicture autoplay style="display: none;"></video>
                <div id="jwplayer-container" style="width: 100%; height: 100%;"></div>
                <div class="radio-logo-container" id="radioLogoContainer" style="display: none;"></div>
                <button class="fullscreen-toggle-btn" id="fullscreenToggleBtn">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
            <div class="error-message" id="errorMessage"></div>
        `;
        
        this.videoPlayer = document.getElementById("videoPlayer");
        this.errorMessageDiv = document.getElementById("errorMessage");
        this.videoContainer = document.getElementById("videoContainer");
        this.radioLogoContainer = document.getElementById("radioLogoContainer");
        this.jwPlayerContainer = document.getElementById("jwplayer-container");
        
        if (this.videoPlayer) {
            this.videoPlayer.removeAttribute("controls");
            this.videoPlayer.controls = false;
            this.videoPlayer.autoplay = true;
        }
        
        this.setupFullscreenButton();
        this.loadJWPlayerScript();
        
        window.domElements = {
            videoPlayer: this.videoPlayer,
            errorMessage: this.errorMessageDiv
        };
    }
    
    loadJWPlayerScript() {
        if (this.jwPlayerLoaded) return;
        
        if (typeof jwplayer !== 'undefined') {
            this.jwPlayerLoaded = true;
            console.log("✅ JW Player already loaded");
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jwplayer.com/libraries/4t00MwmP.js';
        script.async = true;
        script.onload = () => {
            this.jwPlayerLoaded = true;
            console.log("✅ JW Player script loaded");
        };
        script.onerror = () => {
            console.error("❌ Failed to load JW Player");
            this.jwPlayerLoaded = false;
        };
        document.head.appendChild(script);
    }
    
    initJWPlayer(streamUrl, channelName, headers = null) {
        return new Promise((resolve, reject) => {
            if (!this.jwPlayerLoaded) {
                this.loadJWPlayerScript();
                setTimeout(() => this.initJWPlayer(streamUrl, channelName, headers).then(resolve).catch(reject), 500);
                return;
            }
            
            if (typeof jwplayer === 'undefined') {
                reject(new Error("JW Player not available"));
                return;
            }
            
            if (this.jwPlayer) {
                try {
                    this.jwPlayer.remove();
                } catch(e) {}
                this.jwPlayer = null;
            }
            
            this.jwPlayerContainer.innerHTML = '';
            this.jwPlayerContainer.style.display = 'block';
            this.videoPlayer.style.display = 'none';
            
            console.log("JW Player loading URL:", streamUrl);
            if (headers) {
                console.log("With headers:", Object.keys(headers));
            }
            
            // Create playlist item with headers if available
            let playlistItem = {
                file: streamUrl,
                title: channelName
            };
            
            // JW Player supports custom headers via playlist item (limited support)
            if (headers) {
                // Some JW Player versions support custom headers
                if (headers['User-Agent']) {
                    playlistItem.userAgent = headers['User-Agent'];
                }
                // For Referer, we need to use a different approach
                // JW Player doesn't natively support custom Referer headers
            }
            
            const config = {
                playlist: [playlistItem],
                width: '100%',
                height: '100%',
                aspectratio: '16:9',
                autostart: true,
                primary: 'html5',
                preload: 'auto'
            };
            
            try {
                this.jwPlayer = jwplayer(this.jwPlayerContainer.id).setup(config);
                
                let resolved = false;
                
                this.jwPlayer.on('ready', () => {
                    if (!resolved) {
                        resolved = true;
                        this.jwPlayerReady = true;
                        console.log("✅ JW Player ready");
                        resolve(true);
                    }
                });
                
                this.jwPlayer.on('error', (error) => {
                    console.error("JW Player error:", error);
                    if (!resolved) {
                        resolved = true;
                        reject(error);
                    }
                });
                
                this.jwPlayer.on('play', () => console.log("▶️ Playing"));
                this.jwPlayer.on('pause', () => console.log("⏸️ Paused"));
                
                setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        reject(new Error("JW Player load timeout"));
                    }
                }, 30000);
                
            } catch (error) {
                console.error("JW Player init error:", error);
                reject(error);
            }
        });
    }
    
    destroyJWPlayer() {
        if (this.jwPlayer) {
            try {
                this.jwPlayer.remove();
            } catch(e) {}
            this.jwPlayer = null;
        }
        this.jwPlayerReady = false;
        if (this.jwPlayerContainer) {
            this.jwPlayerContainer.innerHTML = '';
        }
        this.videoPlayer.style.display = 'block';
    }
    
    showRadioLogo(channel) {
        if (!this.radioLogoContainer) return;
        
        const isRadio = channel.type === "Radio";
        
        if (!isRadio) {
            this.radioLogoContainer.style.display = 'none';
            return;
        }
        
        let logoUrl = channel.logo || (channel.logoLocal ? `images/${channel.logoLocal}.webp` : null) || 'https://via.placeholder.com/200x200/1a1e2c/f97316?text=📻';
        
        this.radioLogoContainer.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'radio-logo-wrapper';
        
        const logoContent = document.createElement('div');
        logoContent.className = 'radio-logo-content';
        
        const img = document.createElement('img');
        img.className = 'radio-logo';
        img.src = logoUrl;
        img.alt = channel.name;
        img.onerror = () => { img.src = 'https://via.placeholder.com/200x200/1a1e2c/f97316?text=📻'; };
        
        logoContent.appendChild(img);
        wrapper.appendChild(logoContent);
        this.radioLogoContainer.appendChild(wrapper);
        
        const stationName = document.createElement('div');
        stationName.className = 'station-name';
        stationName.textContent = channel.name;
        this.radioLogoContainer.appendChild(stationName);
        
        this.radioLogoContainer.style.display = 'flex';
    }
    
    hideRadioLogo() {
        if (this.radioLogoContainer) this.radioLogoContainer.style.display = 'none';
    }
    
    setupFullscreenButton() {
        this.fullscreenBtn = document.getElementById('fullscreenToggleBtn');
        if (!this.fullscreenBtn) return;
        
        this.hideFullscreenButton();
        
        this.fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.toggleFullscreen();
        });
        
        if (this.videoContainer) {
            this.videoContainer.addEventListener('click', () => this.showFullscreenButton());
            this.videoContainer.addEventListener('touchstart', () => this.showFullscreenButton());
        }
        
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());
    }
    
    onFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
        this.isFullscreen = isFullscreen;
        
        if (this.fullscreenBtn) {
            this.fullscreenBtn.innerHTML = isFullscreen ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
        }
        this.showFullscreenButton();
    }
    
    showFullscreenButton() {
        if (!this.fullscreenBtn) return;
        if (this.fullscreenTimeout) clearTimeout(this.fullscreenTimeout);
        this.fullscreenBtn.classList.add('show');
        this.fullscreenTimeout = setTimeout(() => this.hideFullscreenButton(), 3000);
    }
    
    hideFullscreenButton() {
        if (!this.fullscreenBtn) return;
        this.fullscreenBtn.classList.remove('show');
        if (this.fullscreenTimeout) clearTimeout(this.fullscreenTimeout);
    }
    
    toggleFullscreen() {
        if (!this.videoContainer) return;
        const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
        isFullscreen ? this.exitFullscreen() : this.enterFullscreen();
    }
    
    enterFullscreen() {
        if (!this.videoContainer) return;
        const element = this.videoContainer;
        const request = element.requestFullscreen || element.webkitRequestFullscreen || element.mozRequestFullScreen || element.msRequestFullscreen;
        if (request) request.call(element).catch(e => console.error("Fullscreen failed:", e));
    }
    
    exitFullscreen() {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) exit.call(document);
    }
    
    showError(msg) {
        console.error(msg);
        if (this.errorMessageDiv) {
            this.errorMessageDiv.textContent = msg;
            this.errorMessageDiv.classList.add("show");
            setTimeout(() => this.errorMessageDiv.classList.remove("show"), 8000);
        }
        this.hideLoader();
    }
    
    showLoader(message = "Loading stream...") {
        this.hideLoader();
        this.loaderOverlay = document.createElement('div');
        this.loaderOverlay.className = 'loader-overlay';
        this.loaderOverlay.innerHTML = `<div class="loader"><div class="loader-text">${message}</div></div>`;
        if (this.videoContainer) {
            this.videoContainer.style.position = 'relative';
            this.videoContainer.appendChild(this.loaderOverlay);
        }
    }
    
    hideLoader() {
        if (this.loaderOverlay && this.loaderOverlay.parentNode) {
            this.loaderOverlay.remove();
            this.loaderOverlay = null;
        }
    }
    
    updateLoaderMessage(message) {
        if (this.loaderOverlay) {
            const text = this.loaderOverlay.querySelector('.loader-text');
            if (text) text.textContent = message;
        }
    }
    
    async loadStream(url, drmConfig = null, headers = null, isRetry = false) {
        console.log("Loading stream:", url);
        
        this.showLoader("Loading stream...");
        
        try {
            await this.destroyJWPlayer();
            
            const success = await this.initJWPlayer(url, this.currentChannel?.name || "Channel", headers);
            
            if (success) {
                this.hideLoader();
                return true;
            }
        } catch (error) {
            console.error("JW Player failed:", error);
            
            if (!isRetry && this.loadRetryCount < this.maxRetries) {
                this.loadRetryCount++;
                this.updateLoaderMessage(`Retrying (${this.loadRetryCount}/${this.maxRetries})...`);
                await new Promise(r => setTimeout(r, 2000));
                return this.loadStream(url, drmConfig, headers, true);
            }
            
            this.hideLoader();
            
            // Show specific error message for Kapatid Channel
            if (url.includes('kapatid') || url.includes('qp-pldt')) {
                this.showError(`Kapatid Channel requires VPN or is geo-restricted. Please check your connection.`);
            } else {
                this.showError(`Failed to load stream. The stream may be offline.`);
            }
            return false;
        }
        
        this.hideLoader();
        return false;
    }
    
    async playChannel(channel) {
        if (!channel || !channel.streamUrl) {
            console.error("Invalid channel: missing stream URL");
            return false;
        }
        
        if (this.isLoading) {
            console.log("Already loading a channel, waiting...");
            await new Promise(resolve => {
                const check = setInterval(() => {
                    if (!this.isLoading) { clearInterval(check); resolve(); }
                }, 100);
                setTimeout(() => { clearInterval(check); resolve(); }, 3000);
            });
        }
        
        this.isLoading = true;
        this.loadRetryCount = 0;
        this.showLoader("Loading channel...");
        
        if (channel.type === "Radio") {
            this.showRadioLogo(channel);
        } else {
            this.hideRadioLogo();
        }
        
        try {
            console.log("Switching to channel:", channel.name);
            this.currentChannel = channel;
            
            let drmConfig = null;
            let headers = null;
            
            if (channel.drm) drmConfig = channel.drm;
            if (channel.headers) headers = channel.headers;
            
            const success = await this.loadStream(channel.streamUrl, drmConfig, headers);
            
            if (success) {
                window.activeChannelId = channel.id;
                if (window.sidebarComponent) {
                    window.sidebarComponent.updateActiveChannel(channel.id);
                }
                console.log("✅ Channel playing successfully:", channel.name);
            } else {
                this.showError(`Failed to play ${channel.name}`);
            }
            
            return success;
        } catch (error) {
            console.error("Error in playChannel:", error);
            this.showError(`Error playing ${channel.name}: ${error.message}`);
            return false;
        } finally {
            setTimeout(() => { this.isLoading = false; }, 500);
        }
    }
    
    updateModeUI(mode) {
        if (this.videoContainer) {
            if (mode === "tv") {
                this.videoContainer.style.background = "#000";
                this.hideRadioLogo();
            } else {
                this.videoContainer.style.background = "linear-gradient(135deg, #1a1f2e 0%, #0f1222 100%)";
                if (this.currentChannel && this.currentChannel.type === "Radio") {
                    this.showRadioLogo(this.currentChannel);
                }
            }
        }
    }
}

window.PlayerComponent = PlayerComponent;
