import React from 'react';

import { Alignment, Box, Direction, Image, PaddingSize, Spacing, Stack, Text, TextAlignment } from '@kibalabs/ui-react';

export interface Token {
  registryAddress: string;
  tokenId: number;
  name: string;
  image: string;
}

export interface TokenCardProps {
  token: Token;
}

export const TokenCard = (props: TokenCardProps): React.ReactElement => {
  return (
    <Box variant='card' shouldClipContent={true}>
      <Stack direction={Direction.Vertical} isFullWidth={true} childAlignment={Alignment.Center} contentAlignment={Alignment.Center}>
        <Box width='100%'>
          <Image source={props.token.image} alternativeText='image' fitType='contain' />
        </Box>
        <Spacing variant={PaddingSize.Wide} />
        <Text variant='bold' lineLimit={2} alignment={TextAlignment.Center}>{props.token.name}</Text>
      </Stack>
    </Box>
  );
};
