// Ad Blocker Detection and Handling Service
class AdBlockerService {
  private isAdBlockerDetected = false;

  // Detect if ad blocker is active
  detectAdBlocker(): Promise<boolean> {
    return new Promise((resolve) => {
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.position = 'absolute';
      testAd.style.left = '-10000px';
      testAd.style.top = '-10000px';
      testAd.style.width = '1px';
      testAd.style.height = '1px';
      testAd.style.overflow = 'hidden';
      
      document.body.appendChild(testAd);
      
      // Check if ad is hidden by ad blocker
      setTimeout(() => {
        const isHidden = testAd.offsetHeight === 0 || testAd.offsetWidth === 0;
        document.body.removeChild(testAd);
        
        this.isAdBlockerDetected = isHidden;
        resolve(isHidden);
      }, 100);
    });
  }

  // Handle YouTube embed with ad blocker
  handleYouTubeEmbed(videoId: string): string {
    if (this.isAdBlockerDetected) {
      // Use YouTube's privacy-enhanced embed
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
    }
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }

  // Show ad blocker warning
  showAdBlockerWarning(): void {
    if (this.isAdBlockerDetected) {
      console.warn('Ad blocker detected. Some features may not work properly.');
      // You can show a user-friendly message here
    }
  }

  // Check if ad blocker is active
  isAdBlockerActive(): boolean {
    return this.isAdBlockerDetected;
  }

  // Initialize ad blocker detection
  async init(): Promise<void> {
    await this.detectAdBlocker();
    this.showAdBlockerWarning();
  }
}

export const adBlockerService = new AdBlockerService(); 