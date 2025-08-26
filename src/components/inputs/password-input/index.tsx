import {
  ActionIcon,
  Box,
  Flex,
  Group,
  PasswordInput as MantinePasswordInput,
  Progress,
  rem,
  Text,
  type PasswordInputProps as MantinePasswordInputProps,
} from '@mantine/core';
import { useRef, useState } from 'react';
import Icon from '../../../assets/icons/icon';
import { ICONS } from '../../../assets/icons';
import { useDisclosure } from '@mantine/hooks';
import { generateRandomPassword } from '../../../utils/helper';
import { Popover } from '../../popover';
import { Tooltip } from '../../tooltip';
import { passwordRequirements } from '../../../utils/constants';

type PasswordInputProps = {
  field: any;
  generateOption?: boolean | any;
  [key: string]: any;
} & MantinePasswordInputProps;

const PasswordRequirement = ({
  meets,
  label,
}: {
  meets: boolean;
  label: string;
}) => {
  return (
    <Text
      c={meets ? 'teal' : 'red'}
      style={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size="sm"
    >
      {meets ? (
        <Icon component={ICONS.IconCheck} size={14} />
      ) : (
        <Icon component={ICONS.IconX} size={14} />
      )}
      <Box component="span" ml={10}>
        {label}
      </Box>
    </Text>
  );
};

const getStrength = (password: string) => {
  if (!password) {
    return 0;
  }
  let multiplier = password.length > 5 ? 0 : 1;

  passwordRequirements.forEach(requirement => {
    if (!requirement.re.test(password?.trim())) {
      multiplier += 1;
    }
  });

  return Math.max(
    100 - (100 / (passwordRequirements.length + 1)) * multiplier,
    10
  );
};

const InputComponent = ({
  field,
  generateOption,
  isXs,
  isSm,
  isMd,
  ...props
}: PasswordInputProps) => {
  const { value, onChange, onBlur, ref } = field;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputHeight = inputRef?.current?.clientHeight || 0;

  const [visible, { toggle, open }] = useDisclosure(false);

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    onChange(newPassword);
    open();
  };

  return (
    <MantinePasswordInput
      w="100%"
      {...{ value, onBlur, visible }}
      ref={element => {
        ref(element);
        if (inputRef?.current) {
          inputRef.current = element;
        }
      }}
      styles={{ label: { width: '100%', fontSize: isMd ? rem(14) : rem(16) } }}
      onChange={e => {
        onChange(e.target.value);
      }}
      {...(generateOption && { rightSectionWidth: inputHeight * 2 })}
      rightSection={
        <Group gap={0} justify="space-around" w="100%">
          <Tooltip label={visible ? 'Hide' : 'Show'}>
            <ActionIcon
              variant="light"
              color="gray"
              aria-label="Visibility"
              onClick={toggle}
            >
              <Icon
                component={visible ? ICONS.IconEyeOff : ICONS.IconEye}
                style={{
                  width: 'var(--psi-icon-size)',
                  height: 'var(--psi-icon-size)',
                }}
              />
            </ActionIcon>
          </Tooltip>
          {generateOption && (
            <Tooltip label="Generate Random">
              <ActionIcon
                variant="light"
                color="gray"
                aria-label="Generate"
                onClick={handleGeneratePassword}
              >
                <Icon
                  component={ICONS.IconReload}
                  style={{
                    width: 'var(--psi-icon-size)',
                    height: 'var(--psi-icon-size)',
                  }}
                />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      }
      {...props}
    />
  );
};

const PasswordInput = ({
  field,
  generateOption = false,
  strengthMeter = false,
  error,
  isXs,
  isSm,
  isMd,
  ...props
}: PasswordInputProps) => {
  const isError = Boolean(error);
  const { value } = field;
  const [popoverOpened, setPopoverOpened] = useState(false);

  const checks = passwordRequirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={value?.trim() ? requirement.re.test(value) : false}
    />
  ));
  const strength = getStrength(value);
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

  return strengthMeter ? (
    <Popover
      opened={popoverOpened}
      width="target"
      dropdownContent={
        <>
          <Progress color={color} value={strength} size={5} mb="xs" />
          <PasswordRequirement
            label="Includes at least 8 characters"
            meets={value?.length > 7}
          />
          {checks}
        </>
      }
    >
      <Flex
        onFocusCapture={() => setPopoverOpened(true)}
        onBlurCapture={() => setPopoverOpened(false)}
      >
        <InputComponent
          {...{ field, generateOption }}
          error={popoverOpened ? isError : error}
          isXs={isXs}
          isSm={isSm}
          isMd={isMd}
          {...props}
        />
      </Flex>
    </Popover>
  ) : (
    <InputComponent
      {...{ field, error, generateOption }}
      isXs={isXs}
      isSm={isSm}
      isMd={isMd}
      {...props}
    />
  );
};

export default PasswordInput;
