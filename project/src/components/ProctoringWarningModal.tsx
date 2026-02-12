import React from 'react';
import { X, AlertTriangle, Shield, Clock } from 'lucide-react';

interface ProctoringWarningModalProps {
    isOpen: boolean;
    violations: number;
    maxViolations: number;
    message: string;
    timeAwaySeconds?: number;
    onDismiss: () => void;
    shouldAutoSubmit?: boolean;
}

/**
 * Proctoring Warning Modal Component
 * 
 * Displays warnings when students violate exam proctoring rules.
 * Features progressive warning levels with visual feedback.
 */
const ProctoringWarningModal: React.FC<ProctoringWarningModalProps> = ({
    isOpen,
    violations,
    maxViolations,
    message,
    timeAwaySeconds = 0,
    onDismiss,
    shouldAutoSubmit = false,
}) => {
    if (!isOpen) return null;

    const remainingChances = maxViolations - violations;
    const warningLevel = violations >= maxViolations ? 'critical' : violations >= maxViolations - 1 ? 'severe' : 'warning';

    // Determine colors based on warning level
    const colorClasses = {
        critical: {
            bg: 'bg-red-50',
            border: 'border-red-500',
            text: 'text-red-800',
            icon: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700',
            progress: 'bg-red-500',
        },
        severe: {
            bg: 'bg-orange-50',
            border: 'border-orange-500',
            text: 'text-orange-800',
            icon: 'text-orange-600',
            button: 'bg-orange-600 hover:bg-orange-700',
            progress: 'bg-orange-500',
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-500',
            text: 'text-yellow-800',
            icon: 'text-yellow-600',
            button: 'bg-yellow-600 hover:bg-yellow-700',
            progress: 'bg-yellow-500',
        },
    };

    const colors = colorClasses[warningLevel];

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                {/* Modal */}
                <div className={`relative max-w-md w-full ${colors.bg} border-4 ${colors.border} rounded-2xl shadow-2xl transform transition-all animate-shake`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between p-6 border-b-2 ${colors.border}`}>
                        <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-full ${colors.icon} bg-white shadow-lg`}>
                                {shouldAutoSubmit ? (
                                    <Shield className="w-8 h-8 animate-pulse" />
                                ) : (
                                    <AlertTriangle className="w-8 h-8 animate-bounce" />
                                )}
                            </div>
                            <div>
                                <h3 className={`text-2xl font-bold ${colors.text}`}>
                                    {shouldAutoSubmit ? 'Auto-Submitting!' : 'Proctoring Alert'}
                                </h3>
                                <p className={`text-sm ${colors.text} opacity-75`}>
                                    Violation {violations} of {maxViolations}
                                </p>
                            </div>
                        </div>
                        {!shouldAutoSubmit && (
                            <button
                                onClick={onDismiss}
                                className={`p-2 rounded-full hover:bg-white hover:bg-opacity-30 transition-colors ${colors.text}`}
                                aria-label="Close"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        {/* Warning Message */}
                        <div className={`text-lg font-semibold ${colors.text} text-center`}>
                            {message}
                        </div>

                        {/* Violation Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className={colors.text}>Violations</span>
                                <span className={`font-bold ${colors.text}`}>
                                    {violations} / {maxViolations}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`${colors.progress} h-full transition-all duration-500 ease-out`}
                                    style={{ width: `${(violations / maxViolations) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Time Away Indicator */}
                        {timeAwaySeconds > 0 && (
                            <div className={`flex items-center justify-center space-x-2 p-3 bg-white bg-opacity-50 rounded-lg ${colors.text}`}>
                                <Clock className="w-5 h-5" />
                                <span className="font-medium">
                                    Time away: {Math.floor(timeAwaySeconds / 60)}m {timeAwaySeconds % 60}s
                                </span>
                            </div>
                        )}

                        {/* Remaining Chances */}
                        {remainingChances > 0 && !shouldAutoSubmit && (
                            <div className={`text-center p-4 bg-white bg-opacity-50 rounded-lg ${colors.text}`}>
                                <p className="text-sm">Chances Remaining</p>
                                <p className="text-4xl font-bold">{remainingChances}</p>
                            </div>
                        )}

                        {/* Critical Warning */}
                        {shouldAutoSubmit && (
                            <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 text-center">
                                <p className="text-red-800 font-bold text-lg">
                                    ⚠️ Your test is being submitted automatically
                                </p>
                                <p className="text-red-700 text-sm mt-2">
                                    Maximum violation limit reached
                                </p>
                            </div>
                        )}

                        {/* Rules Reminder */}
                        <div className={`text-xs ${colors.text} opacity-75 space-y-1 border-t-2 ${colors.border} pt-4`}>
                            <p className="font-semibold">📋 Exam Rules:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Do not switch tabs or windows</li>
                                <li>Do not exit fullscreen mode</li>
                                <li>Stay on the exam page at all times</li>
                                <li>Do not use copy/paste or right-click</li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer */}
                    {!shouldAutoSubmit && (
                        <div className="p-6 border-t-2 border-gray-200">
                            <button
                                onClick={onDismiss}
                                className={`w-full ${colors.button} text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl`}
                            >
                                I Understand - Continue Exam
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add shake animation */}
            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
        </>
    );
};

export default ProctoringWarningModal;
