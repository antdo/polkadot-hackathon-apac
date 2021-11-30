import select from 'select';

function createFakeElement(value) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  const fakeElement = document.createElement('textarea');
  // Prevent zooming on iOS
  fakeElement.style.fontSize = '12pt';
  // Reset box model
  fakeElement.style.border = '0';
  fakeElement.style.padding = '0';
  fakeElement.style.margin = '0';
  // Move element out of screen horizontally
  fakeElement.style.position = 'absolute';
  fakeElement.style[isRTL ? 'right' : 'left'] = '-9999px';
  // Move element to the same position vertically
  let yPosition = window.pageYOffset || document.documentElement.scrollTop;
  fakeElement.style.top = `${yPosition}px`;

  fakeElement.setAttribute('readonly', '');
  fakeElement.value = value;

  return fakeElement;
}

function command(type) {
  try {
    return document.execCommand(type);
  } catch (err) {
    return false;
  }
}

const copyToClipBoard = (target, options = { container: document.body }) => {
  let selectedText = '';
  if (typeof target === 'string') {
    const fakeElement = createFakeElement(target);
    options.container.appendChild(fakeElement);
    selectedText = select(fakeElement);
    command('copy');
    fakeElement.remove();
  } else {
    selectedText = select(target);
    command('copy');
  }
  return selectedText;
};

export default copyToClipBoard;
