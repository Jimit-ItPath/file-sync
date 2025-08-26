import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEY } from '../utils/constants';
import storage from 'redux-persist/lib/storage';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';
import authReducer from './slices/auth.slice';
import googleDriveReducer from './slices/google-drive.slice';
import dropboxReducer from './slices/dropbox.slice';
import oneDriveReducer from './slices/onedrive.slice';
import userReducer from './slices/user.slice';
import cloudStorageReducer from './slices/cloudStorage.slice';
import adminUserReducer from './slices/adminUser.slice';

const persistConfig = {
  key: LOCAL_STORAGE_KEY,
  storage,
  whitelist: ['auth', 'user'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  googleDrive: googleDriveReducer,
  dropbox: dropboxReducer,
  oneDrive: oneDriveReducer,
  user: userReducer,
  cloudStorage: cloudStorageReducer,
  adminUser: adminUserReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: true, // Enable immutability checks in development
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.MODE === 'development',
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
