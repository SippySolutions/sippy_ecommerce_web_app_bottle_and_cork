import React from 'react';
import bottleIcon from '../../assets/bottle-icon.png'; // Adjust path as needed

const BottleIconImage = ({ 
  size = 24, 
  className = '',
  alt = 'Bottle Icon',
  ...props 
}) => {
  return (
    <img
      src={bottleIcon}
      alt={alt}
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
};

export default BottleIconImage;
