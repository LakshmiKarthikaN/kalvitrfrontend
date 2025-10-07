export const getPasswordStrength = (password) => {
    let strength = 0;
  
    if (!password) return { label: "Weak", color: "text-red-500" };
  
    // Rules
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
  
    // Decide level
    if (strength <= 2) return { label: "Weak", color: "text-red-500" };
    if (strength === 3 || strength === 4) return { label: "Medium", color: "text-yellow-500" };
    if (strength === 5) return { label: "Strong", color: "text-green-500" };
  
    return { label: "Weak", color: "text-red-500" };
  };
  