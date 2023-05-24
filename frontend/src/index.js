import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import Controller from './Controller';
import Admin from './Admin';

const rootElement = document.getElementById('root');

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route exact path="/" element={<Controller />} />
      <Route exact path="/admin" element={<Admin />} />
    </Routes>
  </BrowserRouter>,
  rootElement
);