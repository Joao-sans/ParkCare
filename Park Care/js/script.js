document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.highlight-hover');
  
    elements.forEach(el => {
      const text = el.getAttribute('data-animated-text');
      if (!text) return;
  
      el.innerHTML = ''; // Limpa o conteúdo atual
  
      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.transitionDelay = `${index * 30}ms`; // animação em cascata
        el.appendChild(span);
      });
    });
  });
  