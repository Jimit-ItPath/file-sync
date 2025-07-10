import { create } from 'zustand';

interface EmailVerificationState {
  startTime: number;
  restartTime: number;
  email: string;
}

interface EmailVerificationActions {
  setData: (newState: Partial<EmailVerificationState>) => void;
}

type EmailVerificationStore = EmailVerificationState & EmailVerificationActions;

const useEmailVerificationStore = create<EmailVerificationStore>(set => ({
  startTime: 60,
  restartTime: 60,
  email: '',
  setData: (newState: Partial<EmailVerificationState>) =>
    set(state => ({ ...state, ...newState })),
}));

export default useEmailVerificationStore;
