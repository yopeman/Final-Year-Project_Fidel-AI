import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestVerification = () => {
  const navigate = useNavigate();

  const testVerification = () => {
    // Test the verification page with a sample email
    navigate('/verify', {
      state: {
        email: 'test@example.com',
        message: 'Test verification page'
      }
    });
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Test Verification Page</h2>
      <p>Click the button below to test the verification page:</p>
      <button 
        onClick={testVerification}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Verification Page
      </button>
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        This will navigate to /verify with test@example.com as the email
      </div>
    </div>
  );
};

export default TestVerification;