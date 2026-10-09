import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

export const KPICard = ({ title, value, prefix, suffix, icon: Icon, trend, subtitle }) => {
  return (
    <div 
      className="flat-card"
      style={{
        padding: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e5e4',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '130px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="editorial-sub" style={{ marginBottom: '8px' }}>
            {title}
          </div>
          <div 
            style={{ 
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '28px',
              fontWeight: 600,
              color: '#10100f',
              lineHeight: 1.1,
              letterSpacing: '-0.5px',
            }}
          >
            {prefix} {value} {suffix}
          </div>
        </div>
        {Icon && (
          <div 
            style={{ 
              width: 36, 
              height: 36, 
              borderRadius: '9999px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f4f4f3',
              color: '#10100f',
            }}
          >
            <Icon size={18} strokeWidth={1.75} />
          </div>
        )}
      </div>

      {(trend !== undefined || subtitle) && (
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f0f0ef', display: 'flex', alignItems: 'center' }}>
          {trend !== undefined && (
            <span style={{ fontSize: '12px', color: trend >= 0 ? '#1b4d2e' : '#991b1b', fontWeight: 600, marginRight: '8px' }}>
              {trend >= 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          {subtitle && (
            <span style={{ fontSize: '12px', color: '#70706f' }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default KPICard;
