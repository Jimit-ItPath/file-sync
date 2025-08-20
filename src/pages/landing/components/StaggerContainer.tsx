import React from 'react';
import { useAnimateOnScroll } from './use-animate-on-scroll';

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
}

const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
}) => {
  const [ref, isVisible] = useAnimateOnScroll(0.1);

  return (
    <div ref={ref}>
      {React.Children.map(children, (child, index) => (
        <div
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: `all 0.6s ease-out ${index * staggerDelay}s`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default StaggerContainer;
