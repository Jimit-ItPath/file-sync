import { useAnimateOnScroll } from './use-animate-on-scroll';

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
}) => {
  const [ref, isVisible] = useAnimateOnScroll(0.1);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
        transition: `all ${duration}s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
