import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface ProctoringConfig {
    testId: string;
    studentId: string;
    maxViolations?: number; // Default: 3
    warningDuration?: number; // Duration warning modal stays (ms), Default: 5000
    enableFullscreen?: boolean; // Require fullscreen mode
    autoSubmitOnMaxViolations?: boolean; // Default: true
    trackTimeAway?: boolean; // Track total time spent away, Default: true
    preventCopyPaste?: boolean; // Disable copy/paste, Default: true
    preventRightClick?: boolean; // Disable right-click, Default: true
}

export interface ProctoringState {
    violations: number;
    showWarning: boolean;
    warningMessage: string;
    timeAwaySeconds: number;
    isTabActive: boolean;
    shouldAutoSubmit: boolean;
    violationHistory: ViolationRecord[];
}

export interface ViolationRecord {
    timestamp: Date;
    type: 'tab_switch' | 'fullscreen_exit' | 'copy_attempt' | 'paste_attempt' | 'right_click';
    duration?: number; // For tab switches, time spent away
}

/**
 * Advanced Exam Proctoring Hook
 * 
 * Features:
 * - Tab switch detection with progressive warnings
 * - Fullscreen enforcement (optional)
 * - Copy/Paste prevention (optional)
 * - Right-click prevention (optional)
 * - Violation tracking & database logging
 * - Auto-submission after max violations
 * - Time tracking for periods away from exam
 * 
 * @param config - Proctoring configuration
 * @returns Proctoring state and control functions
 */
export const useExamProctoring = (config: ProctoringConfig) => {
    const {
        testId,
        studentId,
        maxViolations = 3,
        warningDuration = 5000,
        enableFullscreen = false,
        autoSubmitOnMaxViolations = true,
        trackTimeAway = true,
        preventCopyPaste = true,
        preventRightClick = true,
    } = config;

    const [state, setState] = useState<ProctoringState>({
        violations: 0,
        showWarning: false,
        warningMessage: '',
        timeAwaySeconds: 0,
        isTabActive: true,
        shouldAutoSubmit: false,
        violationHistory: [],
    });

    const tabSwitchStartTime = useRef<number | null>(null);
    const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const timeAwayIntervalRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Log violation to database
     */
    const logViolation = useCallback(async (violation: ViolationRecord) => {
        try {
            await supabase.from('exam_violations').insert({
                test_id: testId,
                student_id: studentId,
                violation_type: violation.type,
                timestamp: violation.timestamp.toISOString(),
                duration_seconds: violation.duration || 0,
            });
        } catch (error) {
            console.error('Failed to log violation:', error);
        }
    }, [testId, studentId]);

    /**
     * Add a violation and show appropriate warning
     */
    const addViolation = useCallback((violation: ViolationRecord) => {
        setState((prev) => {
            const newViolations = prev.violations + 1;
            const remainingChances = maxViolations - newViolations;

            let message = '';

            if (newViolations >= maxViolations && autoSubmitOnMaxViolations) {
                message = '⚠️ Maximum violations reached! Your test will be auto-submitted.';
            } else if (remainingChances === 1) {
                message = `🚨 Final Warning! You have ${remainingChances} chance left. Next violation will auto-submit your test.`;
            } else if (remainingChances === 2) {
                message = `⚠️ Second Warning! You have ${remainingChances} chances left. Please stay on this tab.`;
            } else {
                message = `⚠️ Warning! Tab switching is not allowed during the exam. Chances left: ${remainingChances}`;
            }

            return {
                ...prev,
                violations: newViolations,
                showWarning: true,
                warningMessage: message,
                shouldAutoSubmit: newViolations >= maxViolations && autoSubmitOnMaxViolations,
                violationHistory: [...prev.violationHistory, violation],
            };
        });

        // Log to database
        logViolation(violation);

        // Auto-hide warning after duration
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
        }
        warningTimeoutRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, showWarning: false }));
        }, warningDuration);
    }, [maxViolations, autoSubmitOnMaxViolations, warningDuration, logViolation]);

    /**
     * Handle tab visibility change
     */
    const handleVisibilityChange = useCallback(() => {
        if (document.hidden) {
            // Tab becomes inactive
            setState((prev) => ({ ...prev, isTabActive: false }));
            tabSwitchStartTime.current = Date.now();

            // Start tracking time away
            if (trackTimeAway && !timeAwayIntervalRef.current) {
                timeAwayIntervalRef.current = setInterval(() => {
                    setState((prev) => ({ ...prev, timeAwaySeconds: prev.timeAwaySeconds + 1 }));
                }, 1000);
            }
        } else {
            // Tab becomes active again
            setState((prev) => ({ ...prev, isTabActive: true }));

            // Calculate time away
            if (tabSwitchStartTime.current) {
                const timeAway = Math.floor((Date.now() - tabSwitchStartTime.current) / 1000);

                // Add violation
                addViolation({
                    timestamp: new Date(),
                    type: 'tab_switch',
                    duration: timeAway,
                });

                tabSwitchStartTime.current = null;
            }

            // Stop tracking time away
            if (timeAwayIntervalRef.current) {
                clearInterval(timeAwayIntervalRef.current);
                timeAwayIntervalRef.current = null;
            }
        }
    }, [trackTimeAway, addViolation]);

    /**
     * Handle fullscreen change
     */
    const handleFullscreenChange = useCallback(() => {
        if (enableFullscreen && !document.fullscreenElement) {
            addViolation({
                timestamp: new Date(),
                type: 'fullscreen_exit',
            });
        }
    }, [enableFullscreen, addViolation]);

    /**
     * Handle copy attempt
     */
    const handleCopy = useCallback((e: Event) => {
        if (preventCopyPaste) {
            e.preventDefault();
            addViolation({
                timestamp: new Date(),
                type: 'copy_attempt',
            });
        }
    }, [preventCopyPaste, addViolation]);

    /**
     * Handle paste attempt
     */
    const handlePaste = useCallback((e: Event) => {
        if (preventCopyPaste) {
            e.preventDefault();
            addViolation({
                timestamp: new Date(),
                type: 'paste_attempt',
            });
        }
    }, [preventCopyPaste, addViolation]);

    /**
     * Handle right-click attempt
     */
    const handleContextMenu = useCallback((e: Event) => {
        if (preventRightClick) {
            e.preventDefault();
            addViolation({
                timestamp: new Date(),
                type: 'right_click',
            });
        }
    }, [preventRightClick, addViolation]);

    /**
     * Request fullscreen mode
     */
    const requestFullscreen = useCallback(() => {
        if (enableFullscreen && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error('Failed to enter fullscreen:', err);
            });
        }
    }, [enableFullscreen]);

    /**
     * Dismiss warning manually
     */
    const dismissWarning = useCallback(() => {
        setState((prev) => ({ ...prev, showWarning: false }));
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
            warningTimeoutRef.current = null;
        }
    }, []);

    // Setup event listeners
    useEffect(() => {
        // Tab visibility
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Fullscreen
        if (enableFullscreen) {
            document.addEventListener('fullscreenchange', handleFullscreenChange);
            // Request fullscreen on mount
            requestFullscreen();
        }

        // Copy/Paste prevention
        if (preventCopyPaste) {
            document.addEventListener('copy', handleCopy);
            document.addEventListener('paste', handlePaste);
        }

        // Right-click prevention
        if (preventRightClick) {
            document.addEventListener('contextmenu', handleContextMenu);
        }

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('contextmenu', handleContextMenu);

            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current);
            }
            if (timeAwayIntervalRef.current) {
                clearInterval(timeAwayIntervalRef.current);
            }

            // Exit fullscreen on cleanup
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        };
    }, [
        handleVisibilityChange,
        handleFullscreenChange,
        handleCopy,
        handlePaste,
        handleContextMenu,
        enableFullscreen,
        preventCopyPaste,
        preventRightClick,
        requestFullscreen,
    ]);

    return {
        ...state,
        dismissWarning,
        requestFullscreen,
    };
};
