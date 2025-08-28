import { Box, Container, Grid, Image, Stack, Text } from '@mantine/core';
import { Button, Card, Form, Input, Modal } from '../../components';
import ConnectAccountDescription from './ConnectAccountDescription';
import AccountTypeSelector from '../../layouts/dashboard-layout/navbar/AccountTypeSelector';
import type React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import GoogleDriveIcon from '../../assets/svgs/GoogleDrive.svg';
import DropboxIcon from '../../assets/svgs/Dropbox.svg';
import OneDriveIcon from '../../assets/svgs/OneDrive.svg';

interface NoConnectedAccountProps {
  openAccountModal: () => void;
  isConnectModalOpen: boolean;
  closeAccountModal: () => void;
  handleConnectAccount: (e?: React.BaseSyntheticEvent) => Promise<void>;
  methods: UseFormReturn<
    {
      accountName: string;
      accountType: 'google_drive' | 'dropbox' | 'onedrive';
    },
    any,
    {
      accountName: string;
      accountType: 'google_drive' | 'dropbox' | 'onedrive';
    }
  >;
  connectAccountFormData: {
    id: string;
    name: string;
    placeholder: string;
    type: string;
    label: string;
    isRequired: boolean;
    error: string | undefined;
  }[];
  connectAccountLoading: boolean;
  isSm: boolean;
}

const providers = [
  {
    name: 'Google Drive',
    // icon: '📁',
    icon: <Image src={GoogleDriveIcon} alt="Google Drive" w={24} h={24} />,
    color: '#4285F4',
    description: 'Connect your Google Drive account',
  },
  {
    name: 'Dropbox',
    // icon: '📦',
    icon: <Image src={DropboxIcon} alt="Dropbox" w={26} />,
    color: '#0061FF',
    description: 'Connect your Dropbox account',
  },
  {
    name: 'OneDrive',
    // icon: '☁️',
    icon: <Image src={OneDriveIcon} alt="OneDrive" w={24} h={24} />,
    color: '#0078D4',
    description: 'Connect your OneDrive account',
  },
];

const NoConnectedAccount: React.FC<NoConnectedAccountProps> = ({
  openAccountModal = () => {},
  isConnectModalOpen = false,
  closeAccountModal = () => {},
  handleConnectAccount = () => {},
  methods,
  connectAccountFormData = [],
  connectAccountLoading = false,
  isSm = false,
}) => {
  const handleProviderClick = (
    providerType: 'google_drive' | 'dropbox' | 'onedrive'
  ) => {
    methods.setValue('accountType', providerType);
    openAccountModal();
  };

  return (
    <>
      <style>{`
        @keyframes floatAnimation {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(2deg); }
          50% { transform: translateY(-5px) rotate(-1deg); }
          75% { transform: translateY(-8px) rotate(1deg); }
        }

        @keyframes sparkleAnimation {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(79, 172, 254, 0.3); }
          50% { box-shadow: 0 0 40px rgba(79, 172, 254, 0.6); }
        }

        @keyframes cardHover {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-5px) scale(1.02); }
        }

        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }

        .container {
          // min-height: 100vh;
          // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          // align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .background-shapes {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 1;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          animation: floatAnimation 6s ease-in-out infinite;
        }

        .shape-1 {
          width: 200px;
          height: 200px;
          background: #FFD93D;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 150px;
          height: 150px;
          background: #FF6B6B;
          top: 20%;
          right: 15%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 120px;
          height: 120px;
          background: #4ECDC4;
          bottom: 15%;
          left: 20%;
          animation-delay: 4s;
        }

        .shape-4 {
          width: 180px;
          height: 180px;
          background: #45B7D1;
          bottom: 10%;
          right: 10%;
          animation-delay: 1s;
        }

        .content-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 900px;
          animation: bounceIn 1s ease-out;
        }

        .celebration-icon {
          font-size: 50px;
          margin-bottom: 2rem;
          position: relative;
          display: inline-block;
        }

        .sparkle {
          position: absolute;
          font-size: 20px;
          animation: sparkleAnimation 2s ease-in-out infinite;
        }

        .sparkle-1 {
          top: -10px;
          left: -15px;
          animation-delay: 0s;
        }

        .sparkle-2 {
          top: -5px;
          right: -20px;
          animation-delay: 0.5s;
        }

        .sparkle-3 {
          bottom: -10px;
          left: 10px;
          animation-delay: 1s;
        }

        .sparkle-4 {
          bottom: 5px;
          right: 5px;
          animation-delay: 1.5s;
        }

        .main-title {
          font-size: 2.5rem;
          font-weight: 700;
          // color: white;
          text-align: center;
          margin-bottom: 1rem;
          text-shadow: 0 4px 8px rgba(0,0,0,0.3);
          line-height: 1.1;
        }

        .subtitle {
          font-size: 1.125rem;
          // color: rgba(255,255,255,0.9);
          text-align: center;
          margin-bottom: 3rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .connect-button {
          // background: linear-gradient(45deg, #667eea 0%, #764ba2 100%) !important;
          border: none !important;
          // border-radius: 50px !important;
          // padding: 16px 48px !important;
          font-size: 1.125rem !important;s
          font-weight: 600 !important;
          color: white !important;
          text-transform: none !important;
          animation: pulseGlow 3s ease-in-out infinite;
          transition: all 0.3s ease !important;
          // margin-bottom: 3rem;
          margin-top: -2rem;
        }

        .connect-button:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(0,0,0,0.2) !important;
        }

        .providers-grid {
          margin-bottom: 2rem;
        }

        .provider-card {
          background: rgba(255,255,255,0.95) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2) !important;
          border-radius: 20px !important;
          padding: 2rem !important;
          text-align: center;
          min-width: 190px;
          // cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          // height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .provider-card:hover {
          animation: cardHover 0.3s ease forwards;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
          background: rgba(255,255,255,1) !important;
        }

        .provider-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          transition: transform 0.3s ease;
        }

        .provider-card:hover .provider-icon {
          transform: scale(1.1);
        }

        .provider-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
        }

        .support-text {
          color: rgba(255,255,255,0.8);
          font-size: 1rem;
          text-align: center;
          text-decoration: underline;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .support-text:hover {
          color: white;
        }

        .modal-content {
          padding: 2rem;
        }

        .check-icon {
          font-size: 3.75rem;
          color: #22c55e;
          background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
          border-radius: 50%;
          padding: 1.25rem;
          margin-bottom: 2rem;
          animation: sparkleAnimation 2s ease-in-out infinite;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
        }

        /* Responsive styles */

        @media (min-width: 1900px) {
         .container {
          //  min-height: 100vh;
           align-items: center;
         }
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 2.25rem;
          }
          
          .subtitle {
            font-size: 1rem;
          }
          
          .connect-button {
            padding: 14px 32px !important;
            font-size: 1rem !important;
          }
          
          .shape-1, .shape-2, .shape-3, .shape-4 {
            width: 100px !important;
            height: 100px !important;
          }
        }

        @media (max-width: 480px) {
          .main-title {
            font-size: 1.75rem;
          }
          
          .provider-card {
            height: 140px;
            padding: 1.5rem !important;
          }
          
          .provider-icon {
            font-size: 2.5rem;
          }
          
          .container {
            padding: 0.5rem;
          }
        }
      `}</style>

      <Box className="container">
        {/* Animated Background Shapes */}
        <div className="background-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
          <div className="shape shape-4" />
        </div>

        <Container className="content-wrapper">
          <Stack align="center" gap="xl">
            {/* Celebration Animation */}
            <Box className="celebration-icon">
              🎉
              <span className="sparkle sparkle-1">✨</span>
              <span className="sparkle sparkle-2">⭐</span>
              <span className="sparkle sparkle-3">💫</span>
              <span className="sparkle sparkle-4">🌟</span>
            </Box>

            {/* Main Title */}
            <Text className="main-title">
              You’re all set!
              <br />
              Let’s connect your first cloud account
            </Text>

            {/* Subtitle */}
            <Text className="subtitle">
              {/* Now connect your account to get started. */}
              Unlock unified storage by linking Google Drive, Dropbox, or
              OneDrive.
            </Text>

            {/* Connect Button */}
            <Button
              className="connect-button"
              size={isSm ? 'md' : 'lg'}
              radius="sm"
              onClick={openAccountModal}
            >
              Connect Your Account
            </Button>

            {/* Cloud Providers Grid */}
            <Grid className="providers-grid" gutter="xl">
              {providers.map((provider, index) => (
                <Grid.Col key={provider.name} span={{ xs: 12, md: 4 }}>
                  <Card
                    className="provider-card"
                    style={{
                      animationDelay: `${index * 0.2}s`,
                      cursor: 'pointer',
                    }}
                    onClick={() =>
                      handleProviderClick(
                        provider.name === 'Google Drive'
                          ? 'google_drive'
                          : provider.name === 'Dropbox'
                            ? 'dropbox'
                            : 'onedrive'
                      )
                    }
                  >
                    <div className="provider-icon">{provider.icon}</div>
                    <Text className="provider-name">{provider.name}</Text>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>

            {/* Support Link */}
            <Text className="support-text">Need help? Contact support.</Text>
          </Stack>
        </Container>

        {/* Connection Modal */}
        <Modal
          opened={isConnectModalOpen}
          onClose={closeAccountModal}
          title="Connect Cloud Account"
        >
          <Form onSubmit={handleConnectAccount} methods={methods}>
            <Stack>
              <ConnectAccountDescription />
              {connectAccountFormData?.map(
                ({ id, name, placeholder, type, label, error, isRequired }) => (
                  <Input
                    key={id}
                    name={name}
                    label={label}
                    placeholder={placeholder}
                    type={type}
                    error={error}
                    radius="md"
                    withAsterisk={isRequired}
                  />
                )
              )}

              <AccountTypeSelector
                value={methods.watch('accountType')}
                onChange={val =>
                  methods.setValue(
                    'accountType',
                    val as 'google_drive' | 'dropbox' | 'onedrive',
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
                error={methods.formState.errors.accountType?.message}
              />

              <Button
                type="submit"
                maw="fit-content"
                loading={Boolean(connectAccountLoading)}
                disabled={Boolean(connectAccountLoading)}
                radius="md"
                style={{
                  fontWeight: 500,
                  fontSize: 16,
                  // background: '#0284c7',
                  background: 'var(--mantine-primary-color-6)',
                  color: '#fff',
                  marginTop: 8,
                }}
              >
                Connect Account
              </Button>
            </Stack>
          </Form>
        </Modal>
      </Box>
    </>
  );
};

export default NoConnectedAccount;
