import React from 'react';

const BottleIcon = ({ 
  size = 24, 
  color = '#B91C1C', 
  className = '',
  ...props 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M35 20 L35 10 L45 10 L45 32 L50 37 L50 90 L20 90 L20 37 Z"
        fill={color}
      />
      <path
        d="M45 37 L45 45 L55 45 L55 90 L75 90 L75 70 L70 70 L70 60 L75 60 L75 45 L55 45 L55 37 Z"
        fill={color}
      />
      <path
        d="M30 45 L40 45 L40 80 L30 80 Z"
        fill="white"
      />
    </svg>
  );
};

export default BottleIcon;
