import React from 'react';

import { Alignment, Box, Direction, Image, LinkBase, MarkdownText, PaddingSize, Spacing, Stack, Text, TextAlignment } from '@kibalabs/ui-react';


export const SponsorView = (): React.ReactElement => {
  return (
    <Stack direction={Direction.Vertical} isFullWidth={true} childAlignment={Alignment.Center} contentAlignment={Alignment.Center} shouldAddGutters={true}>
      <Stack.Item gutterAfter={PaddingSize.Default}>
        <Text>Our Sponsors:</Text>
      </Stack.Item>
      <Stack directionResponsive={{ base: Direction.Vertical, medium: Direction.Horizontal }} shouldAddGutters={true} childAlignment={Alignment.Center}>
        {/* <LinkBase variant='image' target='https://nft.tokenhunt.io'>
          <Stack direction={Direction.Horizontal} shouldAddGutters={true} padding={PaddingSize.Default}>
            <Box width='3em' height='3em'>
              <Image source='/assets/tokenhunt.jpg' alternativeText='Token Hunt' />
            </Box>
            <Stack direction={Direction.Vertical}>
              <Text alignment={TextAlignment.Left} variant='bold'>Token Hunt</Text>
              <Text alignment={TextAlignment.Left}>Your daily dose of the best NFTs</Text>
            </Stack>
          </Stack>
        </LinkBase> */}
        <LinkBase variant='image' target='https://milliondollartokenpage.com'>
          <Stack direction={Direction.Horizontal} shouldAddGutters={true} padding={PaddingSize.Default}>
            <Box width='3em' height='3em'>
              <Image source='/assets/mdtp.png' alternativeText='Million Dollar Token Page' />
            </Box>
            <Stack direction={Direction.Vertical}>
              <Text alignment={TextAlignment.Left} variant='bold'>Million Dollar Token Page</Text>
              <Text alignment={TextAlignment.Left}>The homepage of the Metaverse </Text>
            </Stack>
          </Stack>
        </LinkBase>
      </Stack>
      <Spacing />
      <MarkdownText source='Made by [Kiba Labs](https://www.kibalabs.com)' />
    </Stack>
  );
};
