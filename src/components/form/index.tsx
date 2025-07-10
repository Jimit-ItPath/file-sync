import { Stack } from '@mantine/core';
import { FormProvider, type UseFormReturn } from 'react-hook-form';

type FormProps = {
  methods: UseFormReturn<any, any>;
  onSubmit?: (data: any) => void;
  children: React.ReactNode;
};

export const Form = ({ methods, onSubmit, children, ...props }: FormProps) => {
  const { handleSubmit } = methods;
  return (
    <FormProvider {...methods}>
      <form
        style={{ width: '100%' }}
        onSubmit={e => {
          e.preventDefault();
          if (onSubmit) {
            handleSubmit(onSubmit)(e);
          }
        }}
        noValidate
        {...props}
      >
        <Stack>{children}</Stack>
      </form>
    </FormProvider>
  );
};
