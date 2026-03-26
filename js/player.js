// ======================== PLAYER COMPONENT WITH HLS PLAYER FOR HTTP ========================

class PlayerComponent {
    constructor() {
        this.container = document.getElementById("playerArea");
        this.videoPlayer = null;
        this.errorMessageDiv = null;
        this.videoContainer = null;
        this.radioLogoContainer = null;
        
        this.hlsPlayer = null;
        this.currentChannel = null;
        this.isLoading = false;
        this.loadRetryCount = 0;
        this.maxRetries = 2;
        this.loaderOverlay = null;
        
        this.fullscreenBtn = null;
        this.fullscreenTimeout = null;
        this.isFullscreenBtnVisible = false;
        this.isFullscreen = false;
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="video-container" id="videoContainer">
                <video id="videoPlayer" playsinline disablePictureInPicture autoplay controls></video>
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
        
        if (this.videoPlayer) {
            // Enable native controls for better HTTP stream support
            this.videoPlayer.controls = true;
            this.videoPlayer.autoplay = true;
        }
        
        this.setupFullscreenButton();
        
        window.domElements = {
            videoPlayer: this.videoPlayer,
            errorMessage: this.errorMessageDiv
        };
    }
    
    showRadioLogo(channel) {
        if (!this.radioLogoContainer) return;
        
        const isRadio = channel.type === "Radio";
        
        if (!isRadio) {
            this.radioLogoContainer.style.display = 'none';
            if (this.videoPlayer) {
                this.videoPlayer.style.opacity = '1';
            }
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
        
        if (this.videoPlayer) {
            this.videoPlayer.style.opacity = '0.3';
        }
    }
    
    hideRadioLogo() {
        if (this.radioLogoContainer) {
            this.radioLogoContainer.style.display = 'none';
        }
        if (this.videoPlayer) {
            this.videoPlayer.style.opacity = '1';
        }
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
        
        if (this.videoPlayer) {
            this.videoPlayer.addEventListener('click', () => this.showFullscreenButton());
            this.videoPlayer.addEventListener('touchstart', () => this.showFullscreenButton());
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
        
        const isHls = url.includes(".m3u8");
        const isHttp = url.startsWith('http://');
        
        // Destroy existing HLS player
        if (this.hlsPlayer) {
            this.hlsPlayer.destroy();
            this.hlsPlayer = null;
        }
        
        // Clear video source
        this.videoPlayer.removeAttribute("src");
        this.videoPlayer.load();
        
        if (isHls) {
            console.log("🎬 HLS stream detected, using HLS.js");
            this.showLoader("Loading HLS stream...");
            
            try {
                if (Hls.isSupported()) {
                    return new Promise((resolve, reject) => {
                        let resolved = false;
                        
                        this.hlsPlayer = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                            autoStartLoad: true,
                            startPosition: -1,
                            manifestLoadTimeOut: 20000,
                            manifestLoadingTimeOut: 20000,
                            levelLoadingTimeOut: 20000,
                            fragLoadingTimeOut: 20000
                        });
                        
                        // Add custom headers if provided
                        if (headers) {
                            this.hlsPlayer.on(Hls.Events.MEDIA_ATTACHING, () => {
                                if (headers['User-Agent']) {
                                    // HLS.js doesn't directly support custom headers
                                    // But we can try to set them via xhrSetup
                                }
                            });
                        }
                        
                        this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
                            if (!resolved) {
                                resolved = true;
                                this.videoPlayer.play()
                                    .then(() => {
                                        console.log("✅ HLS playback started");
                                        this.hideLoader();
                                        resolve(true);
                                    })
                                    .catch(e => {
                                        console.warn("Autoplay blocked:", e);
                                        this.hideLoader();
                                        resolve(true);
                                    });
                            }
                        });
                        
                        this.hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
                            console.error("HLS Error:", data);
                            if (data.fatal && !resolved) {
                                resolved = true;
                                this.hideLoader();
                                reject(new Error(data.details || "HLS stream error"));
                            }
                        });
                        
                        this.hlsPlayer.loadSource(url);
                        this.hlsPlayer.attachMedia(this.videoPlayer);
                        
                        setTimeout(() => {
                            if (!resolved) {
                                resolved = true;
                                reject(new Error("HLS load timeout"));
                            }
                        }, 30000);
                    });
                } else if (this.videoPlayer.canPlayType("application/vnd.apple.mpegurl")) {
                    this.videoPlayer.src = url;
                    await this.videoPlayer.play();
                    this.hideLoader();
                    return true;
                } else {
                    throw new Error("HLS not supported");
                }
            } catch (error) {
                console.error("HLS playback failed:", error);
                this.hideLoader();
                return false;
            }
        } else {
            // For all other streams (including HTTP DASH), use native video element
            console.log("🎬 Using native video element for:", url);
            this.showLoader("Loading stream...");
            
            try {
                // Set the source directly
                this.videoPlayer.src = url;
                
                // Add custom headers? Native video element can't set custom headers
                // But some browsers may send the default User-Agent
                
                // Wait for canplay event
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error("Load timeout")), 30000);
                    
                    this.videoPlayer.oncanplay = () => {
                        clearTimeout(timeout);
                        resolve();
                    };
                    
                    this.videoPlayer.onerror = (e) => {
                        clearTimeout(timeout);
                        reject(new Error("Video error"));
                    };
                });
                
                await this.videoPlayer.play();
                this.hideLoader();
                return true;
                
            } catch (error) {
                console.error("Native playback failed:", error);
                this.hideLoader();
                
                if (!isRetry && this.loadRetryCount < this.maxRetries) {
                    this.loadRetryCount++;
                    this.updateLoaderMessage(`Retrying (${this.loadRetryCount}/${this.maxRetries})...`);
                    await new Promise(r => setTimeout(r, 2000));
                    return this.loadStream(url, drmConfig, headers, true);
                }
                
                this.showError(`Cannot play ${url.split('/').pop()}`);
                return false;
            }
        }
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
