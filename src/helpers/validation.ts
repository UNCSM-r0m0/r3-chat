// Helpers para validación

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
    // Al menos 8 caracteres, una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

export const isValidName = (name: string): boolean => {
    // Al menos 2 caracteres, solo letras y espacios
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
    return nameRegex.test(name.trim());
};

export const validateLoginForm = (email: string, password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!email.trim()) {
        errors.push('El email es requerido');
    } else if (!isValidEmail(email)) {
        errors.push('El email no es válido');
    }

    if (!password) {
        errors.push('La contraseña es requerida');
    } else if (password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export const validateRegisterForm = (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!name.trim()) {
        errors.push('El nombre es requerido');
    } else if (!isValidName(name)) {
        errors.push('El nombre debe tener al menos 2 caracteres y solo contener letras');
    }

    if (!email.trim()) {
        errors.push('El email es requerido');
    } else if (!isValidEmail(email)) {
        errors.push('El email no es válido');
    }

    if (!password) {
        errors.push('La contraseña es requerida');
    } else if (!isValidPassword(password)) {
        errors.push('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
    }

    if (!confirmPassword) {
        errors.push('La confirmación de contraseña es requerida');
    } else if (password !== confirmPassword) {
        errors.push('Las contraseñas no coinciden');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export const validateMessage = (message: string): { isValid: boolean; error?: string } => {
    if (!message.trim()) {
        return { isValid: false, error: 'El mensaje no puede estar vacío' };
    }

    if (message.length > 10000) {
        return { isValid: false, error: 'El mensaje es demasiado largo (máximo 10,000 caracteres)' };
    }

    return { isValid: true };
};
