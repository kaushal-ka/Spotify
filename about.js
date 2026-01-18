// Help Modal functionality
const helpModal = document.getElementById('helpModal');
const modalClose = document.querySelector('.modal-close');

// Open modal with ? key
document.addEventListener('keydown', (e) => {
  if (e.key === '?' || e.shiftKey && e.key === '/') {
    e.preventDefault();
    helpModal.classList.add('show');
  }
  
  // Close modal with Escape key
  if (e.key === 'Escape') {
    helpModal.classList.remove('show');
  }
});

// Close button
modalClose.addEventListener('click', () => {
  helpModal.classList.remove('show');
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === helpModal) {
    helpModal.classList.remove('show');
  }
});

console.log('Help: Press ? to open keyboard shortcuts guide');
