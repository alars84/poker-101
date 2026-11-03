import '@testing-library/jest-dom/vitest'

// jsdom has no layout, so scrolling is left for browser checks.
window.scrollTo = () => {}
