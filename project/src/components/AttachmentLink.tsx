import React from 'react';
import { FileText } from 'lucide-react';

interface AttachmentLinkProps {
    url: string;
    name?: string;
    variant?: 'purple' | 'blue';
}

export const AttachmentLink: React.FC<AttachmentLinkProps> = ({
    url,
    name,
    variant = 'blue'
}) => {
    const colorClasses = variant === 'purple'
        ? 'bg-purple-50 hover:bg-purple-100 text-purple-700'
        : 'bg-blue-50 hover:bg-blue-100 text-blue-700';

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2 ${colorClasses} rounded-lg transition-colors`}
        >
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">{name || 'Download Attachment'}</span>
        </a>
    );
};
