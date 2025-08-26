import useCompleteProfile from './use-complete-profile';
import { Box, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { ICONS } from '../../../../assets/icons';
import { Button, Form, Input } from '../../../../components';
import { AUTH_ROUTES } from '../../../../routing/routes';
import { FeatureList } from '../../register/FeatureList';

const CompleteProfile = () => {
  const {
    completeProfileFormData,
    handleCompleteProfileSubmit,
    isLoading,
    methods,
    isMd,
    isSm,
    isXs,
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
          All Cloud Hub
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
                      size={isXs ? 'sm' : 'md'}
                      radius="md"
                      style={{
                        fontWeight: 500,
                        fontSize: isXs ? 14 : 16,
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
          <FeatureList {...{ isMd, isXs }} />
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default CompleteProfile;
