// ======================== PLAYER COMPONENT WITH HTTP HEADERS SUPPORT ========================

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
        
        // DRM configuration
        this.drmConfigurations = {
            widevine: {
                servers: {
                    'com.widevine.alpha': ''
                }
            },
            fairplay: {
                servers: {
                    'com.apple.fairplay': ''
                }
            },
            playready: {
                servers: {
                    'com.microsoft.playready': ''
                }
            }
        };
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="video-container" id="videoContainer">
                <video id="videoPlayer" playsinline disablePictureInPicture autoplay></video>
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
        
        // Remove controls from video player
        if (this.videoPlayer) {
            this.videoPlayer.removeAttribute("controls");
            this.videoPlayer.controls = false;
            this.videoPlayer.autoplay = true;
        }
        
        // Setup fullscreen button
        this.setupFullscreenButton();
        
        window.domElements = {
            ...window.domElements,
            videoPlayer: this.videoPlayer,
            errorMessage: this.errorMessageDiv
        };
    }
    
    showRadioLogo(channel) {
        if (!this.radioLogoContainer) return;
        
        // Check if it's a radio channel
        const isRadio = channel.type === "Radio";
        
        if (!isRadio) {
            // Hide logo for TV channels
            this.radioLogoContainer.style.display = 'none';
            if (this.videoPlayer) {
                this.videoPlayer.style.opacity = '1';
            }
            return;
        }
        
        // Try to get logo from multiple sources
        let logoUrl = null;
        
        // Priority 1: logo from channel object
        if (channel.logo) {
            logoUrl = channel.logo;
        }
        // Priority 2: logoLocal (if you have local logos)
        else if (channel.logoLocal) {
            logoUrl = `images/${channel.logoLocal}.webp`;
        }
        // Priority 3: fallback to default radio logo
        else {
            logoUrl = 'https://via.placeholder.com/200x200/1a1e2c/f97316?text=📻';
        }
        
        // Clear existing content
        this.radioLogoContainer.innerHTML = '';
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'radio-logo-wrapper';
        
        // Create logo content container
        const logoContent = document.createElement('div');
        logoContent.className = 'radio-logo-content';
        
        // Create logo image
        const img = document.createElement('img');
        img.className = 'radio-logo';
        img.src = logoUrl;
        img.alt = channel.name;
        
        // Handle image load error
        img.onerror = () => {
            img.src = 'https://via.placeholder.com/200x200/1a1e2c/f97316?text=📻';
            img.alt = 'Radio';
        };
        
        logoContent.appendChild(img);
        wrapper.appendChild(logoContent);
        
        this.radioLogoContainer.appendChild(wrapper);
        
        // Add station name
        const stationName = document.createElement('div');
        stationName.className = 'station-name';
        stationName.textContent = channel.name;
        this.radioLogoContainer.appendChild(stationName);
        
        // Show logo container
        this.radioLogoContainer.style.display = 'flex';
        
        // Fade out video player for radio
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
        
        // Initially hide the button
        this.hideFullscreenButton();
        
        // Add click event to toggle fullscreen
        this.fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.toggleFullscreen();
        });
        
        // Show button when video container is touched/clicked
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
        console.log("Fullscreen changed:", isFullscreen ? "Entered" : "Exited");
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
            if (this.videoPlayer && this.videoPlayer.requestFullscreen) {
                this.videoPlayer.requestFullscreen().catch(e => {
                    console.error("Video element fullscreen also failed:", e);
                });
            }
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
            setTimeout(() => {
                if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock();
                } else if (screen.unlockOrientation) {
                    screen.unlockOrientation();
                }
            }, 100);
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
            
            // Configure Shaka with better DRM support and headers
            await this.shakaPlayer.configure({
                drm: {
                    servers: {},
                    clearKeys: {},
                    retryParameters: { maxAttempts: 5, timeout: 10000 },
                    persistentSessionId: null,
                    advanced: {}
                },
                streaming: {
                    rebufferingGoal: 2,
                    bufferingGoal: 10,
                    retryParameters: { maxAttempts: 5, timeout: 10000 },
                    useNativeHlsOnSafari: true
                },
                manifest: {
                    retryParameters: { maxAttempts: 5, timeout: 10000 }
                },
                abr: {
                    enabled: true,
                    defaultBandwidthEstimate: 1000000
                }
            });
            
            // Setup request filters for headers
            this.setupShakaRequestFilters();
            
            this.shakaPlayer.addEventListener("error", (event) => {
                console.error("Shaka error", event.detail);
                this.handleDrmError(event.detail);
            });
            
            this.shakaPlayer.addEventListener("drm", (event) => {
                console.log("DRM event:", event);
                this.updateDrmInfo("DRM license requested");
            });
            
            this.isShakaInitialized = true;
            return this.shakaPlayer;
        }
        return null;
    }
    
    setupShakaRequestFilters() {
        if (!this.shakaPlayer) return;
        
        // Get networking engine
        const netEngine = this.shakaPlayer.getNetworkingEngine();
        if (!netEngine) return;
        
        // Store current headers for use in filter
        const self = this;
        
        // Register request filter for all requests
        netEngine.registerRequestFilter((type, request) => {
            // Add headers for all requests
            if (self.currentHeaders) {
                // User-Agent
                if (self.currentHeaders['User-Agent']) {
                    request.headers['User-Agent'] = self.currentHeaders['User-Agent'];
                }
                // Referer
                if (self.currentHeaders['Referer']) {
                    request.headers['Referer'] = self.currentHeaders['Referer'];
                }
                // Origin
                if (self.currentHeaders['Origin']) {
                    request.headers['Origin'] = self.currentHeaders['Origin'];
                }
                // Accept
                if (self.currentHeaders['Accept']) {
                    request.headers['Accept'] = self.currentHeaders['Accept'];
                }
                // Accept-Language
                if (self.currentHeaders['Accept-Language']) {
                    request.headers['Accept-Language'] = self.currentHeaders['Accept-Language'];
                }
                // Authorization
                if (self.currentHeaders['Authorization']) {
                    request.headers['Authorization'] = self.currentHeaders['Authorization'];
                }
                // Any other custom headers
                Object.keys(self.currentHeaders).forEach(key => {
                    if (!['User-Agent', 'Referer', 'Origin', 'Accept', 'Accept-Language', 'Authorization'].includes(key)) {
                        request.headers[key] = self.currentHeaders[key];
                    }
                });
            }
            
            // Log headers for debugging (optional)
            if (request.uris && request.uris.length > 0) {
                console.log(`Requesting: ${request.uris[0]}`);
                console.log('Headers:', request.headers);
            }
        });
    }
    
    setupHlsRequestFilters(hlsConfig, headers) {
        if (!headers) return hlsConfig;
        
        // Configure HLS.js with headers
        hlsConfig.xhrSetup = (xhr, url) => {
            // Add User-Agent
            if (headers['User-Agent']) {
                xhr.setRequestHeader('User-Agent', headers['User-Agent']);
            }
            // Add Referer
            if (headers['Referer']) {
                xhr.setRequestHeader('Referer', headers['Referer']);
            }
            // Add Origin
            if (headers['Origin']) {
                xhr.setRequestHeader('Origin', headers['Origin']);
            }
            // Add Accept
            if (headers['Accept']) {
                xhr.setRequestHeader('Accept', headers['Accept']);
            }
            // Add Accept-Language
            if (headers['Accept-Language']) {
                xhr.setRequestHeader('Accept-Language', headers['Accept-Language']);
            }
            // Add Authorization
            if (headers['Authorization']) {
                xhr.setRequestHeader('Authorization', headers['Authorization']);
            }
            // Add any other custom headers
            Object.keys(headers).forEach(key => {
                if (!['User-Agent', 'Referer', 'Origin', 'Accept', 'Accept-Language', 'Authorization'].includes(key)) {
                    xhr.setRequestHeader(key, headers[key]);
                }
            });
            
            console.log(`HLS Request: ${url}`);
        };
        
        return hlsConfig;
    }
    
    handleDrmError(error) {
        console.error("DRM Error:", error);
        
        if (error.code === 6000) {
            this.showError("DRM license error. Your browser may not support the required DRM system.");
        } else if (error.code === 6001) {
            this.showError("DRM system not supported in this browser. Please use a compatible browser.");
        } else if (error.code === 6002) {
            this.showError("DRM license request failed. Please check your internet connection.");
        } else if (error.code === 6003) {
            this.showError("DRM license expired or invalid.");
        }
        
        if (error.detail && error.detail.error) {
            console.error("DRM Error Details:", error.detail.error);
        }
    }
    
    updateDrmInfo(message) {
        if (this.drmInfoDiv) {
            this.drmInfoDiv.textContent = message;
            this.drmInfoDiv.style.display = 'block';
            setTimeout(() => {
                if (this.drmInfoDiv) {
                    this.drmInfoDiv.style.display = 'none';
                }
            }, 3000);
        }
    }
    
    configureDrmForPlatform(drmConfig, streamUrl) {
        const drmServers = {};
        const drmAdvanced = {};
        const isDash = streamUrl.includes(".mpd") || streamUrl.includes("manifest.mpd");
        
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
        const isEdge = /Edge/.test(navigator.userAgent);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        
        if (drmConfig) {
            if (drmConfig.widevineLicenseUrl || drmConfig.widevine) {
                drmServers['com.widevine.alpha'] = drmConfig.widevineLicenseUrl || drmConfig.widevine;
                console.log("✅ Widevine license server configured");
            }
            
            if (drmConfig.fairplayLicenseUrl || drmConfig.fairplay) {
                drmServers['com.apple.fairplay'] = drmConfig.fairplayLicenseUrl || drmConfig.fairplay;
                if (drmConfig.fairplayCertificateUrl) {
                    drmAdvanced['com.apple.fairplay'] = {
                        serverCertificateUri: drmConfig.fairplayCertificateUrl
                    };
                }
                console.log("✅ FairPlay license server configured");
            }
            
            if (drmConfig.playreadyLicenseUrl || drmConfig.playready) {
                drmServers['com.microsoft.playready'] = drmConfig.playreadyLicenseUrl || drmConfig.playready;
                console.log("✅ PlayReady license server configured");
            }
            
            if (drmConfig.keys && Array.isArray(drmConfig.keys)) {
                const clearKeys = {};
                drmConfig.keys.forEach(key => {
                    if (key.kid && key.k) clearKeys[key.kid] = key.k;
                });
                return { clearKeys, servers: drmServers, advanced: drmAdvanced };
            } else if (typeof drmConfig === "object" && !drmConfig.widevineLicenseUrl && !drmConfig.fairplayLicenseUrl && !drmConfig.playreadyLicenseUrl) {
                const clearKeys = {};
                for (const [kid, key] of Object.entries(drmConfig)) {
                    clearKeys[kid] = key;
                }
                return { clearKeys, servers: drmServers, advanced: drmAdvanced };
            }
        }
        
        if (Object.keys(drmServers).length === 0 && isDash) {
            if (streamUrl.includes('widevine') || streamUrl.includes('cenc')) {
                drmServers['com.widevine.alpha'] = 'https://proxy.uat.widevine.com/proxy?provider=widevine_test';
                console.log("⚠️ Using default Widevine test server");
            }
            
            if (isSafari && (streamUrl.includes('fairplay') || streamUrl.includes('hls'))) {
                drmServers['com.apple.fairplay'] = 'https://fairplay-license-server.com/license';
                console.log("⚠️ Using default FairPlay test server");
            }
        }
        
        return { clearKeys: {}, servers: drmServers, advanced: drmAdvanced };
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
        
        // Store headers for use in request filters
        this.currentHeaders = headers;
        
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
                console.error("Failed to load stream after multiple attempts");
            }
        }, 30000);
        
        try {
            if (isDash) {
                console.log("Loading DASH stream with header support");
                const player = await this.initShaka();
                if (!player) throw new Error("Shaka Player not loaded");
                
                const drmSettings = this.configureDrmForPlatform(drmConfig, url);
                
                const drmConfigObj = {
                    servers: drmSettings.servers,
                    clearKeys: drmSettings.clearKeys,
                    retryParameters: { maxAttempts: 5, timeout: 15000 }
                };
                
                if (Object.keys(drmSettings.advanced).length > 0) {
                    drmConfigObj.advanced = drmSettings.advanced;
                }
                
                if (Object.keys(drmSettings.servers).length > 0) {
                    console.log("DRM Servers configured:", drmSettings.servers);
                    this.updateDrmInfo(`DRM: ${Object.keys(drmSettings.servers).join(', ')}`);
                }
                
                if (Object.keys(drmSettings.clearKeys).length > 0) {
                    console.log("ClearKeys configured:", Object.keys(drmSettings.clearKeys).length);
                    this.updateDrmInfo("DRM: ClearKey encryption detected");
                }
                
                await player.configure({ drm: drmConfigObj });
                
                // Load the manifest
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
                console.log("Loading HLS stream with header support");
                
                const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                
                if (isSafari && drmConfig && drmConfig.fairplayLicenseUrl) {
                    console.log("Using native HLS with FairPlay DRM on Safari");
                    if (this.videoPlayer.canPlayType("application/vnd.apple.mpegurl")) {
                        if (drmConfig.fairplayCertificateUrl) {
                            const certificate = await this.loadFairPlayCertificate(drmConfig.fairplayCertificateUrl);
                            if (certificate) {
                                this.videoPlayer.setServerCertificate(certificate);
                            }
                        }
                        this.videoPlayer.src = url;
                        await this.videoPlayer.play();
                        clearTimeout(loadTimeout);
                        this.loadRetryCount = 0;
                        this.hideLoader();
                        return true;
                    }
                }
                
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
                            fragLoadingTimeOut: 20000,
                            drm: {
                                widevineLicenseUrl: drmConfig?.widevineLicenseUrl || drmConfig?.widevine,
                                playreadyLicenseUrl: drmConfig?.playreadyLicenseUrl || drmConfig?.playready
                            }
                        };
                        
                        // Setup headers for HLS.js
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
                            
                            if (data.details === 'keyLoadingError' || data.details === 'keySystemError') {
                                console.error("DRM key loading error");
                                this.showError("DRM license error. Content may be protected.");
                            }
                            
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
                console.log("Loading direct stream (MP3/audio)");
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
            
            if (err.message && (err.message.includes('drm') || err.message.includes('license') || err.message.includes('DRM'))) {
                this.showError("DRM license error. Please ensure your browser supports the required DRM system.");
            }
            
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
    
    async loadFairPlayCertificate(certificateUrl) {
        try {
            const response = await fetch(certificateUrl);
            const certData = await response.arrayBuffer();
            return certData;
        } catch (error) {
            console.error("Failed to load FairPlay certificate:", error);
            return null;
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
        
        // Show or hide radio logo based on channel type
        if (channel.type === "Radio") {
            this.showRadioLogo(channel);
        } else {
            this.hideRadioLogo();
        }
        
        try {
            console.log("Switching to channel:", channel.name);
            this.currentChannel = channel;
            
            if (this.drmNoticeSpan) {
                this.drmNoticeSpan.innerHTML = '';
            }
            
            let drmConfig = null;
            let headers = null;
            
            // Extract DRM configuration from channel
            if (channel.drm) {
                drmConfig = channel.drm;
                
                if (drmConfig.widevineLicenseUrl || drmConfig.widevine) {
                    console.log("Channel uses Widevine DRM");
                }
                if (drmConfig.fairplayLicenseUrl || drmConfig.fairplay) {
                    console.log("Channel uses FairPlay DRM");
                }
                if (drmConfig.playreadyLicenseUrl || drmConfig.playready) {
                    console.log("Channel uses PlayReady DRM");
                }
                if (drmConfig.keys) {
                    console.log("Channel uses ClearKey encryption");
                }
            }
            
            // Extract headers from channel
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
                this.showError(`Failed to play ${channel.name}. The stream may be protected or unavailable.`);
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
