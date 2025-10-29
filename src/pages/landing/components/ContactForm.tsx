import useResponsive from '../../../hooks/use-responsive';
import { useNavigate } from 'react-router';
import { useDisclosure } from '@mantine/hooks';
import { AppShell, Container, Stack, Text, Title } from '@mantine/core';
import LandingHeader from '../LandingHeader';
import AnimatedSection from './AnimatedSection';
import LandingFooter from '../LandingFooter';
import useContact from './use-contact';
import { Button, Form, Input } from '../../../components';
import { useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const ContactForm = () => {
  const { isMd, isSm, isXs } = useResponsive();
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const {
    contactFormData,
    handleContactSubmit,
    methods,
    onCaptchaChange,
    recaptchaRef,
  } = useContact();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: 'md',
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding="md"
    >
      <LandingHeader {...{ opened, open, close, navigate }} />

      <AppShell.Main pt={70} px={0} pb={0}>
        <Container size="sm" py={isSm ? 40 : 80}>
          <AnimatedSection>
            <Form methods={methods} onSubmit={handleContactSubmit}>
              <Stack gap={isXs ? 10 : 20}>
                <Title order={isXs ? 3 : 2} ta="center">
                  Contact Us
                </Title>
                <Text c="dimmed" ta="center" mb="md">
                  Have questions or feedback? Fill out the form below and we’ll
                  get back to you.
                </Text>

                {contactFormData.map(
                  ({ id, label, placeholder, type, name, isRequired }) => (
                    <Input
                      key={id}
                      name={name}
                      label={label}
                      placeholder={placeholder}
                      type={type === 'textarea' ? 'textarea' : type}
                      radius="md"
                      size="md"
                      withAsterisk={isRequired}
                    />
                  )
                )}

                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={
                    import.meta.env.VITE_REACT_APP_CAPTCHA_SITE_KEY || ''
                  }
                  onChange={onCaptchaChange}
                />

                <Button
                  type="submit"
                  disabled={!methods.formState.isValid}
                  size={isXs ? 'sm' : 'md'}
                  radius="md"
                  mt={isXs ? 10 : 0}
                  style={{
                    fontWeight: 500,
                    fontSize: isXs ? 14 : 16,
                    background: '#0284c7',
                    color: '#fff',
                  }}
                >
                  Submit
                </Button>
              </Stack>
            </Form>
          </AnimatedSection>
        </Container>

        <LandingFooter {...{ isMd, isSm, navigate }} />
      </AppShell.Main>
    </AppShell>
  );
};

export default ContactForm;
