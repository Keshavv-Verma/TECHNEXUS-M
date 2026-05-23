import React from 'react'

const MoreInfo = () => {
  const infoItems = [
    {
      icon: '🚀',
      title: 'CUTTING-EDGE TECHNOLOGY',
      description: 'We offer the latest and most advanced electronic devices, always staying ahead of the curve in technological innovation.'
    },
    {
      icon: '🔒',
      title: 'SECURE SHOPPING',
      description: 'Our platform ensures your data is protected with state-of-the-art encryption and security measures for worry-free online shopping.'
    },
    {
      icon: '🌟',
      title: 'EXPERT SUPPORT',
      description: 'Our team of tech experts is always ready to assist you with any questions or issues, ensuring you make informed decisions.'
    }
  ]

  return (
    <div style={{
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
    
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '40px'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '30px'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            color: '#333',
            marginBottom: '20px',
            textAlign: 'center',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            WHY TECH NEXUS IS BETTER
          </h2>
          {infoItems.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '20px',
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '10px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
            >
              <span style={{
                fontSize: '2rem',
                backgroundColor: '#007bff',
                color: 'white',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(360deg)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
              >
                {item.icon}
              </span>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  color: '#333',
                  marginBottom: '10px'
                }}>{item.title}</h3>
                <p style={{
                  fontSize: '1rem',
                  color: '#666',
                  lineHeight: '1.5'
                }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '400px',
            height: '400px',
            backgroundColor: '#007bff',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05) rotate(5deg)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <span style={{
              fontSize: '8rem',
              color: 'white'
            }}>🖥️</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MoreInfo