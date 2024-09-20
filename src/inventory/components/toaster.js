import React from 'react';
import { Bounce, ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastComponent = () => {
  return <ToastContainer position="bottom-left"
  autoClose={3000}
  hideProgressBar={true}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="light" 
  
  />;
};

export const showSuccessToast = (message) => {
  toast.success(message);
};

export const showErrorToast = (message) => {
  toast.error(message);
};

export default ToastComponent;
