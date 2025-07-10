import { useState, useEffect } from 'react';

// const [countDown, isCompleted] = useCountdownTimer(startTime, onComplete);

interface UseCountdownTimerReturn
  extends Array<
    string | React.Dispatch<React.SetStateAction<number>> | boolean
  > {
  0: string;
  1: React.Dispatch<React.SetStateAction<number>>;
  2: boolean;
  state: string;
  open: boolean;
}

type UseCountdownTimer = (
  startTime: number,
  onComplete?: () => void
) => UseCountdownTimerReturn;

const useCountdownTimer: UseCountdownTimer = (startTime, onComplete) => {
  const [timeLeft, setTimeLeft] = useState<number>(startTime);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!isCompleted) {
        setIsCompleted(true); // Mark the timer as completed
        if (onComplete) {
          onComplete(); // Trigger the completion callback
        }
      }
      return; // Stop the timer if time is up
    }
    setIsCompleted(false); // Reset completed state if time is still left

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, [timeLeft, onComplete, isCompleted]);

  // Return formatted time as double digits and completion status

  const formattedTime: string = String(timeLeft).padStart(2, '0');

  const hookData = [
    formattedTime,
    setTimeLeft,
    isCompleted,
  ] as UseCountdownTimerReturn;
  hookData.state = formattedTime;
  hookData.open = isCompleted;
  return hookData;
};

export default useCountdownTimer;
