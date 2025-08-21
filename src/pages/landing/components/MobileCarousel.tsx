import { Carousel } from '@mantine/carousel';
import AnimatedSection from './AnimatedSection';
import { Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { Card } from '../../../components';

interface FeatureItem {
  icon: React.ComponentType<{ size: number }>;
  title: string;
  description: string;
  color: string;
}

interface MobileCarouselProps {
  items: FeatureItem[];
  isMobile: boolean;
}

// Mobile Carousel Component
const MobileCarousel: React.FC<MobileCarouselProps> = ({ items, isMobile }) => {
  if (!isMobile) return null;

  return (
    <AnimatedSection>
      <Carousel
        slideSize="100%"
        slideGap="md"
        emblaOptions={{
          loop: true,
          align: 'center',
          dragFree: false,
          slidesToScroll: 1,
          containScroll: 'trimSnaps',
        }}
        withIndicators
        styles={{
          indicator: {
            width: 8,
            height: 8,
            backgroundColor: '#e9ecef',
            transition: 'all 0.3s ease',
            '&[data-active]': {
              backgroundColor: '#339af0',
            },
          },
        }}
      >
        {items.map((item, index) => (
          <Carousel.Slide key={index}>
            <Card
              shadow="sm"
              padding="xl"
              radius="md"
              style={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Stack align="center" gap="md">
                <ThemeIcon
                  size={40}
                  radius="xl"
                  color={item.color}
                  variant="light"
                >
                  <item.icon size={24} />
                </ThemeIcon>
                <Title order={4} ta="center" fz={14}>
                  {item.title}
                </Title>
                <Text ta="center" c="dimmed" size="xs">
                  {item.description}
                </Text>
              </Stack>
            </Card>
          </Carousel.Slide>
        ))}
      </Carousel>
    </AnimatedSection>
  );
};

export default MobileCarousel;
