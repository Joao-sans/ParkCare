document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('.highlight-hover');

  elements.forEach(el => {
    const text = el.getAttribute('data-animated-text');
    if (!text) return;

    el.innerHTML = '';

    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.transitionDelay = `${index * 30}ms`;
      el.appendChild(span);
    });
  });

  const menuToggle = document.getElementById("menu-toggle");
  const menuLinks = document.querySelector(".menu-links");

  if(menuToggle && menuLinks) {
    menuToggle.addEventListener("click", () => {
      menuLinks.classList.toggle("show");
    });
  }
});
  
