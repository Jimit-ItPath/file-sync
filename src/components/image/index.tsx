import {
  Image as MantineImage,
  type ImageProps as MantineImageProps,
} from '@mantine/core';
import { IMAGES } from '../../assets/images';
import { Card } from '../card';
import { useState } from 'react';

type ImageProps = {
  src: string | null;
  alt?: string;
  fit?: MantineImageProps['fit'];
  aspectRatio?: '16/9' | '4/3' | '1/1';
  radius?: MantineImageProps['radius'];
  [key: string]: any;
} & MantineImageProps;

export const Image = ({
  src = null,
  alt = 'Image',
  fit = 'cover',
  aspectRatio = '16/9',
  radius,
  classNames,
  styles,
  ...props
}: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(Boolean(!src));

  // Separate Card-specific and MantineImage-specific props
  const cardProps = {
    radius,
    withBorder: false,
    p: 0,
    h: '100%',
    w: '100%',
    bg: 'transparent',
    ...(isLoading || isError ? { bg: 'transparent' } : {}),
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      aspectRatio,
    },
    // Do NOT forward classNames/styles to Card
  };

  const imageProps = {
    src,
    alt,
    fallbackSrc: IMAGES.Placeholder,
    h: '100%',
    w: isError ? '26%' : '100%',
    fit: isError ? 'contain' : fit,
    style: { aspectRatio, ...(isError && { opacity: 0.3 }) },
    onLoad: () => setIsLoading(false),
    onError: () => {
      setIsLoading(false);
      setIsError(true);
    },
    classNames,
    styles,
    ...props,
  };

  return (
    <Card {...cardProps}>
      <MantineImage {...imageProps} />
    </Card>
  );
};
