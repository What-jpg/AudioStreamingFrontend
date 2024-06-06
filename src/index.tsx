import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.scss';
import './css/main.scss';
import './css/style.scss';

const container = document.getElementById('root')!;
const root = createRoot(container);

const envVarsNames = ["REACT_APP_SERVER_URL"];

envVarsNames.forEach(name => {
  let foundVar = false;

  for (const key in process.env) {
    if (name == key) {
      foundVar = true;
    }
  }
  
  if (!foundVar) {
    console.error(`Missing enviromental variabale ${name}`)
  }
});

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
