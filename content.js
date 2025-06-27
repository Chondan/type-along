// Prevent re-injection
if (!window.__typeAlongInjected) {
  window.__typeAlongInjected = true;

  // Inject overlay once
  const overlay = document.createElement('div');
  overlay.id = 'type-along-overlay';
  document.body.appendChild(overlay);

  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = chrome.runtime.getURL('style.css');
  document.head.appendChild(style);

  let activeText = '';
  let wordIndex = 0;
  let charIndex = 0;
  let caret;
  let container;
  let wordElements;

  document.addEventListener('mouseover', e => {
    const p = e.target.closest('p');
    if (p && p.innerText.length > 20) {
      const words = p.innerText.trim().split(/\s+/).slice(0, 100);
      activeText = words;

      renderOverlay(words);
    }
  });

  function renderOverlay(words) {
    overlay.innerHTML = `
      <div id="type-container">
        ${words
          .map(
            word =>
              `<div class="word">${[...word]
                .map(ch => `<span class="char">${ch}</span>`)
                .join('')}<span class="char"> </span></div>`
          )
          .join('')}
        <div id="caret" class="caret"></div>
      </div>
    `;

    wordIndex = 0;
    charIndex = 0;
    caret = document.getElementById('caret');
    container = document.getElementById('type-container');
    wordElements = container.querySelectorAll('.word');
    updateCaret();
  }

  function getCharEl(w, c) {
    return wordElements[w]?.children[c];
  }

  function updateCaret() {
    const el = getCharEl(wordIndex, charIndex);
    if (!el) return;
    const elRect = el.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    caret.style.left = `${elRect.left - contRect.left}px`;
    caret.style.top = `${elRect.top - contRect.top}px`;
  }

  document.addEventListener('keydown', e => {
    if (!container) return;

    // Escape to remove overlay
    if (e.key === 'Escape') {
      overlay.innerHTML = '';
      return;
    }

    const el = getCharEl(wordIndex, charIndex);
    const currentWord = activeText[wordIndex] || '';
    const expectedChar = currentWord[charIndex] || ' ';

    if (e.key.length === 1 && el) {
      el.classList.add(e.key === expectedChar ? 'correct' : 'incorrect');
      charIndex++;
      if (charIndex > currentWord.length) {
        charIndex = 0;
        wordIndex++;
      }
      updateCaret();
    } else if (e.key === 'Backspace') {
      if (charIndex > 0) {
        charIndex--;
      } else if (wordIndex > 0) {
        wordIndex--;
        charIndex = activeText[wordIndex].length;
      }
      const el = getCharEl(wordIndex, charIndex);
      el?.classList.remove('correct', 'incorrect');
      updateCaret();
    }
  });
}

window.onkeydown = function(e) {
  if(e.keyCode == 32 && e.target == document.body) {
      e.preventDefault();
      return false;
  }
};