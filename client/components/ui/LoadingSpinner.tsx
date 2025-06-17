import React from 'react';
import Image from 'next/image';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  bigCircleDiameter?: number;
  smallCircleDiameter?: number;
  animationDuration?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  bigCircleDiameter = 100,
  smallCircleDiameter = 90,
  animationDuration = 4,
}) => {
  const spinnerContainerStyle = {
    '--animation-duration': `${animationDuration}s`,
  } as React.CSSProperties;

  return (
    <div className={styles['loading-spinner-container']} style={spinnerContainerStyle}>
      <Image
        src="/loading/Ellipse2.svg"
        alt="Large static circle"
        width={bigCircleDiameter}
        height={bigCircleDiameter}
        className={styles['static-big-circle']}
        priority
      />

      <Image
        src="/loading/Ellipse1.svg"
        alt="Small orbiting circle"
        width={smallCircleDiameter}
        height={smallCircleDiameter}
        className={styles['animated-small-circle']}
        style={{
          animationName: styles.orbitSmallCircle,
          animationDuration: 'var(--animation-duration)',
          animationIterationCount: 'infinite',
        }}
        priority
      />
    </div>
  );
};

export default LoadingSpinner;