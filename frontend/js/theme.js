// Theme Management Logic
(function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    
    // Immediate application to prevent flash of unstyled content
    if (savedTheme === 'dark') {
        document.documentElement.style.backgroundColor = '#111827'; // gray-900
    } else {
        document.documentElement.style.backgroundColor = '#f9fafb'; // gray-50
    }
})();

function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.backgroundColor = '#111827';
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.backgroundColor = '#f9fafb';
        localStorage.setItem('theme', 'light');
    }
}

function getTheme() {
    return localStorage.getItem('theme') || 'dark';
}
