import { createGlobalStyle } from 'styled-components';

export const lightTheme = {
  body: '#FFF',
  text: '#000',
  buttonBg: '#4CAF50',
  buttonText: '#FFF',
  sidebarBg: '#f0f0f0',
};

export const darkTheme = {
  body: '#333',
  text: '#FFF',
  buttonBg: '#555',
  buttonText: '#FFF',
  sidebarBg: '#444',
};

export const GlobalStyles = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    font-family: 'Arial', sans-serif;
  }
`;
