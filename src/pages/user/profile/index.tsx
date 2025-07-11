import {
  Grid,
  Stack,
  Title,
  Text,
  Box,
  Avatar,
  Group,
  FileButton,
  Container,
  Tooltip,
  Card,
  ActionIcon,
} from '@mantine/core';
import { Button, Form, Input, Modal } from '../../../components';
import useProfile from './use-profile';
import { ICONS } from '../../../assets/icons';
import { useState } from 'react';
import { LoaderOverlay } from '../../../components/loader';

const Profile = () => {
  const {
    methods,
    handleProfileSubmit,
    isLoading,
    profileFormData,
    submitLoading,
    handleAvatarChange,
    preview,
    removeAccess,
    removeAccessLoading,
    removeProfilePic,
    removeProfileImageLoading,
    closeRemoveProfilePicModal,
    openRemoveProfilePicModal,
    openRemoveProfileImageModal,
  } = useProfile();
  const {
    formState: { errors },
  } = methods;
  const [isHovering, setIsHovering] = useState(false);

  if (isLoading || removeAccessLoading) {
    return <LoaderOverlay visible={isLoading} opacity={1} />;
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Profile Card */}
        <Card radius="lg" p="xl" shadow="sm" withBorder>
          <Form methods={methods} onSubmit={handleProfileSubmit}>
            <Stack gap="xl">
              <Box>
                <Title order={2} mb={4} fw={600}>
                  Profile Settings
                </Title>
                <Text c="dimmed" size="md">
                  Manage your personal information
                </Text>
              </Box>

              <Group align="flex-start" gap="xl">
                <Box
                  pos="relative"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <Avatar
                    size={120}
                    radius={120}
                    src={
                      preview
                        ? preview?.includes('data:image/')
                          ? preview
                          : `${import.meta.env.VITE_REACT_APP_BASE_URL}/user-profile/${preview}`
                        : null
                    }
                    style={theme => ({
                      border: `2px solid ${theme.colors.blue[3]}`,
                      boxShadow: theme.shadows.sm,
                      transition: 'all 0.2s ease',
                    })}
                  >
                    <ICONS.IconUser size={60} />
                  </Avatar>
                  {preview && isHovering && (
                    <Tooltip label="Remove avatar" position="bottom" withArrow>
                      <ActionIcon
                        variant="filled"
                        color="red"
                        size="lg"
                        radius="xl"
                        onClick={openRemoveProfilePicModal}
                        pos="absolute"
                        bottom={0}
                        right={0}
                        style={{
                          // transform: 'translate(50%, -50%)',
                          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <ICONS.IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Box>

                <Stack gap="xs">
                  <FileButton
                    onChange={handleAvatarChange}
                    accept="image/png,image/jpeg,image/webp"
                    multiple={false}
                  >
                    {props => (
                      <Button
                        {...props}
                        variant="light"
                        color="blue"
                        leftSection={
                          !preview ? <ICONS.IconUpload size={16} /> : null
                        }
                        size="md"
                        radius="md"
                        w={200}
                      >
                        Change Avatar
                      </Button>
                    )}
                  </FileButton>
                  <Text c="dimmed" size="sm">
                    JPG, PNG or WEBP (Max 5MB)
                  </Text>
                </Stack>
              </Group>

              <Grid gutter="xl">
                {profileFormData.map(
                  ({
                    id,
                    label,
                    placeholder,
                    type,
                    error,
                    name,
                    isRequired,
                    ...props
                  }) => (
                    <Grid.Col key={id} span={{ base: 12, sm: 6 }}>
                      <Input
                        name={name}
                        label={label}
                        placeholder={placeholder}
                        type={type}
                        error={
                          errors[name as keyof typeof errors]?.message || error
                        }
                        radius="md"
                        size="md"
                        withAsterisk={isRequired}
                        {...props}
                      />
                    </Grid.Col>
                  )
                )}
              </Grid>

              <Group mt="md">
                <Button
                  type="submit"
                  loading={submitLoading}
                  size="md"
                  radius="md"
                >
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </Form>
        </Card>

        {/* Cloud Storage Access Card */}
        <Card radius="lg" shadow="sm" withBorder>
          <Stack gap="sm">
            <Title order={4} fw={600}>
              Connected Services
            </Title>
            <Text c="dimmed" size="sm" mb="sm">
              Manage your cloud storage integrations
            </Text>

            <Group gap="sm">
              <Button
                variant="outline"
                color="red"
                onClick={() => removeAccess({ type: 'drive' })}
                leftSection={<ICONS.IconBrandGoogle size={16} />}
                radius="md"
                disabled={removeAccessLoading}
              >
                Remove Google Drive
              </Button>

              <Button
                variant="outline"
                color="blue"
                onClick={() => removeAccess({ type: 'dropbox' })}
                leftSection={<ICONS.IconDroplets size={16} />}
                radius="md"
                disabled={removeAccessLoading}
              >
                Remove Dropbox
              </Button>

              <Button
                variant="outline"
                color="indigo"
                onClick={() => removeAccess({ type: 'onedrive' })}
                leftSection={<ICONS.IconBrandOnedrive size={16} />}
                radius="md"
                disabled={removeAccessLoading}
              >
                Remove OneDrive
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>

      <Modal
        opened={openRemoveProfileImageModal}
        onClose={closeRemoveProfilePicModal}
        closeOnClickOutside={true}
        closeOnEscape={true}
        title="Remove Profile Picture"
        size="md"
      >
        <Text>Are you sure you want to remove your profile picture?</Text>
        <Group ta="right" mt={20}>
          <Button
            variant="outline"
            // color="red"
            onClick={closeRemoveProfilePicModal}
            radius="md"
            disabled={removeProfileImageLoading}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            color="red"
            onClick={removeProfilePic}
            radius="md"
            disabled={removeProfileImageLoading}
            loading={removeProfileImageLoading}
          >
            Remove
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default Profile;
