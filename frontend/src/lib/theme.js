// Tema Warna untuk Website Sekolah
export const themes = {
  emerald: {
    name: 'Emerald',
    primary: {
      DEFAULT: '#10B981',
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B'
    },
    accent: {
      DEFAULT: '#059669',
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B'
    }
  },
  ocean: {
    name: 'Ocean',
    primary: {
      DEFAULT: '#3B82F6', // Blue-500
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A'
    },
    accent: {
      DEFAULT: '#2563EB', // Blue-600
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A'
    }
  },
  sunset: {
    name: 'Sunset',
    primary: {
      DEFAULT: '#F59E0B', // Amber-500
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F'
    },
    accent: {
      DEFAULT: '#D97706', // Amber-600
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F'
    }
  }
};

// Fungsi untuk menerapkan tema ke elemen root
export function applyTheme(theme) {
  const root = document.documentElement;
  
  // Terapkan warna primary
  Object.entries(theme.primary).forEach(([key, value]) => {
    root.style.setProperty(`--color-primary-${key}`, value);
  });
  
  // Terapkan warna accent
  Object.entries(theme.accent).forEach(([key, value]) => {
    root.style.setProperty(`--color-accent-${key}`, value);
  });
  
  // Tetapkan nama tema
  root.setAttribute('data-theme', theme.name.toLowerCase());
}

// Fungsi untuk mendapatkan tema dari localStorage
export function getCurrentTheme() {
  const savedTheme = localStorage.getItem('selectedTheme');
  return savedTheme || 'emerald'; // Tema default
}

// Fungsi untuk menyimpan tema ke localStorage
export function saveCurrentTheme(themeName) {
  localStorage.setItem('selectedTheme', themeName);
}