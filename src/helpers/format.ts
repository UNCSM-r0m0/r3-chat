// Helpers para formateo de datos

export const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
        return 'Ahora';
    } else if (diffInMinutes < 60) {
        return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
        return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays < 7) {
        return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    } else {
        return d.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    }
};

export const formatTime = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatDateTime = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
};

export const generateChatTitle = (message: string): string => {
    const words = message.trim().split(' ');
    if (words.length <= 6) {
        return message;
    }
    return words.slice(0, 6).join(' ') + '...';
};
