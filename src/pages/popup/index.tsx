import Popup from '@pages/popup/Popup';
import { createRoot } from 'react-dom/client';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';

refreshOnUpdate('pages/popup');

function init() {
  const root = createRoot(document.getElementById('root')!);

  root.render(<Popup />);
}

try {
  init();
} catch (error) {
  console.error(error);
}
