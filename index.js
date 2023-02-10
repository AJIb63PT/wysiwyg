let modeButtons = document.getElementsByClassName('mode');
let text = document.getElementById('text');
const backUpsButton = document.querySelector('.js-back-up');
const forceUpsButton = document.querySelector('.js-force-up');
const imgButton = document.querySelector('.js-img');

const subToolBar = document.querySelector('.js-sub-toolbar');
const inputSrc = document.querySelector('.js-input');
const doneButton = document.querySelector('.js-done');
const copyButton = document.querySelector('.js-copy');

let currentState = 0;
let backUps = [];
let modeClass = '';
let selRange = null;

inputSrc.addEventListener('change', () => {
  if (inputSrc.value.includes('http')) {
    doneButton.removeAttribute('disabled');
  }
});
copyButton.addEventListener('click', () => {
  copyToClipboard();
});

imgButton.addEventListener('click', (e) => {
  subToolBar.style.display = 'flex';
  imgButton.classList.add('active');
  setTimeout(() => {
    subToolBar.style.opacity = 1;
  }, 250);
});

doneButton.addEventListener('click', () => {
  insertImage();
  pushBackUps();
  subToolBar.style.opacity = 0;
  imgButton.classList.remove('active');

  setTimeout(() => {
    subToolBar.style.display = 'none';
  }, 250);
});

function insertImage() {
  let image = document.createElement('img');
  image.src = `${inputSrc.value}`;
  selection = window.getSelection();
  if (
    selection.rangeCount === 0 ||
    !text.contains(selection.getRangeAt(0).commonAncestorContainer)
  ) {
    text.appendChild(image);
  } else {
    let range = selection.getRangeAt(0);
    range.collapse(false);
    range.insertNode(image);

    selection.removeAllRanges();
    range.setStartAfter(image);
    selection.addRange(range);
  }
}

backUpsButton.addEventListener('click', () => {
  if (currentState > 0) {
    text.innerHTML = backUps[currentState - 1];
  } else {
    text.innerHTML = '';
  }
  currentState--;

  buttonsDisableCheker();
});

forceUpsButton.addEventListener('click', () => {
  if (currentState > 0) {
    text.innerHTML = backUps[currentState];
  } else {
    text.innerHTML = backUps[0];
  }
  currentState++;
  buttonsDisableCheker();
});

text.onpaste = (e) => {
  let cbPayload = [...(e.clipboardData || e.originalEvent.clipboardData).items];
  cbPayload = cbPayload.filter((i) => /image/.test(i.type));

  if (!cbPayload.length || cbPayload.length === 0) return false;

  let reader = new FileReader();

  reader.onload = (e) => {
    let img = document.createElement('img');

    img.setAttribute('src', `${e.target.result}`);
    img.setAttribute('style', 'width:400px; height: 300px;');

    e.target.append(img);
  };
  reader.readAsDataURL(cbPayload[0].getAsFile());
};

[...modeButtons].forEach((b) => {
  b.addEventListener('click', (e) => {
    b.classList.toggle('active');
    modeClass = [...modeButtons]
      .map((b) =>
        b.classList.contains('active') ? b.getAttribute('data-font') : ''
      )
      .join(' ');
    if (selRange) {
      if (selRange.commonAncestorContainer == text) {
        let spans = [...text.getElementsByTagName('span')];
        let start = spans.indexOf(selRange.startContainer.parentElement);
        let end = spans.indexOf(selRange.endContainer.parentElement);
        for (let i = start; i <= end; i++) {
          if (b.classList.contains('active')) {
            spans[i].classList = b.getAttribute('data-font');
          } else {
            spans[i].classList.remove(b.getAttribute('data-font'));
          }
        }
        pushBackUps();
      }
    }
  });
});

text.onkeypress = (e) => {
  if (/[a-zA-Z0-9,.А-ЯЁа-яё]/u.test(e.key.toString()) && e.key != 'Enter') {
    e.preventDefault();

    let span = document.createElement('span');
    span.textContent = e.key;
    span.className = modeClass;
    e.target.append(span);

    let sel = window.getSelection();
    sel.collapse(span, 1);

    pushBackUps();
  }
};

text.onmouseup = (e) => {
  let sel = window.getSelection();
  if (sel.type == 'Range') {
    selRange = sel.getRangeAt(0);
    [...modeButtons].forEach((b) => {
      b.classList.remove('active');
    });
    modeClass = '';
  } else {
    selRange = null;
  }
};

function buttonsDisableCheker() {
  if (currentState > 0) {
    backUpsButton.removeAttribute('disabled');
  }

  if (currentState === -1) {
    backUpsButton.setAttribute('disabled', true);
  }
  if (currentState < backUps.length) {
    forceUpsButton.removeAttribute('disabled');
  } else {
    forceUpsButton.setAttribute('disabled', true);
  }
}

function pushBackUps() {
  backUps.push(text.innerHTML);
  currentState++;
  buttonsDisableCheker();
}

function copyToClipboard() {
  window.prompt('Copy to clipboard: Ctrl+C, Enter', text.innerHTML);
}
