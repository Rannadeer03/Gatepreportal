/**
 * Formats a date string into a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Feb 12, 2026")
 */
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

/**
 * Formats a date string into a readable date and time format
 * @param dateString - ISO date string
 * @returns Formatted date and time string (e.g., "Feb 12, 2026 at 10:30 PM")
 */
export const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};

/**
 * Generates a random classroom banner color
 * @returns Hex color code
 */
export const getRandomBannerColor = (): string => {
    const colors = [
        '#4F46E5', // Indigo
        '#7C3AED', // Purple
        '#DB2777', // Pink
        '#DC2626', // Red
        '#EA580C', // Orange
        '#059669', // Green
        '#0284C7', // Blue
        '#4338CA', // Deep Purple
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Copies text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when text is copied
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
};
