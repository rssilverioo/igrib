import { useEffect, useState } from 'react';
import CountUp from 'react-countup';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
}

const AnimatedNumber = ({ 
  value, 
  prefix = '', 
  suffix = '', 
  duration = 2,
  decimals = 0 
}: AnimatedNumberProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!isVisible) {
    return <span>{prefix}{value.toFixed(decimals)}{suffix}</span>;
  }

  return (
    <CountUp
      start={0}
      end={value}
      duration={duration}
      separator="."
      decimal=","
      prefix={prefix}
      suffix={suffix}
      decimals={decimals}
    />
  );
};

export default AnimatedNumber;