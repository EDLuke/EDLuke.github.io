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
  expect(div.textContent).toContain('posts13');
  expect(div.textContent).toContain('following1993');
  expect(div.textContent).toMatch(/followers\d{1,3}(,\d{3}){3}/);
  expect(div.textContent).toContain('Star');
  expect(div.textContent).not.toContain('hiding in the build logs');
  expect(div.querySelector('.rad-follow-link').getAttribute('href')).toBe(
    'https://github.com/EDLuke/EDLuke.github.io',
  );
  expect(div.textContent).toContain('Lehigh University');
  ReactDOM.unmountComponentAtNode(div);
});
