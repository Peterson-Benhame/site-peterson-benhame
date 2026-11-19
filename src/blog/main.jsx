import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import BlogPage from './BlogPage.jsx';

const page = JSON.parse(document.getElementById('page-data').textContent);
hydrateRoot(document.getElementById('root'), <React.StrictMode><BlogPage page={page} /></React.StrictMode>);
