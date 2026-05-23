import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => null);
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  expect(div.textContent).toContain('random asian dude 3000');
  expect(div.textContent).toContain('Buiilding');
  ReactDOM.unmountComponentAtNode(div);
});
