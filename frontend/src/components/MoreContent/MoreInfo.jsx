import React from 'react';
import './MoreInfo.css';

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
  ];

  return (
    <div className="more-info-canvas">
      <div className="more-info-layout">
        <div className="more-info-left">
          <h2 className="more-info-title">
            <span>TechNexus Integrity</span>
            Why Tech Nexus is Better
          </h2>
          {infoItems.map((item, index) => (
            <div key={index} className="more-info-card">
              <span className="more-info-icon-wrapper">
                {item.icon}
              </span>
              <div>
                <h3 className="more-info-card-title">{item.title}</h3>
                <p className="more-info-card-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="more-info-right">
          <div className="more-info-monolith">
            <span>🖥️</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreInfo;