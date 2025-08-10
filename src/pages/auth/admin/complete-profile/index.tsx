import useCompleteProfile from './use-complete-profile';
import {
  Box,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { ICONS } from '../../../../assets/icons';
import { Button, Form, Input } from '../../../../components';
import { AUTH_ROUTES } from '../../../../routing/routes';

const CompleteProfile = () => {
  const {
    completeProfileFormData,
    handleCompleteProfileSubmit,
    isLoading,
    methods,
    isMd,
    isSm,
    isXs,
    features,
    navigate,
  } = useCompleteProfile();
  return (
    <Box>
      <Group
        align="center"
        style={{
          position: 'absolute',
          top: 24,
          left: 32,
          zIndex: 2,
          cursor: 'pointer',
        }}
        onClick={() => navigate(AUTH_ROUTES.LANDING.url)}
      >
        <ICONS.IconCloud size={32} color={'#0ea5e9'} />
        <Text
          fw={700}
          fz={20}
          style={{
            color: isXs || isSm || isMd ? '#0ea5e9' : '#000000',
            letterSpacing: -0.5,
          }}
        >
          AllCloudHub
        </Text>
      </Group>
      <Grid gutter={0}>
        <Grid.Col span={{ base: 12, md: 6 }} order={{ xs: 1, md: 2 }}>
          <Paper
            radius={0}
            h="100%"
            p={isXs ? 16 : isSm ? 24 : 32}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
            }}
          >
            <Box
              w="100%"
              maw={isXs ? 300 : 400}
              mx="auto"
              mt={isXs || isSm || isMd ? 50 : 0}
            >
              <Stack gap={isXs ? 16 : isSm ? 24 : 32}>
                <Box>
                  <Title
                    order={2}
                    ta="center"
                    fw={700}
                    mb={isXs ? 4 : 8}
                    fz={isXs ? 20 : isSm ? 24 : 32}
                  >
                    Complete your profile
                  </Title>
                  <Text ta="center" c="dimmed" fz={isXs ? 14 : 16}>
                    Get started with your cloud file management
                  </Text>
                </Box>
                <Form methods={methods} onSubmit={handleCompleteProfileSubmit}>
                  <Stack gap={16}>
                    {completeProfileFormData.map(
                      ({
                        id,
                        label,
                        placeholder,
                        type,
                        error,
                        name,
                        isRequired,
                        disabled,
                        strengthMeter,
                      }) => (
                        <Input
                          key={id}
                          name={name}
                          label={label}
                          placeholder={placeholder}
                          type={type}
                          error={error}
                          radius="md"
                          size="md"
                          withAsterisk={isRequired}
                          disabled={disabled}
                          strengthMeter={strengthMeter}
                          // autoComplete={type === 'password-input' ? 'new-password' : 'off'}
                        />
                      )
                    )}
                    <Button
                      type="submit"
                      fullWidth
                      loading={Boolean(isLoading)}
                      disabled={
                        Boolean(isLoading) || !methods.formState.isValid
                      }
                      size="md"
                      radius="md"
                      style={{
                        fontWeight: 500,
                        fontSize: 16,
                        background: '#0284c7',
                        color: '#fff',
                        marginTop: 8,
                      }}
                    >
                      Complete Profile
                    </Button>
                  </Stack>
                </Form>
              </Stack>
            </Box>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }} order={{ xs: 2, md: 1 }}>
          <Paper
            p={0}
            style={{
              background: 'linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRight: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: isMd ? '100%' : '100vh',
              position: 'relative',
            }}
          >
            <Box
              maw={600}
              mx="auto"
              p={{ base: 16, sm: 24, md: 32 }}
              pt={isMd ? 40 : 0}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: 0,
                zIndex: 2,
              }}
            >
              <Title
                order={1}
                mb={{ base: 16, sm: 20 }}
                fw={700}
                fz={{ base: 24, sm: 28, md: 32 }}
                // c="#fff"
              >
                All Your Cloud Files. One Smart Dashboard.
              </Title>
              <Text
                c={'dimmed'}
                mb={{ base: 24, sm: 32 }}
                fz={{ base: 14, sm: 16 }}
              >
                Connect your Google Drive, Dropbox, and OneDrive accounts.
                Manage, search, and smart-distribute files across
                platforms—securely.
              </Text>
              <Stack gap={isXs ? 16 : 24}>
                {features.map((feature, idx) => (
                  <Group key={idx} align="flex-start" gap={isXs ? 12 : 16}>
                    <ThemeIcon color="cyan" size={isXs ? 28 : 36} radius="md">
                      <feature.icon size={isXs ? 16 : 20} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={600} fz={{ base: 14, sm: 16 }} mb={2}>
                        {feature.title}
                      </Text>
                      <Text c="dimmed" fz="sm">
                        {feature.description}
                      </Text>
                    </Box>
                  </Group>
                ))}
              </Stack>
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default CompleteProfile;
