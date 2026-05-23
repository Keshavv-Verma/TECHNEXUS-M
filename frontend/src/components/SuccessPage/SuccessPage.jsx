import React from 'react'
import './Successpage.css'
import {MdOutlineDone} from "react-icons/md";
import { useNavigate, useLocation } from 'react-router-dom';

const SuccessPage = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const paymentState = location.state || {};
   
  return (
    <div className='successpage-container'>
      <div className="success-content">
        <div className="success-icon">
            <MdOutlineDone/>
        </div>
        <h1>PAYMENT SUCCESSFUL ✓</h1>
        <p>Thank you for your purchase!<br/>Your order has been confirmed.</p>
        
        {paymentState.paymentId && (
          <div className="payment-details" style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            textAlign: 'left',
            color: '#1f2937'
          }}>
            <p><strong>Payment ID:</strong> {paymentState.paymentId}</p>
            <p><strong>Order ID:</strong> {paymentState.orderId}</p>
            <p><strong>Amount Paid:</strong> ₹{paymentState.amount?.toLocaleString('en-IN') || '0'}</p>
            {paymentState.productName && (
              <p><strong>Product:</strong> {paymentState.productName}</p>
            )}
          </div>
        )}
        
        <div>
            <button onClick={() => {navigate("/");}} className='get-home'>Get Back To Our Home Page</button>
        </div>
      </div>
    </div>
  )
}

export default SuccessPage
