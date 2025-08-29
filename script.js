
/**
 * Anime Sauce Finder - Advanced Web Application
 * A comprehensive anime recognition tool using trace.moe API
 * Features: AI recognition, history tracking, performance optimization, accessibility
 * 
 * @version 2.0.0
 * @author Anime Sauce Finder Team
 */

class AnimeSauceFinder {
    constructor() {
        // Core DOM Elements - with proper null checks
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.uploadArea = document.getElementById('uploadArea');
        this.urlInput = document.getElementById('urlInput');
        this.urlPasteBtn = document.getElementById('urlPasteBtn');
        this.searchBtn = document.getElementById('searchBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.removeBtn = document.getElementById('removeBtn');
        this.historyBtn = document.getElementById('historyBtn');
        
        // Display Elements
        this.previewSection = document.getElementById('previewSection');
        this.previewImage = document.getElementById('previewImage');
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.statusMessage = document.getElementById('statusMessage');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingText = document.getElementById('loadingText');
        
        // Info Elements
        this.imageSize = document.getElementById('imageSize');
        this.imageFormat = document.getElementById('imageFormat');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.progressBar = document.getElementById('progressBar');
        
        // Modal Elements
        this.historyPanel = document.getElementById('historyPanel');
        this.historyContent = document.getElementById('historyContent');
        this.closeHistoryBtn = document.getElementById('closeHistoryBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.fullscreenModal = document.getElementById('fullscreenModal');
        this.fullscreenImage = document.getElementById('fullscreenImage');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.fullscreenClose = document.getElementById('fullscreenClose');
        this.helpModal = document.getElementById('helpModal');
        this.aboutModal = document.getElementById('aboutModal');
        this.helpBtn = document.getElementById('helpBtn');
        this.aboutBtn = document.getElementById('aboutBtn');
        this.closeHelpBtn = document.getElementById('closeHelpBtn');
        this.closeAboutBtn = document.getElementById('closeAboutBtn');
        
        // Stats Elements
        this.appStats = document.getElementById('appStats');
        this.totalSearches = document.getElementById('totalSearches');
        
        // Application State
        this.currentFile = null;
        this.currentFileMetadata = null;
        this.isSearching = false;
        this.searchHistory = this.loadSearchHistory();
        this.searchCache = new Map();
        this.abortController = null;
        
        // API Configuration
        this.API_BASE_URL = 'https://api.trace.moe';
        this.API_ENDPOINTS = {
            search: '/search',
            image: '/image',
            video: '/video'
        };
        
            // Performance Configuration
    this.CACHE_EXPIRY = 3600000; // 1 hour
    this.MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (increased for better quality)
    this.SUPPORTED_FORMATS = [
        'image/jpeg', 'image/jpg', 'image/png', 
        'image/gif', 'image/webp', 'image/bmp', 'image/avif'
    ];
    this.IMAGE_QUALITY_THRESHOLD = 0.8; // Minimum quality for better results
        
        // Feature Detection
        this.features = {
            webp: this.supportsWebP(),
            avif: this.supportsAvif(),
            clipboard: navigator.clipboard && navigator.clipboard.read,
            serviceWorker: 'serviceWorker' in navigator,
            intersection: 'IntersectionObserver' in window,
            performance: 'performance' in window,
            webWorkers: 'Worker' in window,
            indexedDB: 'indexedDB' in window,
            fileSystem: 'showDirectoryPicker' in window
        };
        
        // Performance Metrics
        this.metrics = {
            startTime: performance.now(),
            searchTimes: [],
            errorCount: 0,
            successCount: 0,
            cacheHits: 0,
            cacheMisses: 0,
            avgResponseTime: 0,
            memoryUsage: 0
        };
        
        // Initialize Application
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        try {
            this.setupEventListeners();
            this.loadUserPreferences();
            this.updateSearchButtonState();
            this.updateStats();
            this.preloadCriticalResources();
            this.setupIntersectionObserver();
            this.setupAdvancedCaching();
            this.initializePerformanceMonitoring();
            this.showStatus('🚀 Ready to find anime sources! Upload an image to get started.', 'info');
            
            // Performance logging
            if (this.features.performance) {
                console.log(`App initialized in ${(performance.now() - this.metrics.startTime).toFixed(2)}ms`);
            }
        } catch (error) {
            this.handleError(error, 'Failed to initialize application');
            this.showStatus('⚠️ App initialization failed. Please refresh the page.', 'error');
        }
    }
    
    /**
     * Set up all event listeners with proper null checks
     */
    setupEventListeners() {
        // File upload interactions - Fixed with proper null checks
        if (this.uploadBtn && this.fileInput) {
            this.uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Upload button clicked');
                this.fileInput.click();
            });
            // Mobile tap support
            this.uploadBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.fileInput.click();
            }, { passive: false });
        }
        
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                console.log('File input changed');
                this.handleFileSelect(e);
            });
        }
        
        // Upload area interactions - Fixed
        if (this.uploadArea && this.fileInput) {
            this.uploadArea.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Upload area clicked');
                this.fileInput.click();
            });
            // Mobile tap support on upload area
            this.uploadArea.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.fileInput.click();
            }, { passive: false });
            
            this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
            this.uploadArea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.fileInput.click();
                }
            });
        }
        
        // Clipboard functionality - Enhanced
        document.addEventListener('paste', (e) => this.handlePaste(e));
        
        // URL input functionality
        if (this.urlInput) {
            this.urlInput.addEventListener('input', () => this.updateSearchButtonState());
            this.urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchAnime();
            });
        }
        if (this.urlPasteBtn) {
            this.urlPasteBtn.addEventListener('click', () => this.pasteFromClipboard());
        }
        
        // Action buttons
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.searchAnime());
        }
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearAll());
        }
        if (this.removeBtn) {
            this.removeBtn.addEventListener('click', () => this.removeImage());
        }
        if (this.historyBtn) {
            this.historyBtn.addEventListener('click', () => this.toggleHistory());
        }
        
        // Preview functionality
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.openFullscreen());
        }
        if (this.fullscreenClose) {
            this.fullscreenClose.addEventListener('click', () => this.closeFullscreen());
        }
        if (this.fullscreenModal) {
            this.fullscreenModal.addEventListener('click', (e) => {
                if (e.target === this.fullscreenModal) this.closeFullscreen();
            });
        }
        
        // History panel
        if (this.closeHistoryBtn) {
            this.closeHistoryBtn.addEventListener('click', () => this.closeHistory());
        }
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }
        
        // Modal functionality
        if (this.helpBtn) {
            this.helpBtn.addEventListener('click', () => this.openModal('help'));
        }
        if (this.aboutBtn) {
            this.aboutBtn.addEventListener('click', () => this.openModal('about'));
        }
        if (this.closeHelpBtn) {
            this.closeHelpBtn.addEventListener('click', () => this.closeModal('help'));
        }
        if (this.closeAboutBtn) {
            this.closeAboutBtn.addEventListener('click', () => this.closeModal('about'));
        }
        
        // Global event listeners
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
        window.addEventListener('online', () => this.handleNetworkChange(true));
        window.addEventListener('offline', () => this.handleNetworkChange(false));
        
        // Performance monitoring
        if (this.features.performance) {
            window.addEventListener('load', () => this.logPerformanceMetrics());
        }
    }
    
    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeydown(event) {
        if (event.key === 'Escape') {
            if (this.fullscreenModal && this.fullscreenModal.classList.contains('show')) {
                this.closeFullscreen();
            } else if (this.historyPanel && this.historyPanel.classList.contains('show')) {
                this.closeHistory();
            } else if (this.helpModal && this.helpModal.classList.contains('show')) {
                this.closeModal('help');
            } else if (this.aboutModal && this.aboutModal.classList.contains('show')) {
                this.closeModal('about');
            }
        }
        
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'u':
                    event.preventDefault();
                    if (this.fileInput) this.fileInput.click();
                    break;
                case 'Enter':
                    if (!this.isSearching) {
                        event.preventDefault();
                        this.searchAnime();
                    }
                    break;
                case 'h':
                    event.preventDefault();
                    this.toggleHistory();
                    break;
            }
        }
    }
    
    /**
     * Handle before unload
     */
    handleBeforeUnload(event) {
        if (this.isSearching) {
            event.preventDefault();
            event.returnValue = 'A search is currently in progress. Are you sure you want to leave?';
        }
        this.saveSearchHistory();
    }
    
    /**
     * Handle network connectivity changes
     */
    handleNetworkChange(isOnline) {
        if (isOnline) {
            this.showStatus('🌐 Connection restored!', 'success');
        } else {
            this.showStatus('⚠️ No internet connection. Some features may not work.', 'error');
        }
    }
    
    /**
     * Paste URL from clipboard
     */
    async pasteFromClipboard() {
        if (!this.features.clipboard) {
            this.showStatus('Clipboard access not supported in this browser', 'error');
            return;
        }
        
        try {
            const clipboardText = await navigator.clipboard.readText();
            if (this.isValidUrl(clipboardText)) {
                if (this.urlInput) {
                    this.urlInput.value = clipboardText;
                }
                this.updateSearchButtonState();
                this.showStatus('URL pasted from clipboard!', 'success');
            } else {
                this.showStatus('Clipboard does not contain a valid URL', 'error');
            }
        } catch (error) {
            this.showStatus('Failed to read from clipboard', 'error');
        }
    }
    
    /**
     * Handle file selection from input
     */
    async handleFileSelect(event) {
        try {
            const files = event.target.files;
            if (!files || files.length === 0) {
                console.log('No file selected');
                return;
            }
            
            const file = files[0];
            console.log('File selected:', file.name, file.type, file.size);
            
            if (await this.isValidImageFile(file)) {
                await this.setCurrentFile(file);
                this.showStatus(`✅ File loaded: ${file.name}`, 'success');
            }
        } catch (error) {
            this.handleError(error, 'Failed to handle file selection');
            if (event.target) {
                event.target.value = '';
            }
        }
    }
    
    /**
     * Handle drag over event
     */
    handleDragOver(event) {
        event.preventDefault();
        if (this.uploadArea && !this.uploadArea.classList.contains('dragover')) {
            this.uploadArea.classList.add('dragover');
        }
    }
    
    /**
     * Handle drag leave event
     */
    handleDragLeave(event) {
        event.preventDefault();
        if (this.uploadArea) {
            const rect = this.uploadArea.getBoundingClientRect();
            if (rect && (
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom
            )) {
                this.uploadArea.classList.remove('dragover');
            }
        }
    }
    
    /**
     * Handle file drop event
     */
    async handleDrop(event) {
        event.preventDefault();
        console.log('File dropped');
        
        if (this.uploadArea) {
            this.uploadArea.classList.remove('dragover');
        }
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            console.log('Dropped file:', file.name, file.type, file.size);
            if (await this.isValidImageFile(file)) {
                await this.setCurrentFile(file);
                this.showStatus(`✅ File dropped: ${file.name}`, 'success');
            }
        }
    }
    
    /**
     * Handle clipboard paste event - Enhanced
     */
    async handlePaste(event) {
        const items = event.clipboardData && event.clipboardData.items;
        if (!items) return;
        
        console.log('Paste event detected');
        
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                console.log('Image pasted from clipboard');
                const file = item.getAsFile();
                if (file && await this.isValidImageFile(file)) {
                    await this.setCurrentFile(file);
                    this.showStatus('✅ Image pasted from clipboard!', 'success');
                    event.preventDefault();
                    break;
                }
            }
        }
    }
    
    /**
     * Enhanced file validation with quality assessment
     */
    async isValidImageFile(file) {
        if (!this.SUPPORTED_FORMATS.includes(file.type)) {
            this.showStatus(
                `❌ Unsupported file type: ${file.type}. Please use JPG, PNG, GIF, WebP, BMP, or AVIF.`, 
                'error'
            );
            return false;
        }
        
        if (file.size > this.MAX_FILE_SIZE) {
            this.showStatus(
                `❌ File too large: ${this.formatFileSize(file.size)}. Maximum allowed: ${this.formatFileSize(this.MAX_FILE_SIZE)}`, 
                'error'
            );
            return false;
        }
        
        try {
            await this.validateImageIntegrity(file);
            const quality = await this.assessImageQuality(file);
            if (quality < this.IMAGE_QUALITY_THRESHOLD) {
                this.showStatus('⚠️ Low quality image detected. Results may be less accurate.', 'warning');
            }
        } catch (error) {
            console.warn('Image integrity check failed, proceeding anyway:', error);
            // Some environments (iframes/sandboxes) can block blob URL loading.
            // Do not hard-fail here; allow preview to attempt to load.
        }
        
        return true;
    }
    
    /**
     * Validate image integrity
     */
    validateImageIntegrity(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve();
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Invalid image'));
            };
            
            img.src = url;
        });
    }

    /**
     * Assess image quality for better search results
     */
    async assessImageQuality(file) {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                URL.revokeObjectURL(url);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Calculate sharpness and contrast
                let sharpness = 0;
                let contrast = 0;
                
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const brightness = (r + g + b) / 3;
                    
                    if (i > 0) {
                        const prevBrightness = (data[i - 4] + data[i - 3] + data[i - 2]) / 3;
                        sharpness += Math.abs(brightness - prevBrightness);
                    }
                    
                    contrast += brightness;
                }
                
                const avgSharpness = sharpness / (data.length / 4);
                const avgBrightness = contrast / (data.length / 4);
                const quality = Math.min(1, (avgSharpness / 50) * (avgBrightness / 128));
                
                resolve(quality);
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(0.5); // Default quality if assessment fails
            };
            
            img.src = url;
        });
    }
    
    /**
     * Set current file with metadata extraction
     */
    async setCurrentFile(file) {
        try {
            this.currentFile = file;
            this.currentFileMetadata = await this.extractFileMetadata(file);
            
            await this.showImagePreview(file);
            this.updateImageInfo();
            this.clearResults();
            this.updateSearchButtonState();
            
            console.log('File set successfully:', file.name);
            
        } catch (error) {
            this.handleError(error, 'Failed to load image');
        }
    }
    
    /**
     * Extract file metadata
     */
    async extractFileMetadata(file) {
        const metadata = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified),
            dimensions: null,
            aspectRatio: null
        };
        
        try {
            const dimensions = await this.getImageDimensions(file);
            metadata.dimensions = dimensions;
            metadata.aspectRatio = (dimensions.width / dimensions.height).toFixed(2);
        } catch (error) {
            console.warn('Could not extract image dimensions:', error);
        }
        
        return metadata;
    }
    
    /**
     * Get image dimensions
     */
    getImageDimensions(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Could not load image'));
            };
            
            img.src = url;
        });
    }
    
    /**
     * Show image preview - Fixed
     */
    async showImagePreview(file) {
        return new Promise((resolve, reject) => {
            if (!this.previewImage) {
                reject(new Error('Preview image element not found'));
                return;
            }

            const applyShownState = () => {
                if (this.previewSection) {
                    this.previewSection.classList.add('show');
                }
                console.log('Image preview shown');
            };

            // Prefer object URL for reliability; revoke after load
            try {
                const objectUrl = URL.createObjectURL(file);
                let settled = false;
                this.previewImage.onload = () => {
                    if (settled) return;
                    settled = true;
                    URL.revokeObjectURL(objectUrl);
                    applyShownState();
                    resolve();
                };
                this.previewImage.onerror = () => {
                    if (!settled) URL.revokeObjectURL(objectUrl);
                    // Fallback to FileReader if object URL fails
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.previewImage.onload = () => {
                            if (!settled) {
                                settled = true;
                                applyShownState();
                                resolve();
                            }
                        };
                        this.previewImage.onerror = () => reject(new Error('Failed to load preview image'));
                        this.previewImage.src = e.target.result;
                    };
                    reader.onerror = () => reject(new Error('Failed to read file for preview'));
                    reader.readAsDataURL(file);
                };
                this.previewImage.src = objectUrl;

                // If cached and loaded synchronously
                if (this.previewImage.complete && this.previewImage.naturalWidth > 0) {
                    this.previewImage.onload = null;
                    if (!settled) {
                        settled = true;
                        applyShownState();
                        resolve();
                    }
                }

                // Force-show as a safety net in sandboxed iframes (no load event)
                setTimeout(() => {
                    if (!settled) {
                        applyShownState();
                        settled = true;
                        resolve();
                    }
                }, 150);
            } catch (err) {
                reject(err);
            }
        });
    }
    
    /**
     * Update image information display
     */
    updateImageInfo() {
        if (!this.currentFileMetadata) return;
        
        const { dimensions, size, type } = this.currentFileMetadata;
        
        if (this.imageSize) {
            this.imageSize.textContent = dimensions 
                ? `${dimensions.width}×${dimensions.height}`
                : 'Unknown size';
        }
        
        if (this.imageFormat) {
            this.imageFormat.textContent = `${this.formatFileSize(size)} • ${type.split('/')[1].toUpperCase()}`;
        }
    }
    
    /**
     * Remove current image
     */
    removeImage() {
        if (this.currentFile && this.isSearching) {
            if (!confirm('A search is in progress. Are you sure you want to remove this image?')) {
                return;
            }
            this.abortCurrentSearch();
        }
        
        this.currentFile = null;
        this.currentFileMetadata = null;
        
        if (this.previewImage) this.previewImage.src = '';
        if (this.previewSection) this.previewSection.classList.remove('show');
        if (this.fileInput) this.fileInput.value = '';
        
        this.updateSearchButtonState();
        this.showStatus('🗑️ Image removed. Upload another image to search.', 'info');
    }
    
    /**
     * Clear all data
     */
    clearAll() {
        if (this.isSearching) {
            if (!confirm('A search is in progress. Are you sure you want to clear everything?')) {
                return;
            }
            this.abortCurrentSearch();
        }
        
        this.currentFile = null;
        this.currentFileMetadata = null;
        
        if (this.previewImage) this.previewImage.src = '';
        if (this.previewSection) this.previewSection.classList.remove('show');
        if (this.fileInput) this.fileInput.value = '';
        if (this.urlInput) this.urlInput.value = '';
        
        this.clearResults();
        this.clearStatus();
        this.updateSearchButtonState();
        
        this.showStatus('✨ Everything cleared! Ready for a new search.', 'info');
    }
    
    /**
     * Update search button state
     */
    updateSearchButtonState() {
        const hasFile = this.currentFile !== null;
        const hasUrl = this.urlInput && this.urlInput.value.trim().length > 0;
        
        if (this.searchBtn) {
            this.searchBtn.disabled = (!hasFile && !hasUrl) || this.isSearching;
        }
    }
    
    /**
     * Main search function - Fixed
     */
    async searchAnime() {
        if (this.isSearching) return;
        
        const urlValue = this.urlInput ? this.urlInput.value.trim() : '';
        
        if (!this.currentFile && !urlValue) {
            this.showStatus('❌ Please upload an image or provide an image URL', 'error');
            return;
        }
        
        if (urlValue && !this.isValidUrl(urlValue)) {
            this.showStatus('❌ Please provide a valid image URL', 'error');
            return;
        }
        
        try {
            this.startSearch();
            const searchStartTime = performance.now();
            
            const results = await this.performSearch();
            
            const searchEndTime = performance.now();
            const searchTime = searchEndTime - searchStartTime;
            this.metrics.searchTimes.push(searchTime);
            
            if (results && results.length > 0) {
                this.displayResults(results);
                this.addToHistory(this.currentFile || urlValue, results);
                this.metrics.successCount++;
                
                this.showStatus(
                    `🎉 Found ${results.length} matches in ${searchTime.toFixed(0)}ms!`, 
                    'success'
                );
            } else {
                this.showNoResults();
                this.addToHistory(this.currentFile || urlValue, []);
            }
            
        } catch (error) {
            this.metrics.errorCount++;
            this.handleError(error, 'Search failed');
        } finally {
            this.endSearch();
        }
    }
    
    /**
     * Enhanced URL validation
     */
    isValidUrl(url) {
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
        } catch {
            return false;
        }
    }
    
    /**
     * Start search
     */
    startSearch() {
        this.isSearching = true;
        if (this.searchBtn) {
            this.searchBtn.classList.add('loading');
            this.searchBtn.disabled = true;
        }
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('show');
        }
        
        if (this.abortController) {
            this.abortController.abort();
        }
        this.abortController = new AbortController();
        
        this.clearResults();
        this.clearStatus();
        
        this.animateLoadingText();
    }
    
    /**
     * Animate loading text
     */
    animateLoadingText() {
        const loadingMessages = [
            'Analyzing your image with AI...',
            'Searching anime database...',
            'Processing visual features...',
            'Matching against thousands of anime...',
            'Almost done, hang tight!'
        ];
        
        let messageIndex = 0;
        const updateMessage = () => {
            if (!this.isSearching) return;
            
            if (this.loadingText) {
                this.loadingText.textContent = loadingMessages[messageIndex];
            }
            
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setTimeout(updateMessage, 2000);
        };
        
        setTimeout(updateMessage, 1000);
    }
    
    /**
     * End search
     */
    endSearch() {
        this.isSearching = false;
        if (this.searchBtn) {
            this.searchBtn.classList.remove('loading');
        }
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('show');
        }
        this.updateSearchButtonState();
        
        if (this.abortController) {
            this.abortController = null;
        }
    }
    
    /**
     * Abort current search
     */
    abortCurrentSearch() {
        if (this.abortController) {
            this.abortController.abort();
            this.endSearch();
            this.showStatus('🛑 Search cancelled', 'info');
        }
    }
    
    /**
     * Enhanced API search with intelligent caching and retry logic
     */
    async performSearch() {
        const maxRetries = 3;
        let attempt = 0;
        
        // Check cache first
        const cacheKey = await this.generateCacheKey();
        const cachedResult = this.searchCache.get(cacheKey);
        if (cachedResult && Date.now() - cachedResult.timestamp < this.CACHE_EXPIRY) {
            this.metrics.cacheHits++;
            console.log('Cache hit! Returning cached result');
            return cachedResult.data;
        }
        
        this.metrics.cacheMisses++;
        
        while (attempt < maxRetries) {
            try {
                const searchUrl = this.buildSearchUrl();
                const requestOptions = this.buildRequestOptions();
                
                console.log('Making API request to:', searchUrl);
                const requestStart = performance.now();
                
                const response = await fetch(searchUrl, {
                    ...requestOptions,
                    signal: this.abortController ? this.abortController.signal : undefined
                });
                
                const requestEnd = performance.now();
                const responseTime = requestEnd - requestStart;
                
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('API response:', data);
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                const results = data.result || [];
                
                // Cache successful results
                if (results.length > 0) {
                    this.searchCache.set(cacheKey, {
                        data: results,
                        timestamp: Date.now(),
                        responseTime: responseTime
                    });
                }
                
                // Update metrics
                this.metrics.avgResponseTime = (this.metrics.avgResponseTime + responseTime) / 2;
                
                return results;
                
            } catch (error) {
                attempt++;
                
                if (error.name === 'AbortError') {
                    throw error;
                }
                
                if (attempt === maxRetries) {
                    throw error;
                }
                
                // Exponential backoff with jitter
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                await this.sleep(delay);
            }
        }
    }
    
    /**
     * Build search URL
     */
    buildSearchUrl() {
        const urlValue = this.urlInput ? this.urlInput.value.trim() : '';
        
        if (urlValue) {
            return `${this.API_BASE_URL}${this.API_ENDPOINTS.search}?url=${encodeURIComponent(urlValue)}`;
        } else {
            return `${this.API_BASE_URL}${this.API_ENDPOINTS.search}`;
        }
    }
    
    /**
     * Build request options
     */
    buildRequestOptions() {
        const urlValue = this.urlInput ? this.urlInput.value.trim() : '';
        
        if (urlValue) {
            return {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            };
        } else {
            const formData = new FormData();
            formData.append('image', this.currentFile);
            
            return {
                method: 'POST',
                body: formData,
                // Do not set forbidden headers like User-Agent in browsers
                headers: {}
            };
        }
    }
    
    /**
     * Display search results
     */
    displayResults(results) {
        const filteredResults = results
            .filter(result => result.similarity > 0.1)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10);
        
        const resultsHTML = this.generateResultsHTML(filteredResults);
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = resultsHTML;
        }
        
        if (this.resultsSection) {
            this.resultsSection.classList.add('show');
        }
        
        setTimeout(() => {
            if (this.resultsSection) {
                this.resultsSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 300);
    }
    
    /**
     * Generate results HTML
     */
    generateResultsHTML(results) {
        if (!results.length) {
            return this.generateNoResultsHTML();
        }
        
        const resultsTitle = `
            <h3 class="results-title">
                🎯 Search Results
                <span style="font-size: 0.8em; color: var(--text-muted);">(${results.length} found)</span>
            </h3>
        `;
        
        const resultItems = results.map((result, index) => {
            return this.generateResultItemHTML(result, index);
        }).join('');
        
        return resultsTitle + resultItems;
    }
    
    /**
     * Generate result item HTML
     */
    generateResultItemHTML(result, index) {
        const title = this.extractAnimeTitle(result);
        const episode = this.formatEpisode(result.episode);
        const similarity = ((result.similarity || 0) * 100).toFixed(1);
        const confidence = this.getConfidenceLevel(similarity);
        const isTopMatch = index === 0;
        const timestamp = this.formatTimestamp(result.from, result.to);
        
        return `
            <div class="result-item ${isTopMatch ? 'top-match' : ''}" data-similarity="${similarity}">
                <div class="result-header">
                    <span class="result-rank">#${index + 1}</span>
                    <span class="result-confidence ${confidence.class}">${confidence.text}</span>
                    <span class="result-similarity">${similarity}%</span>
                </div>
                
                <div class="result-info">
                    <h4>${this.escapeHtml(title)}</h4>
                    <div class="result-episode">${episode}</div>
                    ${timestamp ? `<div class="result-timestamp">⏰ ${timestamp}</div>` : ''}
                </div>
                
                ${result.image ? `
                    <div class="result-media">
                        <img src="${result.image}" 
                             alt="Scene from ${this.escapeHtml(title)}" 
                             class="result-image" 
                             loading="lazy"
                             onerror="this.style.display='none'">
                    </div>
                ` : ''}
                
                <div class="result-actions">
                    ${result.video ? `
                        <a href="${result.video}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="result-link"
                           title="Watch scene clip">
                            📺 Watch Clip
                        </a>
                    ` : ''}
                    ${result.anilist ? `
                        <a href="https://anilist.co/anime/${this.getAnilistId(result)}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           class="result-link"
                           title="View on AniList">
                            📚 AniList Page
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Extract AniList ID from result
     */
    getAnilistId(result) {
        if (typeof result.anilist === 'object' && result.anilist && result.anilist.id) {
            return result.anilist.id;
        }
        return result.anilist;
    }
    
    /**
     * Format timestamp range
     */
    formatTimestamp(from, to) {
        if (from === undefined || to === undefined) return null;
        
        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        };
        
        if (from === to) {
            return `At ${formatTime(from)}`;
        } else {
            return `${formatTime(from)} - ${formatTime(to)}`;
        }
    }
    
    /**
     * Enhanced anime title extraction
     */
    extractAnimeTitle(result) {
        if (result && result.anilist && result.anilist.title) {
            const title = result.anilist.title;
            return title.english || title.romaji || title.native || 'Unknown Title';
        }
        
        if (result && result.filename) {
            return this.extractTitleFromFilename(result.filename);
        }
        
        return (result && result.anime) || 'Unknown Anime';
    }
    
    /**
     * Extract title from filename
     */
    extractTitleFromFilename(filename) {
        if (!filename) return 'Unknown Anime';
        
        let title = filename
            .replace(/\[.*?\]/g, '')
            .replace(/\(.*?\)/g, '')
            .replace(/\{.*?\}/g, '')
            .replace(/【.*?】/g, '')
            .replace(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i, '')
            .replace(/[-_\s]+(ep|episode|e)[\s\d]+.*$/i, '')
            .replace(/[-_\s]+\d{2,3}.*$/g, '')
            .replace(/(1080p|720p|480p|x264|x265|AAC|FLAC)/gi, '')
            .replace(/[-_]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        title = title.replace(/^(raws?|ohys|leopard|subsplease|horriblesubs|commie|gg|doki|underwater|fff|utw|thora|reinforce|sosg|52wy)\s+/i, '');
        
        return title || 'Unknown Anime';
    }
    
    /**
     * Format episode
     */
    formatEpisode(episode) {
        if (episode === null || episode === undefined) {
            return 'Episode Unknown';
        }
        
        if (typeof episode === 'string' && episode.includes('|')) {
            const [ep, total] = episode.split('|');
            return `Episode ${ep} of ${total}`;
        }
        
        return `Episode ${episode}`;
    }
    
    /**
     * Get confidence level
     */
    getConfidenceLevel(similarity) {
        const sim = parseFloat(similarity);
        
        if (sim >= 90) {
            return { class: 'high', text: '🟢 Excellent' };
        } else if (sim >= 75) {
            return { class: 'high', text: '🟢 High' };
        } else if (sim >= 60) {
            return { class: 'medium', text: '🟡 Medium' };
        } else if (sim >= 40) {
            return { class: 'medium', text: '🟡 Low' };
        } else {
            return { class: 'low', text: '🔴 Very Low' };
        }
    }
    
    /**
     * Generate no results HTML
     */
    generateNoResultsHTML() {
        return `
            <div class="result-item">
                <div class="result-info">
                    <h4>❌ No Anime Found</h4>
                    <div class="result-episode">
                        We couldn't find any matching anime for this image.
                        <br><br>
                        <strong>💡 Tips for better results:</strong><br>
                        • Use clear, high-quality anime screenshots<br>
                        • Avoid heavily edited or filtered images<br>
                        • Try different scenes from the same anime<br>
                        • Ensure the image is actually from an anime<br>
                        • Remove text overlays or watermarks if possible<br><br>
                        
                        <strong>🔧 Technical tips:</strong><br>
                        • Images with 720p+ resolution work best<br>
                        • JPEG and PNG formats are most reliable<br>
                        • Face-focused scenes often yield better results<br>
                        • Try cropping to focus on the main subject
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Show no results
     */
    showNoResults() {
        const resultsHTML = `
            <h3 class="results-title">
                🔍 Search Results
                <span style="font-size: 0.8em; color: var(--text-muted);">(0 found)</span>
            </h3>
            ${this.generateNoResultsHTML()}
        `;
        
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = resultsHTML;
        }
        
        if (this.resultsSection) {
            this.resultsSection.classList.add('show');
        }
        this.showStatus('❌ No anime matches found. Try the tips above for better results.', 'error');
    }
    
    /**
     * Clear results
     */
    clearResults() {
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = '';
        }
        if (this.resultsSection) {
            this.resultsSection.classList.remove('show');
        }
    }
    
    /**
     * Show status message
     */
    showStatus(message, type = 'info') {
        if (!this.statusMessage) return;
        
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message show ${type}`;
        
        if (type !== 'error') {
            setTimeout(() => this.clearStatus(), 5000);
        }
        
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
    
    /**
     * Clear status message
     */
    clearStatus() {
        if (this.statusMessage) {
            this.statusMessage.classList.remove('show');
        }
    }
    
    /**
     * History Management
     */
    addToHistory(input, results) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date(),
            input: typeof input === 'string' ? input : input.name,
            inputType: typeof input === 'string' ? 'url' : 'file',
            resultsCount: results.length,
            topResult: results[0] ? this.extractAnimeTitle(results[0]) : null,
            similarity: results[0] ? results[0].similarity : 0
        };
        
        this.searchHistory.unshift(historyItem);
        
        if (this.searchHistory.length > 50) {
            this.searchHistory = this.searchHistory.slice(0, 50);
        }
        
        this.saveSearchHistory();
        this.updateStats();
    }
    
    loadSearchHistory() {
        try {
            const history = localStorage.getItem('animeSauceFinder_history');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.warn('Failed to load search history:', error);
            return [];
        }
    }
    
    saveSearchHistory() {
        try {
            localStorage.setItem('animeSauceFinder_history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('Failed to save search history:', error);
        }
    }
    
    toggleHistory() {
        if (this.historyPanel && this.historyPanel.classList.contains('show')) {
            this.closeHistory();
        } else {
            this.openHistory();
        }
    }
    
    openHistory() {
        this.renderHistory();
        if (this.historyPanel) {
            this.historyPanel.classList.add('show');
        }
    }
    
    closeHistory() {
        if (this.historyPanel) {
            this.historyPanel.classList.remove('show');
        }
    }
    
    renderHistory() {
        if (!this.historyContent) return;
        
        if (this.searchHistory.length === 0) {
            this.historyContent.innerHTML = '<p class="history-empty">No search history yet. Start by uploading an image!</p>';
            return;
        }
        
        const historyHTML = this.searchHistory.map(item => `
            <div class="history-item">
                <div class="history-header">
                    <span class="history-type">${item.inputType === 'file' ? '📁' : '🔗'}</span>
                    <span class="history-time">${this.formatRelativeTime(item.timestamp)}</span>
                </div>
                <div class="history-input">${this.escapeHtml(item.input)}</div>
                <div class="history-result">
                    ${item.resultsCount > 0 
                        ? `✅ ${item.topResult} (${(item.similarity * 100).toFixed(1)}%)` 
                        : '❌ No matches found'
                    }
                </div>
            </div>
        `).join('');
        
        this.historyContent.innerHTML = historyHTML;
    }
    
    clearHistory() {
        if (confirm('Are you sure you want to clear all search history?')) {
            this.searchHistory = [];
            this.saveSearchHistory();
            this.renderHistory();
            this.updateStats();
            this.showStatus('🗑️ Search history cleared', 'info');
        }
    }
    
    /**
     * Modal Management
     */
    openModal(type) {
        const modal = type === 'help' ? this.helpModal : this.aboutModal;
        if (modal) {
            modal.classList.add('show');
            if (modal.setAttribute) {
                modal.setAttribute('aria-hidden', 'false');
            }
        }
    }
    
    closeModal(type) {
        const modal = type === 'help' ? this.helpModal : this.aboutModal;
        if (modal) {
            modal.classList.remove('show');
            if (modal.setAttribute) {
                modal.setAttribute('aria-hidden', 'true');
            }
        }
    }
    
    /**
     * Fullscreen functionality
     */
    openFullscreen() {
        if (this.previewImage && this.previewImage.src && this.fullscreenImage && this.fullscreenModal) {
            this.fullscreenImage.src = this.previewImage.src;
            this.fullscreenModal.classList.add('show');
            if (this.fullscreenModal.setAttribute) {
                this.fullscreenModal.setAttribute('aria-hidden', 'false');
            }
        }
    }
    
    closeFullscreen() {
        if (this.fullscreenModal) {
            this.fullscreenModal.classList.remove('show');
            if (this.fullscreenModal.setAttribute) {
                this.fullscreenModal.setAttribute('aria-hidden', 'true');
            }
        }
    }
    
    /**
     * Utility Functions
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Generate cache key for search results
     */
    async generateCacheKey() {
        if (this.currentFile) {
            const hash = await this.hashFile(this.currentFile);
            return `file_${hash}_${this.currentFile.size}`;
        } else if (this.urlInput && this.urlInput.value) {
            return `url_${this.urlInput.value}`;
        }
        return 'unknown';
    }

    /**
     * Simple file hashing for cache keys
     */
    async hashFile(file) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return new Date(date).toLocaleDateString();
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    supportsAvif() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        try {
            return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
        } catch {
            return false;
        }
    }
    
    /**
     * Error handling
     */
    handleError(error, context) {
        console.error(`${context}:`, error);
        
        let message = this.getErrorMessage(error);
        if (context) {
            message = `${context}: ${message}`;
        }
        
        this.showStatus(message, 'error');
        this.metrics.errorCount++;
    }
    
    getErrorMessage(error) {
        const message = error.message.toLowerCase();
        
        if (error.name === 'AbortError') {
            return 'Search was cancelled';
        }
        
        if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
            return '🌐 Network error. Please check your internet connection and try again.';
        }
        
        if (message.includes('429') || message.includes('rate limit')) {
            return '⏳ Too many requests. Please wait a moment and try again.';
        }
        
        if (message.includes('500') || message.includes('502') || message.includes('503')) {
            return '🛠️ Server error. The service might be temporarily unavailable.';
        }
        
        if (message.includes('400') || message.includes('bad request')) {
            return '❌ Invalid request. Please check your image and try again.';
        }
        
        if (message.includes('413') || message.includes('payload too large')) {
            return '📏 Image too large. Please use a smaller image.';
        }
        
        return '🔧 Something went wrong. Please try again with a different image.';
    }
    
    /**
     * Performance and Analytics
     */
    updateStats() {
        if (this.totalSearches) {
            this.totalSearches.textContent = this.searchHistory.length.toString();
        }
    }
    
    logPerformanceMetrics() {
        if (!this.features.performance) return;
        
        try {
            const timing = performance.timing;
            const loadTime = timing && timing.loadEventEnd && timing.navigationStart
                ? timing.loadEventEnd - timing.navigationStart
                : 'Unknown';
            
            console.group('🚀 Performance Metrics');
            console.log(`Page Load Time: ${loadTime}ms`);
            console.log(`Total Searches: ${this.searchHistory.length}`);
            
            const totalAttempts = this.metrics.successCount + this.metrics.errorCount;
            const successRate = totalAttempts > 0 
                ? ((this.metrics.successCount / totalAttempts) * 100).toFixed(1)
                : 'N/A';
            console.log(`Success Rate: ${successRate}%`);
            
            if (this.metrics.searchTimes.length > 0) {
                const avgSearchTime = this.metrics.searchTimes.reduce((a, b) => a + b, 0) / this.metrics.searchTimes.length;
                console.log(`Average Search Time: ${avgSearchTime.toFixed(0)}ms`);
            }
            
            console.log(`Cache Size: ${this.searchCache.size} entries`);
            console.log(`Cache Hit Rate: ${this.metrics.cacheHits > 0 ? ((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100).toFixed(1) : 0}%`);
            console.log(`Average Response Time: ${this.metrics.avgResponseTime.toFixed(0)}ms`);
            console.log(`Memory Usage: ${this.metrics.memoryUsage > 0 ? (this.metrics.memoryUsage / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'}`);
            console.groupEnd();
        } catch (error) {
            console.warn('Failed to log performance metrics:', error);
        }
    }
    
    /**
     * Advanced Features
     */
    loadUserPreferences() {
        try {
            const prefs = localStorage.getItem('animeSauceFinder_prefs');
            if (prefs) {
                const preferences = JSON.parse(prefs);
                console.log('Loaded user preferences:', preferences);
            }
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    }
    
    preloadCriticalResources() {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = this.API_BASE_URL;
        document.head.appendChild(link);
    }
    
    setupIntersectionObserver() {
        if (!this.features.intersection) return;
        
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        this.imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });
    }

    /**
     * Setup advanced caching system
     */
    setupAdvancedCaching() {
        if (this.features.indexedDB) {
            this.initIndexedDB();
        }
        
        // Clean up old cache entries
        this.cleanupCache();
        
        // Set up periodic cache cleanup
        setInterval(() => this.cleanupCache(), 300000); // Every 5 minutes
    }

    /**
     * Initialize IndexedDB for persistent caching
     */
    initIndexedDB() {
        const request = indexedDB.open('AnimeSauceFinder', 1);
        
        request.onerror = () => console.warn('IndexedDB not available');
        request.onsuccess = () => {
            this.db = request.result;
            console.log('IndexedDB initialized for advanced caching');
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('searchCache')) {
                db.createObjectStore('searchCache', { keyPath: 'key' });
            }
        };
    }

    /**
     * Clean up expired cache entries
     */
    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.searchCache.entries()) {
            if (now - value.timestamp > this.CACHE_EXPIRY) {
                this.searchCache.delete(key);
            }
        }
        
        // Limit cache size
        if (this.searchCache.size > 100) {
            const entries = Array.from(this.searchCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toDelete = entries.slice(0, entries.length - 100);
            toDelete.forEach(([key]) => this.searchCache.delete(key));
        }
    }

    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        if (this.features.performance) {
            // Monitor memory usage
            if ('memory' in performance) {
                setInterval(() => {
                    this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
                }, 10000);
            }
            
            // Monitor long tasks
            if ('PerformanceObserver' in window) {
                try {
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.duration > 50) {
                                console.warn('Long task detected:', entry);
                            }
                        }
                    });
                    observer.observe({ entryTypes: ['longtask'] });
                } catch (e) {
                    console.warn('PerformanceObserver not available');
                }
            }
        }
    }
}

// Application Initialization - Fixed
function initializeApp() {
    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeApp);
            return;
        }
        
        setTimeout(() => {
            try {
                window.animeSauceFinder = new AnimeSauceFinder();
                console.log('🎉 Anime Sauce Finder initialized successfully!');
                
            } catch (error) {
                console.error('Failed to initialize Anime Sauce Finder:', error);
                
                setTimeout(() => {
                    try {
                        window.animeSauceFinder = new AnimeSauceFinder();
                        console.log('🎉 Anime Sauce Finder initialized successfully on retry!');
                    } catch (retryError) {
                        console.error('Retry failed:', retryError);
                        showFallbackError();
                    }
                }, 1000);
            }
        }, 100);
        
    } catch (error) {
        console.error('Critical initialization error:', error);
        showFallbackError();
    }
}

function showFallbackError() {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
        <div style="
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%);
            background: #f87171; 
            color: white; 
            padding: 20px; 
            border-radius: 12px;
            text-align: center;
            z-index: 9999;
            max-width: 400px;
        ">
            <h3>⚠️ Initialization Error</h3>
            <p>Failed to load Anime Sauce Finder. Please refresh the page and try again.</p>
            <button onclick="location.reload()" style="
                background: white; 
                color: #f87171; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 6px; 
                cursor: pointer;
                margin-top: 10px;
            ">Refresh Page</button>
        </div>
    `;
    document.body.appendChild(errorDiv);
}

// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.animeSauceFinder) {
        window.animeSauceFinder.handleError(
            event.reason, 
            'Unexpected error occurred'
        );
    }
});

window.addEventListener('error', (event) => {
    console.error('Global JavaScript error:', event.error);
    if (window.animeSauceFinder) {
        window.animeSauceFinder.handleError(
            event.error, 
            'JavaScript error'
        );
    }
});

// Initialize the app
initializeApp();

// Service Worker Registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when service worker is ready
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered:', registration))
        //     .catch(error => console.log('SW registration failed:', error));
    });
}

