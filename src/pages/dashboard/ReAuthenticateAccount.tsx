import { Box, Container, Stack, Text } from '@mantine/core';
import { Button, Card } from '../../components';
import GoogleDriveIcon from '../../assets/svgs/GoogleDrive.svg';
import DropboxIcon from '../../assets/svgs/Dropbox.svg';
import OneDriveIcon from '../../assets/svgs/OneDrive.svg';
import { Image } from '@mantine/core';
import type { ConnectedAccountType } from '../../store/slices/auth.slice';

interface ReAuthenticateAccountProps {
  account: ConnectedAccountType;
  handleReAuthenticate: (account: any) => void;
}

const providers = {
  google_drive: {
    name: 'Google Drive',
    icon: <Image src={GoogleDriveIcon} alt="Google Drive" w={24} h={24} />,
    color: '#4285F4',
    type: 'google_drive',
  },
  dropbox: {
    name: 'Dropbox',
    icon: <Image src={DropboxIcon} alt="Dropbox" w={26} />,
    color: '#0061FF',
    type: 'dropbox',
  },
  onedrive: {
    name: 'OneDrive',
    icon: <Image src={OneDriveIcon} alt="OneDrive" w={24} h={24} />,
    color: '#0078D4',
    type: 'onedrive',
  },
};

const ReAuthenticateAccount: React.FC<ReAuthenticateAccountProps> = ({
  account,
  handleReAuthenticate,
}) => {
  const provider = providers[account.account_type];

  return (
    <>
      <style>{`
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .content-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 900px;
          animation: bounceIn 1s ease-out;
        }
        .title {
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 1rem;
        }
        .subtitle {
          font-size: 1.125rem;
          text-align: center;
          margin-bottom: 2rem;
          color: #6b7280;
        }
        .provider-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        .provider-card:hover {
          transform: translateY(-4px) scale(1.02);
        }
        .action-btn {
          margin-top: 2rem;
          font-size: 1rem;
          font-weight: 500;
        }
        .background-shapes {
          position: absolute;
          top: 0;
          left: 10%;
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

        @media (max-width: 768px) {
          .background-shapes {
            left: 0;
          }
          .shape-1, .shape-2, .shape-3, .shape-4 {
            width: 100px !important;
            height: 100px !important;
          }
        }
      `}</style>

      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
        }}
      >
        <div className="background-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
          <div className="shape shape-4" />
        </div>
        <Container className="content-wrapper">
          <Stack align="center" gap="xl">
            <Text className="title">Re-authentication Required</Text>
            <Text className="subtitle">
              To continue using <b>{account?.account_name}</b>, please
              re-authenticate
              <Text span>
                {account?.email ? (
                  <>
                    {' '}
                    for{' '}
                    <Text span fw={700}>
                      {account.email}
                    </Text>
                  </>
                ) : (
                  ' your'
                )}
              </Text>{' '}
              account.
            </Text>

            <Card className="provider-card">
              {provider?.icon}
              <Text mt="sm" fw={600}>
                {provider?.name}
              </Text>
              <Button
                className="action-btn"
                radius="md"
                color="blue"
                onClick={() => handleReAuthenticate(account)}
              >
                Re-authenticate Now
              </Button>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default ReAuthenticateAccount;
