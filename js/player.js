// ======================== PLAYER COMPONENT WITH HTTP FIX ========================

class PlayerComponent {
    constructor() {
        this.container = document.getElementById("playerArea");
        this.videoPlayer = null;
        this.currentChannelNameSpan = null;
        this.drmNoticeSpan = null;
        this.errorMessageDiv = null;
        this.videoContainer = null;
        this.radioLogoContainer = null;
        this.radioLogoImg = null;
        
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
        
        // Fullscreen button elements
        this.fullscreenBtn = null;
        this.fullscreenTimeout = null;
        this.isFullscreenBtnVisible = false;
        this.isFullscreen = false;
        
        // JW Player ready flag
        this.jwPlayerReady = false;
        this.jwPlayerLoaded = false;
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
            <div class="drm-info" id="drmInfo" style="display: none;"></div>
        `;
        
        this.videoPlayer = document.getElementById("videoPlayer");
        this.errorMessageDiv = document.getElementById("errorMessage");
        this.videoContainer = document.getElementById("videoContainer");
        this.radioLogoContainer = document.getElementById("radioLogoContainer");
        this.drmInfoDiv = document.getElementById("drmInfo");
        this.jwPlayerContainer = document.getElementById("jwplayer-container");
        
        // Remove controls from video player
        if (this.videoPlayer) {
            this.videoPlayer.removeAttribute("controls");
            this.videoPlayer.controls = false;
            this.videoPlayer.autoplay = true;
        }
        
        // Setup fullscreen button
        this.setupFullscreenButton();
        
        // Load JW Player script if not already loaded
        this.loadJWPlayerScript();
        
        window.domElements = {
            ...window.domElements,
            videoPlayer: this.videoPlayer,
            errorMessage: this.errorMessageDiv
        };
    }
    
    loadJWPlayerScript() {
        if (this.jwPlayerLoaded) return;
        
        // Check if JW Player is already loaded
        if (typeof jwplayer !== 'undefined') {
            this.jwPlayerLoaded = true;
            console.log("✅ JW Player already loaded");
            return;
        }
        
        // Load JW Player script
        const script = document.createElement('script');
        script.src = 'https://cdn.jwplayer.com/libraries/4t00MwmP.js';
        script.async = true;
        script.onload = () => {
            this.jwPlayerLoaded = true;
            console.log("✅ JW Player script loaded successfully");
        };
        script.onerror = () => {
            console.error("❌ Failed to load JW Player script");
            this.jwPlayerLoaded = false;
        };
        document.head.appendChild(script);
        
        console.log("📥 Loading JW Player script...");
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
            
            // Destroy existing JW Player instance if any
            if (this.jwPlayer) {
                try {
                    this.jwPlayer.remove();
                } catch(e) {}
                this.jwPlayer = null;
            }
            
            // Clear container
            this.jwPlayerContainer.innerHTML = '';
            
            // Show JW Player container, hide video element
            this.jwPlayerContainer.style.display = 'block';
            if (this.videoPlayer) this.videoPlayer.style.display = 'none';
            
            // Ensure URL uses HTTP protocol (remove any HTTPS upgrade)
            let finalUrl = streamUrl;
            
            // If the page is HTTPS but stream is HTTP, we need to handle it
            if (window.location.protocol === 'https:' && streamUrl.startsWith('http://')) {
                console.warn("⚠️ HTTPS page loading HTTP stream. This may cause mixed content issues.");
                // Keep as HTTP - let the browser decide
                finalUrl = streamUrl;
            }
            
            console.log("🎬 JW Player loading URL:", finalUrl);
            
            // Setup JW Player configuration
            const config = {
                file: finalUrl,
                title: channelName,
                width: '100%',
                height: '100%',
                aspectratio: '16:9',
                autostart: true,
                primary: 'html5',
                preload: 'auto',
                abouttext: 'JUZT IPTV',
                aboutlink: '#',
                skin: {
                    name: 'seven'
                },
                // Disable any protocol upgrades
                androidhls: true,
                hlshtml: true,
                // Allow insecure content
                allow: 'autoplay; encrypted-media'
            };
            
            // For DASH streams, JW Player may need additional configuration
            if (finalUrl.includes('.mpd') || finalUrl.includes('manifest.mpd')) {
                console.log("🎬 DASH stream detected, configuring JW Player for DASH");
                // JW Player can handle DASH natively with the right configuration
                config.primary = 'html5';
                config.dash = true;
            }
            
            // Add custom headers if provided (JW Player may not support all headers)
            if (headers && headers['User-Agent']) {
                // Some JW Player versions support custom headers via playlist
                config.playlist = [{
                    file: finalUrl,
                    title: channelName
                }];
            }
            
            // Initialize JW Player
            try {
                this.jwPlayer = jwplayer(this.jwPlayerContainer.id).setup(config);
                
                // Handle JW Player events
                this.jwPlayer.on('ready', () => {
                    console.log("✅ JW Player ready");
                    this.jwPlayerReady = true;
                    resolve(true);
                });
                
                this.jwPlayer.on('error', (error) => {
                    console.error("❌ JW Player error:", error);
                    this.jwPlayerReady = false;
                    reject(error);
                });
                
                this.jwPlayer.on('setupError', (error) => {
                    console.error("❌ JW Player setup error:", error);
                    reject(error);
                });
                
                this.jwPlayer.on('play', () => {
                    console.log("▶️ JW Player playing");
                });
                
                this.jwPlayer.on('pause', () => {
                    console.log("⏸️ JW Player paused");
                });
                
                // Timeout for loading
                const timeoutId = setTimeout(() => {
                    if (!this.jwPlayerReady) {
                        reject(new Error("JW Player load timeout"));
                    }
                }, 30000);
                
                this.jwPlayer.on('ready', () => clearTimeout(timeoutId));
                
            } catch (error) {
                console.error("❌ JW Player initialization error:", error);
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
        // Use JW Player for HTTP streams to avoid mixed content issues
        const isHttp = url.startsWith('http://');
        const isHttps = url.startsWith('https://');
        const hasAuth = url.includes('AuthInfo=');
        
        // Force JW Player for HTTP streams
        if (isHttp) {
            console.log("🌐 HTTP stream detected, using JW Player");
            return true;
        }
        
        // For HTTPS streams with authentication, try custom player first
        if (hasAuth && isHttps) {
            console.log("🔑 Authenticated HTTPS stream, using custom player");
            return false;
        }
        
        // Default to custom player for HTTPS streams
        return false;
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
        
        let logoUrl = null;
        
        if (channel.logo) {
            logoUrl = channel.logo;
        } else if (channel.logoLocal) {
            logoUrl = `images/${channel.logoLocal}.webp`;
        } else {
            logoUrl = 'https://via.placeholder.com/200x200/1a1e2c/f97316?text=📻';
        }
        
        this.radioLogoContainer.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'radio-logo-wrapper';
        
        const logoContent = document.createElement('div');
        logoContent.className = 'radio-logo-content';
        
        const img = document.createElement('img');
        img.className = 'radio-logo';
        img.src = logoUrl;
        img.alt = channel.name;
        
        img.onerror = () => {
            img.src = 'https://via.placeholder.com/200x200/1a1e2c/f97316?text=📻';
            img.alt = 'Radio';
        };
        
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
            this.videoContainer.addEventListener('click', (e) => {
                if (e.target === this.fullscreenBtn || this.fullscreenBtn.contains(e.target)) {
                    return;
                }
                this.showFullscreenButton();
            });
            
            this.videoContainer.addEventListener('touchstart', (e) => {
                if (e.target === this.fullscreenBtn || this.fullscreenBtn.contains(e.target)) {
                    return;
                }
                this.showFullscreenButton();
            });
        }
        
        if (this.videoPlayer) {
            this.videoPlayer.addEventListener('click', () => {
                this.showFullscreenButton();
            });
            
            this.videoPlayer.addEventListener('touchstart', () => {
                this.showFullscreenButton();
            });
        }
        
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());
    }
    
    onFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement || 
                                document.webkitFullscreenElement || 
                                document.mozFullScreenElement);
        
        this.isFullscreen = isFullscreen;
        
        if (this.fullscreenBtn) {
            if (isFullscreen) {
                this.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                this.fullscreenBtn.title = 'Exit Fullscreen';
            } else {
                this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                this.fullscreenBtn.title = 'Enter Fullscreen';
            }
        }
        
        this.showFullscreenButton();
    }
    
    showFullscreenButton() {
        if (!this.fullscreenBtn) return;
        
        if (this.fullscreenTimeout) {
            clearTimeout(this.fullscreenTimeout);
        }
        
        this.fullscreenBtn.classList.add('show');
        this.isFullscreenBtnVisible = true;
        
        this.fullscreenTimeout = setTimeout(() => {
            this.hideFullscreenButton();
        }, 3000);
    }
    
    hideFullscreenButton() {
        if (!this.fullscreenBtn) return;
        
        this.fullscreenBtn.classList.remove('show');
        this.isFullscreenBtnVisible = false;
        
        if (this.fullscreenTimeout) {
            clearTimeout(this.fullscreenTimeout);
            this.fullscreenTimeout = null;
        }
    }
    
    toggleFullscreen() {
        if (!this.videoContainer) return;
        
        const isFullscreen = !!(document.fullscreenElement || 
                                document.webkitFullscreenElement || 
                                document.mozFullScreenElement);
        
        if (isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }
    
    enterFullscreen() {
        if (!this.videoContainer) return;
        
        const element = this.videoContainer;
        
        const requestFullscreen = () => {
            if (element.requestFullscreen) {
                return element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                return element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                return element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                return element.msRequestFullscreen();
            }
            return Promise.reject("Fullscreen not supported");
        };
        
        requestFullscreen().then(() => {
            console.log("Fullscreen entered successfully");
            setTimeout(() => {
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(err => {
                        console.log("Orientation lock failed:", err);
                    });
                } else if (screen.lockOrientation) {
                    screen.lockOrientation('landscape').catch(err => {
                        console.log("Orientation lock failed:", err);
                    });
                }
            }, 100);
        }).catch(err => {
            console.error("Fullscreen request failed:", err);
        });
    }
    
    exitFullscreen() {
        const exitFullscreen = () => {
            if (document.exitFullscreen) {
                return document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                return document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                return document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                return document.msExitFullscreen();
            }
            return Promise.reject("Exit fullscreen not supported");
        };
        
        exitFullscreen().then(() => {
            console.log("Fullscreen exited successfully");
        }).catch(err => {
            console.error("Exit fullscreen failed:", err);
        });
    }
    
    async destroyPlayers() {
        this.isLoading = false;
        this.hideLoader();
        
        if (this.isFullscreen) {
            this.exitFullscreen();
        }
        
        this.destroyJWPlayer();
        
        if (this.videoPlayer) {
            try {
                this.videoPlayer.pause();
                this.videoPlayer.removeAttribute("src");
                this.videoPlayer.load();
            } catch (e) {
                console.warn("Error clearing video:", e);
            }
        }
        
        if (this.shakaPlayer) {
            try {
                await this.shakaPlayer.destroy();
            } catch (e) {
                console.warn("Error destroying Shaka player:", e);
            }
            this.shakaPlayer = null;
        }
        
        if (this.hlsPlayer) {
            try {
                this.hlsPlayer.destroy();
            } catch (e) {
                console.warn("Error destroying HLS player:", e);
            }
            this.hlsPlayer = null;
        }
        
        this.isShakaInitialized = false;
    }
    
    async initShaka() {
        if (this.shakaPlayer) return this.shakaPlayer;
        if (typeof shaka !== "undefined") {
            this.shakaPlayer = new shaka.Player(this.videoPlayer);
            
            await this.shakaPlayer.configure({
                drm: {
                    servers: {},
                    clearKeys: {},
                    retryParameters: { maxAttempts: 5, timeout: 10000 }
                },
                streaming: {
                    rebufferingGoal: 2,
                    bufferingGoal: 10,
                    retryParameters: { maxAttempts: 5, timeout: 10000 }
                },
                manifest: {
                    retryParameters: { maxAttempts: 5, timeout: 10000 }
                },
                abr: {
                    enabled: true
                }
            });
            
            this.setupShakaRequestFilters();
            
            this.shakaPlayer.addEventListener("error", (event) => {
                console.error("Shaka error", event.detail);
            });
            
            this.isShakaInitialized = true;
            return this.shakaPlayer;
        }
        return null;
    }
    
    setupShakaRequestFilters() {
        if (!this.shakaPlayer) return;
        
        const netEngine = this.shakaPlayer.getNetworkingEngine();
        if (!netEngine) return;
        
        const self = this;
        
        netEngine.registerRequestFilter((type, request) => {
            if (self.currentHeaders) {
                if (self.currentHeaders['User-Agent']) {
                    request.headers['User-Agent'] = self.currentHeaders['User-Agent'];
                }
                if (self.currentHeaders['Referer']) {
                    request.headers['Referer'] = self.currentHeaders['Referer'];
                }
                if (self.currentHeaders['Origin']) {
                    request.headers['Origin'] = self.currentHeaders['Origin'];
                }
            }
        });
    }
    
    setupHlsRequestFilters(hlsConfig, headers) {
        if (!headers) return hlsConfig;
        
        hlsConfig.xhrSetup = (xhr, url) => {
            if (headers['User-Agent']) {
                xhr.setRequestHeader('User-Agent', headers['User-Agent']);
            }
            if (headers['Referer']) {
                xhr.setRequestHeader('Referer', headers['Referer']);
            }
            if (headers['Origin']) {
                xhr.setRequestHeader('Origin', headers['Origin']);
            }
        };
        
        return hlsConfig;
    }
    
    showError(msg) {
        console.error(msg);
        if (this.errorMessageDiv) {
            this.errorMessageDiv.textContent = msg;
            this.errorMessageDiv.classList.add("show");
            setTimeout(() => {
                if (this.errorMessageDiv) {
                    this.errorMessageDiv.classList.remove("show");
                }
            }, 8000);
        }
        this.hideLoader();
    }
    
    showLoader(message = "Loading stream...") {
        this.hideLoader();
        
        this.loaderOverlay = document.createElement('div');
        this.loaderOverlay.className = 'loader-overlay';
        this.loaderOverlay.innerHTML = `
            <div class="loader">
                <div class="loader-text">${message}</div>
            </div>
        `;
        
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
            const loaderText = this.loaderOverlay.querySelector('.loader-text');
            if (loaderText) {
                loaderText.textContent = message;
            }
        }
    }
    
    async loadStream(url, drmConfig = null, headers = null, isRetry = false) {
        console.log("Loading stream:", url);
        
        this.currentHeaders = headers;
        
        const useJWPlayer = this.shouldUseJWPlayer(url);
        
        if (useJWPlayer) {
            console.log("🎬 Using JW Player for this stream");
            this.showLoader("Loading stream with JW Player...");
            
            try {
                await this.destroyPlayers();
                
                const success = await this.initJWPlayer(url, this.currentChannel?.name || "Channel", headers);
                
                if (success) {
                    this.hideLoader();
                    return true;
                }
            } catch (error) {
                console.error("JW Player failed:", error);
                if (!isRetry && this.loadRetryCount < this.maxRetries) {
                    this.loadRetryCount++;
                    console.log(`Retrying with JW Player (${this.loadRetryCount}/${this.maxRetries})...`);
                    this.updateLoaderMessage(`Retrying (${this.loadRetryCount}/${this.maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    return this.loadStream(url, drmConfig, headers, true);
                }
                this.hideLoader();
                return false;
            }
        }
        
        // Use custom player for HTTPS streams
        console.log("🎬 Using custom player for this stream");
        
        await this.destroyPlayers();
        
        const isDash = url.includes(".mpd") || url.includes("manifest.mpd");
        const isHls = url.includes(".m3u8");
        
        if (isRetry) {
            this.updateLoaderMessage(`Retrying (${this.loadRetryCount}/${this.maxRetries})...`);
        } else {
            this.showLoader("Loading stream...");
        }
        
        const loadTimeout = setTimeout(() => {
            console.warn("Stream load timeout for:", url);
            if (!isRetry && this.loadRetryCount < this.maxRetries) {
                this.loadRetryCount++;
                console.log(`Retrying stream load (${this.loadRetryCount}/${this.maxRetries})...`);
                this.updateLoaderMessage(`Timeout, retrying (${this.loadRetryCount}/${this.maxRetries})...`);
                this.loadStream(url, drmConfig, headers, true);
            } else if (this.loadRetryCount >= this.maxRetries) {
                this.hideLoader();
                this.showError("Failed to load stream after multiple attempts.");
            }
        }, 30000);
        
        try {
            if (isDash) {
                console.log("Loading DASH stream with custom player");
                const player = await this.initShaka();
                if (!player) throw new Error("Shaka Player not loaded");
                
                await player.load(url);
                
                setTimeout(() => {
                    if (this.videoPlayer && !this.videoPlayer.paused) {
                        this.videoPlayer.play().catch(e => console.warn("Play attempt:", e));
                    }
                }, 500);
                
                clearTimeout(loadTimeout);
                this.loadRetryCount = 0;
                this.hideLoader();
                return true;
            } 
            else if (isHls) {
                console.log("Loading HLS stream with custom player");
                
                if (Hls.isSupported()) {
                    return new Promise((resolve, reject) => {
                        let resolved = false;
                        let timeoutId = null;
                        
                        let hlsConfig = {
                            enableWorker: true,
                            lowLatencyMode: true,
                            autoStartLoad: true,
                            startPosition: -1,
                            manifestLoadTimeOut: 20000,
                            manifestLoadingTimeOut: 20000,
                            levelLoadingTimeOut: 20000,
                            fragLoadingTimeOut: 20000
                        };
                        
                        if (headers) {
                            hlsConfig = this.setupHlsRequestFilters(hlsConfig, headers);
                        }
                        
                        this.hlsPlayer = new Hls(hlsConfig);
                        
                        this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
                            if (!resolved) {
                                resolved = true;
                                if (timeoutId) clearTimeout(timeoutId);
                                clearTimeout(loadTimeout);
                                this.videoPlayer.play()
                                    .then(() => {
                                        console.log("HLS playback started");
                                        this.loadRetryCount = 0;
                                        this.hideLoader();
                                        resolve(true);
                                    })
                                    .catch(e => {
                                        console.warn("Autoplay blocked:", e);
                                        this.loadRetryCount = 0;
                                        this.hideLoader();
                                        resolve(true);
                                    });
                            }
                        });
                        
                        this.hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
                            console.error("HLS Error:", data);
                            
                            if (data.fatal && !resolved) {
                                if (data.type === 'networkError' && !isRetry && this.loadRetryCount < this.maxRetries) {
                                    resolved = true;
                                    if (timeoutId) clearTimeout(timeoutId);
                                    clearTimeout(loadTimeout);
                                    this.loadRetryCount++;
                                    console.log(`Retrying HLS stream (${this.loadRetryCount}/${this.maxRetries})...`);
                                    this.updateLoaderMessage(`Network error, retrying (${this.loadRetryCount}/${this.maxRetries})...`);
                                    setTimeout(() => {
                                        this.loadStream(url, drmConfig, headers, true)
                                            .then(resolve)
                                            .catch(reject);
                                    }, 2000);
                                } else if (data.type !== 'networkError') {
                                    resolved = true;
                                    if (timeoutId) clearTimeout(timeoutId);
                                    clearTimeout(loadTimeout);
                                    this.hideLoader();
                                    reject(new Error(data.details || "HLS stream error"));
                                }
                            }
                        });
                        
                        timeoutId = setTimeout(() => {
                            if (!resolved) {
                                resolved = true;
                                clearTimeout(loadTimeout);
                                if (!isRetry && this.loadRetryCount < this.maxRetries) {
                                    this.loadRetryCount++;
                                    console.log(`Manifest timeout, retrying (${this.loadRetryCount}/${this.maxRetries})...`);
                                    this.updateLoaderMessage(`Loading timeout, retrying (${this.loadRetryCount}/${this.maxRetries})...`);
                                    this.loadStream(url, drmConfig, headers, true)
                                        .then(resolve)
                                        .catch(reject);
                                } else {
                                    console.warn("HLS manifest load timeout");
                                    this.hideLoader();
                                    reject(new Error("Stream load timeout"));
                                }
                            }
                        }, 15000);
                        
                        this.hlsPlayer.loadSource(url);
                        this.hlsPlayer.attachMedia(this.videoPlayer);
                    });
                } 
                else if (this.videoPlayer.canPlayType("application/vnd.apple.mpegurl")) {
                    this.videoPlayer.src = url;
                    await this.videoPlayer.play();
                    clearTimeout(loadTimeout);
                    this.loadRetryCount = 0;
                    this.hideLoader();
                    return true;
                } else {
                    throw new Error("HLS not supported in this browser");
                }
            }
            else {
                console.log("Loading direct stream");
                this.videoPlayer.src = url;
                await this.videoPlayer.play();
                clearTimeout(loadTimeout);
                this.loadRetryCount = 0;
                this.hideLoader();
                return true;
            }
        } catch (err) {
            clearTimeout(loadTimeout);
            console.error("loadStream error:", err);
            
            if (!isRetry && this.loadRetryCount < this.maxRetries) {
                this.loadRetryCount++;
                console.log(`Retrying after error (${this.loadRetryCount}/${this.maxRetries})...`);
                this.updateLoaderMessage(`Error, retrying (${this.loadRetryCount}/${this.maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.loadStream(url, drmConfig, headers, true);
            }
            
            this.hideLoader();
            console.error(`Cannot play stream: ${err.message || "unknown error"}`);
            return false;
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
                const checkLoad = setInterval(() => {
                    if (!this.isLoading) {
                        clearInterval(checkLoad);
                        resolve();
                    }
                }, 100);
                setTimeout(() => {
                    clearInterval(checkLoad);
                    resolve();
                }, 3000);
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
            
            if (channel.drm) {
                drmConfig = channel.drm;
            }
            
            if (channel.headers) {
                headers = channel.headers;
                console.log("Using custom headers for this channel");
                if (headers['User-Agent']) {
                    console.log("  - User-Agent: " + headers['User-Agent'].substring(0, 50) + "...");
                }
                if (headers['Referer']) {
                    console.log("  - Referer: " + headers['Referer']);
                }
                if (headers['Origin']) {
                    console.log("  - Origin: " + headers['Origin']);
                }
            }
            
            const success = await this.loadStream(channel.streamUrl, drmConfig, headers);
            
            if (success) {
                window.activeChannelId = channel.id;
                console.log("Channel playing successfully:", channel.name);
                
                if (window.sidebarComponent) {
                    window.sidebarComponent.updateActiveChannel(channel.id);
                }
            } else {
                console.error("Failed to play channel:", channel.name);
                this.hideRadioLogo();
                this.showError(`Failed to play ${channel.name}. The stream may be offline.`);
            }
            
            return success;
        } catch (error) {
            console.error("Error in playChannel:", error);
            this.hideRadioLogo();
            this.hideLoader();
            this.showError(`Error playing ${channel.name}: ${error.message}`);
            return false;
        } finally {
            setTimeout(() => {
                this.isLoading = false;
            }, 500);
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
