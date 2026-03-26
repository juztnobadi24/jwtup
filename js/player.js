// ======================== PLAYER COMPONENT WITH PROXY SUPPORT ========================

class PlayerComponent {
    constructor() {
        this.container = document.getElementById("playerArea");
        this.videoPlayer = null;
        this.errorMessageDiv = null;
        this.videoContainer = null;
        this.radioLogoContainer = null;
        
        this.shakaPlayer = null;
        this.hlsPlayer = null;
        this.jwPlayer = null;
        this.jwPlayerContainer = null;
        this.isShakaInitialized = false;
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
        
        // CORS proxy to handle HTTP streams on HTTPS sites
        // Using a public proxy - you can also host your own
        this.proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        this.useProxy = true; // Set to false to disable proxy
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="video-container" id="videoContainer">
                <video id="videoPlayer" playsinline disablePictureInPicture autoplay style="display: none;"></video>
                <div id="jwplayer-container" style="width: 100%; height: 100%; display: none;"></div>
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
    
    // Convert HTTP URL to HTTPS proxy URL
    getProxiedUrl(streamUrl) {
        // If site is HTTPS and stream is HTTP, use proxy
        if (this.useProxy && window.location.protocol === 'https:' && streamUrl.startsWith('http://')) {
            // For CORS Anywhere, we need to encode the URL
            const proxiedUrl = this.proxyUrl + streamUrl;
            console.log("Using proxy for HTTP stream:", proxiedUrl);
            return proxiedUrl;
        }
        return streamUrl;
    }
    
    initJWPlayer(streamUrl, channelName) {
        return new Promise((resolve, reject) => {
            if (!this.jwPlayerLoaded) {
                this.loadJWPlayerScript();
                setTimeout(() => this.initJWPlayer(streamUrl, channelName).then(resolve).catch(reject), 500);
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
            if (this.videoPlayer) this.videoPlayer.style.display = 'none';
            
            // Get proxied URL for HTTP streams
            const finalUrl = this.getProxiedUrl(streamUrl);
            
            console.log("JW Player loading URL:", finalUrl);
            
            // JW Player configuration
            const config = {
                file: finalUrl,
                title: channelName,
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
            this.jwPlayerContainer.style.display = 'none';
            this.jwPlayerContainer.innerHTML = '';
        }
        if (this.videoPlayer) {
            this.videoPlayer.style.display = 'block';
        }
    }
    
    shouldUseJWPlayer(url) {
        // Always use JW Player for HTTP streams (will be proxied)
        return url.startsWith('http://');
    }
    
    showRadioLogo(channel) {
        if (!this.radioLogoContainer) return;
        
        const isRadio = channel.type === "Radio";
        
        if (!isRadio) {
            this.radioLogoContainer.style.display = 'none';
            if (this.videoPlayer) this.videoPlayer.style.opacity = '1';
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
        if (this.videoPlayer) this.videoPlayer.style.opacity = '0.3';
    }
    
    hideRadioLogo() {
        if (this.radioLogoContainer) this.radioLogoContainer.style.display = 'none';
        if (this.videoPlayer) this.videoPlayer.style.opacity = '1';
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
            this.fullscreenBtn.title = isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';
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
    
    async destroyPlayers() {
        this.isLoading = false;
        this.hideLoader();
        
        if (this.isFullscreen) this.exitFullscreen();
        this.destroyJWPlayer();
        
        if (this.videoPlayer) {
            try {
                this.videoPlayer.pause();
                this.videoPlayer.removeAttribute("src");
                this.videoPlayer.load();
            } catch(e) {}
        }
        
        if (this.shakaPlayer) {
            try { await this.shakaPlayer.destroy(); } catch(e) {}
            this.shakaPlayer = null;
        }
        
        if (this.hlsPlayer) {
            try { this.hlsPlayer.destroy(); } catch(e) {}
            this.hlsPlayer = null;
        }
        
        this.isShakaInitialized = false;
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
        
        const useJWPlayer = this.shouldUseJWPlayer(url);
        
        if (useJWPlayer) {
            this.showLoader("Loading stream...");
            
            try {
                await this.destroyPlayers();
                await this.initJWPlayer(url, this.currentChannel?.name || "Channel");
                this.hideLoader();
                return true;
            } catch (error) {
                console.error("JW Player failed:", error);
                if (!isRetry && this.loadRetryCount < this.maxRetries) {
                    this.loadRetryCount++;
                    await new Promise(r => setTimeout(r, 2000));
                    return this.loadStream(url, drmConfig, headers, true);
                }
                this.hideLoader();
                this.showError("Failed to load stream. The stream may be offline.");
                return false;
            }
        }
        
        // Custom player for HTTPS streams
        this.showLoader("Loading stream...");
        await this.destroyPlayers();
        
        const isHls = url.includes(".m3u8");
        
        try {
            if (isHls && Hls.isSupported()) {
                return new Promise((resolve, reject) => {
                    let resolved = false;
                    let hlsConfig = { enableWorker: true, autoStartLoad: true };
                    
                    if (headers) {
                        hlsConfig.xhrSetup = (xhr, reqUrl) => {
                            if (headers['User-Agent']) xhr.setRequestHeader('User-Agent', headers['User-Agent']);
                            if (headers['Referer']) xhr.setRequestHeader('Referer', headers['Referer']);
                            if (headers['Origin']) xhr.setRequestHeader('Origin', headers['Origin']);
                        };
                    }
                    
                    this.hlsPlayer = new Hls(hlsConfig);
                    this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
                        if (!resolved) {
                            resolved = true;
                            this.videoPlayer.play().catch(e => console.warn("Autoplay blocked"));
                            this.hideLoader();
                            resolve(true);
                        }
                    });
                    this.hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
                        if (data.fatal && !resolved) reject(new Error(data.details));
                    });
                    this.hlsPlayer.loadSource(url);
                    this.hlsPlayer.attachMedia(this.videoPlayer);
                    
                    setTimeout(() => {
                        if (!resolved) reject(new Error("Timeout"));
                    }, 20000);
                });
            } else {
                this.videoPlayer.src = url;
                await this.videoPlayer.play();
                this.hideLoader();
                return true;
            }
        } catch (err) {
            console.error("Custom player error:", err);
            this.hideLoader();
            return false;
        }
    }
    
    async playChannel(channel) {
        if (!channel || !channel.streamUrl) {
            console.error("Invalid channel");
            return false;
        }
        
        if (this.isLoading) {
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
            } else {
                this.showError(`Failed to play ${channel.name}`);
            }
            
            return success;
        } catch (error) {
            console.error("Error in playChannel:", error);
            this.showError(`Error playing ${channel.name}`);
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
