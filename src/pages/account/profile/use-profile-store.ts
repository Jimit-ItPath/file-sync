import { create } from 'zustand';
import { api } from '../../../api';
import axios from 'axios';

interface ProfileStore {
  data: any;
  loading: boolean;
  getData?: any;
  reset?: () => void;
}

const initialState: ProfileStore = {
  data: null,
  loading: false,
};

const useProfileStore = create<ProfileStore>(set => ({
  data: null,
  loading: false,
  getData: async (params: { [key: string]: any; id: string }) => {
    set({ loading: true });
    try {
      const res = await api.user.get(params);
      set({ data: res?.data?.data, loading: false });
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        if (!axios.isCancel((err as any).message)) {
          return;
        }
      }
      set({ loading: false });
    }
  },
  reset: () => set(initialState),
}));

export default useProfileStore;
