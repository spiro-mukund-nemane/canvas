import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import  store  from './store/index';
import { router } from './router'
import { Toaster } from "@/components/ui/sonner"
import { RouterProvider } from '@tanstack/react-router';
import './main.css'



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router ={router} />
      <Toaster/>
    </Provider>
  </React.StrictMode>
);
