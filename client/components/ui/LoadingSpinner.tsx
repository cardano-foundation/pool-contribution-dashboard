/**
 * @file Used to indicate that something is loading
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

import React from 'react';
import Image from 'next/image';
import styles from './LoadingSpinner.module.css';

/**
 * Props for the LoadingSpinner component.
 * @interface LoadingSpinnerProps
 * @property {number} [bigCircleDiameter=100] - The diameter of the larger, static circle in pixels.
 * @property {number} [smallCircleDiameter=90] - The diameter of the smaller, orbiting circle in pixels.
 * @property {number} [animationDuration=4] - The duration of one full animation cycle in seconds.
 */
interface LoadingSpinnerProps {
  bigCircleDiameter?: number;
  smallCircleDiameter?: number;
  animationDuration?: number;
}

/**
 * A loading spinner component featuring a smaller circle moving infront of a larger static circle.
 * The animation speed and circle sizes are customizable via props.
 *
 * @param {LoadingSpinnerProps} { bigCircleDiameter, smallCircleDiameter, animationDuration } - Props for the component.
 * @returns {JSX.Element} A React component displaying an animated loading spinner.
 */
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