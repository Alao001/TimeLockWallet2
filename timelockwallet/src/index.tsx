import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { TimelockWallet } from './contracts/timelockwallet';
import artifact from '../artifacts/timelockwallet.json'
import { Scrypt, bsv } from 'scrypt-ts';


TimelockWallet.loadArtifact(artifact)


Scrypt.init({
  apiKey:process.env
  .REACT_APP_API_KEY || '',
  network :bsv.Networks.testnet
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
