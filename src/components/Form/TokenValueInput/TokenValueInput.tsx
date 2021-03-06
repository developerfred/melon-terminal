import React from 'react';
import BigNumber from 'bignumber.js';
import { NumberFormatValues } from 'react-number-format';
import { TokenDefinition } from '@melonproject/melonjs';
import { useField, Wrapper, Error, Label } from '~/components/Form/Form';
import { SelectLabel } from '~/components/Form/Select/Select';
import { BigNumberInputField } from '~/components/Form/BigNumberInput/BigNumberInput';
import { TokenValue } from '~/TokenValue';
import * as S from './TokenValueInput.styles';

export interface TokenValueInputProps {
  name: string;
  label?: string | JSX.Element;
  // token: TokenDefinition;
  disabled?: boolean;
  noIcon?: boolean;
  onChange?: (value: TokenValue, before?: TokenValue) => void;
}

export const TokenValueInput: React.FC<TokenValueInputProps> = ({ label, onChange: onChangeFeedback, ...props }) => {
  const [{ onChange, ...field }, meta, { setValue }] = useField<TokenValue | undefined>(props.name);

  const number = React.useMemo(() => {
    if (!field.value) {
      return;
    }

    const value = field.value.value;
    return (BigNumber.isBigNumber(value) ? value.toFixed() : value) as string;
  }, [field.value]);

  const token = React.useMemo(() => {
    return field.value?.token ? field.value.token : ({} as TokenDefinition);
  }, [field.value]);

  const onValueChange = React.useCallback(
    (values: NumberFormatValues) => {
      const before = field.value;
      const value = !values.value ? new TokenValue(token) : new TokenValue(token, values.value);

      if (before?.value?.comparedTo(value.value ?? '') === 0) {
        return;
      }

      setValue(new TokenValue(token, values.value));
      onChangeFeedback?.(value, before);
    },
    [field.value, setValue, onChange]
  );

  return (
    <Wrapper>
      <Label>{label}</Label>
      <S.InputContainer>
        <BigNumberInputField
          {...meta}
          {...field}
          {...props}
          value={number}
          decimalScale={token.decimals}
          onValueChange={onValueChange}
          placeholder={field.value ? 'Enter a value ...' : undefined}
        />

        {props.noIcon || (
          <S.TokenWrapper>
            <SelectLabel icon={token.symbol} label={token.symbol} />
          </S.TokenWrapper>
        )}
      </S.InputContainer>

      {meta.touched && meta.error && <Error>{meta.error}</Error>}
    </Wrapper>
  );
};
