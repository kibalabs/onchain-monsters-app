import React from 'react';

import { truncateMiddle } from '@kibalabs/core';
import { Alignment, Box, Button, Direction, EqualGrid, IconButton, Image, KibaIcon, LinkBase, LoadingSpinner, MarkdownText, PaddingSize, ResponsiveContainingView, Spacing, Stack, Text, TextAlignment, useColors } from '@kibalabs/ui-react';
import { BigNumber, ethers } from 'ethers';

import { useAccount, useOnLinkAccountsClicked, useWeb3 } from '../AccountContext';
import { SelectableView } from '../components/SelectableView';
import { Footer } from '../components/Footer';
import { Token, TokenCard } from '../components/TokenCard';
import OnChainMonstersABI from '../OnChainMonstersABI.json';
import OnChainMonstersStakingABI from '../OnChainMonstersStakingABI.json';
import { useInitialization, useLocation, useNavigator } from '@kibalabs/core-react';

const arrayWithRange = (start: number, end: number): number[] => {
  return Array(end - start).fill().map((item, index) => start + index);
};

const base64DecodeUnicode = (input: string): string => {
  // Convert Base64 encoded bytes to percent-encoding, and then get the original string.
  const percentEncodedInput = atob(input).split('').map((c) => {
    return `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`;
  }).join('');
  return decodeURIComponent(percentEncodedInput);
};


const ONCHAIN_MONSTERS_ADDRESS = '0xaa5d0f2e6d008117b16674b0f00b6fca46e3efc4';
const ONCHAIN_MONSTERS_STAKING_ADDRESS = '0x10971797fcb9925d01ba067e51a6f8333ca000b1';

export const HomePage = (): React.ReactElement => {
  const web3 = useWeb3();
  const account = useAccount();
  const onLinkAccountsClicked = useOnLinkAccountsClicked();
  const colors = useColors();
  const navigator = useNavigator();
  const [chosenTokenIds, setChosenTokenIds] = React.useState<number[]>([]);
  const [ownedTokens, setOwnedTokens] = React.useState<Token[] | undefined | null>(undefined);
  const [stakedTokens, setStakedTokens] = React.useState<Token[] | undefined | null>(undefined);
  const [doughBalance, setDoughBalance] = React.useState<BigNumber | undefined | null>(undefined);
  const [stakingDoughAccumulated, setStakingDoughAccumulated] = React.useState<BigNumber | undefined | null>(undefined);
  const [hasApprovedDoughSpend, setHasApprovedDoughSpend] = React.useState<boolean | undefined | null>(undefined);
  const [hasApprovedStaking, setHasApprovedStaking] = React.useState<boolean | undefined | null>(undefined);
  // const [monsterSupply, setMonsterSupply] = React.useState<number | undefined | null>(undefined);
  const [unstakingTransaction, setUnstakingTransaction] = React.useState<ethers.ContractTransaction | null>(null);
  const [unstakingTransactionError, setUnstakingTransactionError] = React.useState<Error | null>(null);
  const [unstakingTransactionReceipt, setUnstakingTransactionReceipt] = React.useState<ethers.ContractReceipt | null>(null);
  const [stakingTransaction, setStakingTransaction] = React.useState<ethers.ContractTransaction | null>(null);
  const [stakingTransactionError, setStakingTransactionError] = React.useState<Error | null>(null);
  const [stakingTransactionReceipt, setStakingTransactionReceipt] = React.useState<ethers.ContractReceipt | null>(null);
  const [approveStakingTransaction, setApproveStakingTransaction] = React.useState<ethers.ContractTransaction | null>(null);
  const [approveStakingTransactionError, setApproveStakingTransactionError] = React.useState<Error | null>(null);
  const [approveStakingTransactionReceipt, setApproveStakingTransactionReceipt] = React.useState<ethers.ContractReceipt | null>(null);
  const [approveDoughSpendTransaction, setApproveDoughSpendTransaction] = React.useState<ethers.ContractTransaction | null>(null);
  const [approveDoughSpendTransactionError, setApproveDoughSpendTransactionError] = React.useState<Error | null>(null);
  const [approveDoughSpendTransactionReceipt, setApproveDoughSpendTransactionReceipt] = React.useState<ethers.ContractReceipt | null>(null);
  const [buyMonsterTransaction, setBuyMonsterTransaction] = React.useState<ethers.ContractTransaction | null>(null);
  const [buyMonsterTransactionError, setBuyMonsterTransactionError] = React.useState<Error | null>(null);
  const [buyMonsterTransactionReceipt, setBuyMonsterTransactionReceipt] = React.useState<ethers.ContractReceipt | null>(null);
  const [burnTransaction, setBurnTransaction] = React.useState<ethers.ContractTransaction | null>(null);
  const [burnTransactionError, setBurnTransactionError] = React.useState<Error | null>(null);
  const [burnTransactionReceipt, setBurnTransactionReceipt] = React.useState<ethers.ContractReceipt | null>(null);

  useInitialization((): void => {
    if (window.location.host === 'onchain-monsters.kibalabs.com') {
      navigator.navigateTo('https://onchain-monsters.tokenpage.xyz');
    }
  });

  const onConnectClicked = (): void => {
    onLinkAccountsClicked();
  };

  const contract = React.useMemo((): ethers.Contract => {
    return new ethers.Contract(ONCHAIN_MONSTERS_ADDRESS, OnChainMonstersABI, web3);
  }, [web3]);

  const stakingContract = React.useMemo((): ethers.Contract => {
    return new ethers.Contract(ONCHAIN_MONSTERS_STAKING_ADDRESS, OnChainMonstersStakingABI, web3);
  }, [web3]);

  const loadData = React.useCallback(async () => {
    if (!account) {
      return;
    }
    stakingContract.getAllRewards(account.address).then((newStakingDoughAccumulated: BigNumber): void => {
      setStakingDoughAccumulated(newStakingDoughAccumulated);
    });
    stakingContract.balanceOf(account.address).then((newDoughBalance: BigNumber): void => {
      setDoughBalance(newDoughBalance);
    });
    stakingContract.allowance(account.address, ONCHAIN_MONSTERS_ADDRESS).then((newAllowance: BigNumber): void => {
      setHasApprovedDoughSpend(newAllowance.gt(ethers.utils.parseEther('1')));
    });
    // TODO(krishan711): change the check above to > 1 when the supply is over 4000 (and other tiers after)
    // contract.totalSupply().then((newMonsterSupply: number): void => {
    //   setMonsterSupply(newMonsterSupply);
    // });
    contract.isApprovedForAll(account.address, ONCHAIN_MONSTERS_STAKING_ADDRESS).then((newHasApprovedStaking: boolean): void => {
      setHasApprovedStaking(newHasApprovedStaking);
    });
    const monstersBalance = await contract.balanceOf(account.address);
    const ownedTokenIds = await Promise.all(arrayWithRange(0, monstersBalance).map(async (index: number): Promise<number> => (await contract.tokenOfOwnerByIndex(account.address, index)).toNumber()));
    const newOwnedTokens = await Promise.all(ownedTokenIds.map(async (tokenId: number): Promise<Token> => {
      const tokenUri = await contract.tokenURI(tokenId);
      const data = JSON.parse(base64DecodeUnicode(tokenUri.replace('data:application/json;base64,', '')));
      return { registryAddress: ONCHAIN_MONSTERS_ADDRESS, tokenId, name: data.name, image: data.image };
    }));
    setOwnedTokens(newOwnedTokens);
    const stakedTokenIds = (await stakingContract.getTokensStaked(account.address)).map((tokenId: BigNumber): number => tokenId.toNumber());
    const newStakedTokens = await Promise.all(stakedTokenIds.map(async (tokenId: number): Promise<Token> => {
      const tokenUri = await contract.tokenURI(tokenId);
      const data = JSON.parse(base64DecodeUnicode(tokenUri.replace('data:application/json;base64,', '')));
      return { registryAddress: ONCHAIN_MONSTERS_ADDRESS, tokenId, name: data.name, image: data.image };
    }));
    setStakedTokens(newStakedTokens);
    setChosenTokenIds([]);
  }, [account, contract, stakingContract]);

  React.useEffect((): void => {
    loadData();
  }, [loadData]);

  const onApproveStakingClicked = React.useCallback(async (): Promise<void> => {
    setApproveStakingTransaction(null);
    setApproveStakingTransactionError(null);
    setApproveStakingTransactionReceipt(null);
    const contractWithSigner = contract.connect(account.signer);
    try {
      const newApproveStakingTransaction = await contractWithSigner.setApprovalForAll(ONCHAIN_MONSTERS_STAKING_ADDRESS, true);
      setApproveStakingTransaction(newApproveStakingTransaction);
    } catch (error: unknown) {
      setApproveStakingTransactionError(error as Error);
    }
  }, [contract, account]);

  const waitForApproveStakingTransaction = React.useCallback(async (): Promise<void> => {
    if (stakingTransaction) {
      const receipt = await stakingTransaction.wait();
      setApproveStakingTransaction(null);
      setApproveStakingTransactionReceipt(receipt);
      loadData();
    }
  }, [stakingTransaction, loadData]);

  React.useEffect((): void => {
    waitForApproveStakingTransaction();
  }, [waitForApproveStakingTransaction]);

  const onStakeClicked = React.useCallback(async (): Promise<void> => {
    setStakingTransaction(null);
    setStakingTransactionError(null);
    setStakingTransactionReceipt(null);
    const stakingContractWithSigner = stakingContract.connect(account.signer);
    try {
      const newStakingTransaction = await stakingContractWithSigner.stakeByIds(chosenTokenIds);
      setStakingTransaction(newStakingTransaction);
    } catch (error: unknown) {
      setStakingTransactionError(error as Error);
    }
  }, [stakingContract, account, chosenTokenIds]);

  const waitForStakingTransaction = React.useCallback(async (): Promise<void> => {
    if (stakingTransaction) {
      const receipt = await stakingTransaction.wait();
      setStakingTransaction(null);
      setStakingTransactionReceipt(receipt);
      loadData();
    }
  }, [stakingTransaction, loadData]);

  React.useEffect((): void => {
    waitForStakingTransaction();
  }, [waitForStakingTransaction]);

  const onBurnToMintClicked = React.useCallback(async (): Promise<void> => {
    setBurnTransaction(null);
    setBurnTransactionError(null);
    setBurnTransactionReceipt(null);
    const contractWithSigner = contract.connect(account.signer);
    try {
      const newBurnTransaction = await contractWithSigner.burnForMint(chosenTokenIds[0]);
      setBurnTransaction(newBurnTransaction);
    } catch (error: unknown) {
      setBurnTransactionError(error as Error);
    }
  }, [contract, account, chosenTokenIds]);

  const waitForBurnTransaction = React.useCallback(async (): Promise<void> => {
    if (burnTransaction) {
      const receipt = await burnTransaction.wait();
      setBurnTransaction(null);
      setBurnTransactionReceipt(receipt);
      loadData();
    }
  }, [burnTransaction, loadData]);

  React.useEffect((): void => {
    waitForBurnTransaction();
  }, [waitForBurnTransaction]);

  const onUnstakeAllClicked = React.useCallback(async (): Promise<void> => {
    setUnstakingTransaction(null);
    setUnstakingTransactionError(null);
    setUnstakingTransactionReceipt(null);
    const stakingContractWithSigner = stakingContract.connect(account.signer);
    try {
      const newUnstakingTransaction = await stakingContractWithSigner.unstakeAll();
      setUnstakingTransaction(newUnstakingTransaction);
    } catch (error: unknown) {
      setUnstakingTransactionError(error as Error);
    }
  }, [stakingContract, account]);

  const waitForUnstakingTransaction = React.useCallback(async (): Promise<void> => {
    if (unstakingTransaction) {
      const receipt = await unstakingTransaction.wait();
      setUnstakingTransaction(null);
      setUnstakingTransactionReceipt(receipt);
      loadData();
    }
  }, [unstakingTransaction, loadData]);

  React.useEffect((): void => {
    waitForUnstakingTransaction();
  }, [waitForUnstakingTransaction]);

  const onApproveDoughSpendClicked = React.useCallback(async (): Promise<void> => {
    setApproveDoughSpendTransaction(null);
    setApproveDoughSpendTransactionError(null);
    setApproveDoughSpendTransactionReceipt(null);
    const stakingContractWithSigner = stakingContract.connect(account.signer);
    try {
      const newApproveDoughSpendTransaction = await stakingContractWithSigner.approve(ONCHAIN_MONSTERS_ADDRESS, ethers.utils.parseEther('1000'));
      setApproveDoughSpendTransaction(newApproveDoughSpendTransaction);
    } catch (error: unknown) {
      setApproveDoughSpendTransactionError(error as Error);
    }
  }, [stakingContract, account]);

  const waitForApproveDoughSpendTransaction = React.useCallback(async (): Promise<void> => {
    if (approveDoughSpendTransaction) {
      const receipt = await approveDoughSpendTransaction.wait();
      setApproveDoughSpendTransaction(null);
      setApproveDoughSpendTransactionReceipt(receipt);
      loadData();
    }
  }, [approveDoughSpendTransaction, loadData]);

  React.useEffect((): void => {
    waitForApproveDoughSpendTransaction();
  }, [waitForApproveDoughSpendTransaction]);

  const onBuyMonsterClicked = React.useCallback(async (): Promise<void> => {
    setBuyMonsterTransaction(null);
    setBuyMonsterTransactionError(null);
    setBuyMonsterTransactionReceipt(null);
    const contractWithSigner = contract.connect(account.signer);
    try {
      const gasEstimate = await contractWithSigner.estimateGas.mintMonster();
      // NOTE(krishan711): not sure why but the gas is estimated wrongly?!
      const newBuyMonsterTransaction = await contractWithSigner.mintMonster({ gasLimit: Math.ceil(gasEstimate.toNumber() * 1.2) });
      setBuyMonsterTransaction(newBuyMonsterTransaction);
    } catch (error: unknown) {
      setBuyMonsterTransactionError(error as Error);
    }
  }, [contract, account]);

  const waitForBuyMonsterTransaction = React.useCallback(async (): Promise<void> => {
    if (buyMonsterTransaction) {
      const receipt = await buyMonsterTransaction.wait();
      setBuyMonsterTransaction(null);
      setBuyMonsterTransactionReceipt(receipt);
      loadData();
    }
  }, [buyMonsterTransaction, loadData]);

  React.useEffect((): void => {
    waitForBuyMonsterTransaction();
  }, [waitForBuyMonsterTransaction]);

  const onUnstakedTokenClicked = (token: Token): void => {
    if (chosenTokenIds.includes(token.tokenId)) {
      setChosenTokenIds(chosenTokenIds.filter((tokenId: number): boolean => tokenId !== token.tokenId));
    } else {
      setChosenTokenIds([...chosenTokenIds, token.tokenId]);
    }
  };

  const getShareText = (): string => {
    return encodeURIComponent('Check out the @OnChainMonsters un-official app by the guys from @mdtp_app https://onchain-monsters.kibalabs.com');
  };

  return (
    <ResponsiveContainingView sizeResponsive={{ base: 12, medium: 10, large: 8 }}>
      <Stack direction={Direction.Vertical} isFullWidth={true} isFullHeight={true} childAlignment={Alignment.Center} contentAlignment={Alignment.Center} padding={PaddingSize.Wide2} shouldAddGutters={true}>
        <LinkBase target='/'>
          <Text variant='header1' alignment={TextAlignment.Center}>On-Chain Monsters</Text>
        </LinkBase>
        <Text variant='header5' alignment={TextAlignment.Center}>(un-official)</Text>
        <Stack.Item alignment={Alignment.Start} gutterBefore={PaddingSize.Wide2}>
          <MarkdownText textVariant='large' source={'This is an **un-official** dapp for interacting with On-Chain Monsters. I built it mostly for myself but also kinda so people would look at the other things I build 😄'} />
        </Stack.Item>
        <Stack.Item alignment={Alignment.Start}>
          <MarkdownText textVariant='large' source={'This project is open-source. You can check it out and even contribute on [GitHub](https://github.com/kibalabs/onchain-monsters-app) 🔥.'} />
        </Stack.Item>
        <Spacing variant={PaddingSize.Wide} />
        <Stack direction={Direction.Horizontal} shouldAddGutters={true}>
          <Button iconLeft={<KibaIcon iconId='ion-newspaper' />} text='Contract' target={`https://etherscan.io/address/${ONCHAIN_MONSTERS_ADDRESS}`} />
          <Button iconLeft={<KibaIcon iconId='ion-newspaper-outline' />} text='Staking Contract' target={`https://etherscan.io/address/${ONCHAIN_MONSTERS_STAKING_ADDRESS}`} />
        </Stack>
        <Stack direction={Direction.Horizontal} shouldAddGutters={true}>
          <IconButton icon={<KibaIcon iconId='feather-shopping-bag' />} target='https://opensea.io/collection/on-chain-monsters' />
          <IconButton icon={<KibaIcon iconId='feather-shopping-cart' />} target={`https://looksrare.org/collections/${ONCHAIN_MONSTERS_ADDRESS}`} />
          <IconButton icon={<KibaIcon iconId='ion-logo-twitter' />} target={'https://twitter.com/OnChainMonsters'} />
          <IconButton icon={<KibaIcon iconId='ion-logo-discord' />} target={'https://discord.gg/MDGvartz'} />
        </Stack>
        <Spacing variant={PaddingSize.Wide2} />
        { account ? (
          <React.Fragment>
            <Stack direction={Direction.Horizontal} shouldAddGutters={true}>
              <Text variant='note'>Connected to:</Text>
              <Box width='1em' height='1em'>
                <Image source={`https://web3-images-api.kibalabs.com/v1/accounts/${account.address}/image`} alternativeText='' />
              </Box>
              <Text variant='note'>{truncateMiddle(account.address, 15)}</Text>
            </Stack>
            <Spacing variant={PaddingSize.Wide} />
            { doughBalance === undefined ? (
              <LoadingSpinner />
            ) : doughBalance === null ? (
              <Text variant='error'>Error loading balance</Text>
            ) : (
              <React.Fragment>
                <Stack direction={Direction.Horizontal} shouldAddGutters={true}>
                  <Text>Dough Balance:</Text>
                  <Text variant='bold'>{`${ethers.utils.formatEther(doughBalance)} $OCMD`}</Text>
                </Stack>
                { hasApprovedDoughSpend ? (
                  <React.Fragment>
                    {buyMonsterTransactionReceipt !== null && (
                      <Stack direction={Direction.Horizontal} shouldAddGutters={true}>
                        <KibaIcon iconId='ion-checkmark-circle' variant='large' _color={colors.success} />
                        <Text variant='success'>Mint successful</Text>
                      </Stack>
                    )}
                    {buyMonsterTransactionError && (
                      <Text variant='error'>{`Error while buyMonster: ${buyMonsterTransactionError.message}`}</Text>
                    )}
                    {buyMonsterTransaction ? (
                      <Stack direction={Direction.Horizontal} shouldAddGutters={true} contentAlignment={Alignment.Center} childAlignment={Alignment.Center}>
                        <LoadingSpinner />
                        <Text>Minting...</Text>
                        <IconButton variant='small' target={`https://etherscan.io/tx/${buyMonsterTransaction.hash}`} icon={<KibaIcon iconId='ion-open' />} />
                      </Stack>
                    ) : (
                      <React.Fragment>
                        <Button variant='primary' text='Mint Monster with Dough' onClicked={onBuyMonsterClicked} />
                      </React.Fragment>
                    )}
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Text>You need to approve the Monsters minting contract to spend your Dough to mint monster.</Text>
                    {approveDoughSpendTransactionReceipt !== null && (
                      <Stack direction={Direction.Horizontal} shouldAddGutters={true}>
                        <KibaIcon iconId='ion-checkmark-circle' variant='large' _color={colors.success} />
                        <Text variant='success'>Approval successful</Text>
                      </Stack>
                    )}
                    {approveDoughSpendTransactionError && (
                      <Text variant='error'>{`Error while approveDoughSpend: ${approveDoughSpendTransactionError.message}`}</Text>
                    )}
                    {approveDoughSpendTransaction ? (
                      <Stack direction={Direction.Horizontal} shouldAddGutters={true} contentAlignment={Alignment.Center} childAlignment={Alignment.Center}>
                        <LoadingSpinner />
                        <Text>Approving...</Text>
                        <IconButton variant='small' target={`https://etherscan.io/tx/${approveDoughSpendTransaction.hash}`} icon={<KibaIcon iconId='ion-open' />} />
                      </Stack>
                    ) : (
                      <React.Fragment>
                        <Button variant='primary' text='Approve dough spend' onClicked={onApproveDoughSpendClicked} />
                      </React.Fragment>
                    )}
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
            <Spacing variant={PaddingSize.Wide} />
            <Text variant='header3'>Owned Monsters</Text>
            {ownedTokens === undefined ? (
              <LoadingSpinner />
            ) : ownedTokens === null ? (
              <Text variant='error'>Error loading owned monsters</Text>
            ) : ownedTokens.length === 0 ? (
              <Text variant='note'>No owned monsters</Text>
            ) : (
              <React.Fragment>
                <EqualGrid childSizeResponsive={{ base: 12, small: 6, medium: 4, large: 3 }} shouldAddGutters={true}>
                  {ownedTokens.map((token: Token): React.ReactElement => (
                    <SelectableView key={token.tokenId} onClicked={(): void => onUnstakedTokenClicked(token)} isSelected={chosenTokenIds.includes(token.tokenId)}>
                      <TokenCard token={token} />
                    </SelectableView>
                  ))}
                </EqualGrid>
                { hasApprovedStaking ? (
                  <React.Fragment>
                    {stakingTransactionReceipt !== null && (
                      <Stack direction={Direction.Horizontal} shouldAddGutters={true}>
                        <KibaIcon iconId='ion-checkmark-circle' variant='large' _color={colors.success} />
                        <Text variant='success'>Staking successful</Text>
                      </Stack>
                    )}
                    {stakingTransactionError && (
                      <Text variant='error'>{`Error while staking: ${stakingTransactionError.message}`}</Text>
                    )}
                    {burnTransactionReceipt !== null && (
                      <Stack direction={Direction.Horizontal} shouldAddGutters={true}>
                        <KibaIcon iconId='ion-checkmark-circle' variant='large' _color={colors.success} />
                        <Text variant='success'>Burn to mint successful</Text>
                      </Stack>
                    )}
                    {burnTransactionError && (
                      <Text variant='error'>{`Error while burning: ${burnTransactionError.message}`}</Text>
                    )}
                    {stakingTransaction ? (
                      <Stack direction={Direction.Horizontal} shouldAddGutters={true} contentAlignment={Alignment.Center} childAlignment={Alignment.Center}>
                        <LoadingSpinner />
                        <Text>Staking...</Text>
                        <IconButton variant='small' target={`https://etherscan.io/tx/${stakingTransaction.hash}`} icon={<KibaIcon iconId='ion-open' />} />
                      </Stack>
                    ) : burnTransaction ? (
                      <Stack direction={Direction.Horizontal} shouldAddGutters={true} contentAlignment={Alignment.Center} childAlignment={Alignment.Center}>
                        <LoadingSpinner />
                        <Text>Burning for mint...</Text>
                        <IconButton variant='small' target={`https://etherscan.io/tx/${burnTransaction.hash}`} icon={<KibaIcon iconId='ion-open' />} />
                      </Stack>
                    ) : (
                      <Stack direction={Direction.Horizontal} shouldAddGutters={true}>
                        <Button variant='primary' text={`Stake ${chosenTokenIds.length} monsters`} onClicked={onStakeClicked} isEnabled={chosenTokenIds.length > 0} />
                        <Button text={'Burn to mint'} onClicked={onBurnToMintClicked} isEnabled={chosenTokenIds.length === 1} />
                      </Stack>
                    )}
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Text>You need to approve the Staking contract to manage your monsters for staking.</Text>
                    {approveStakingTransactionReceipt !== null && (
                      <Stack direction={Direction.Horizontal} shouldAddGutters={true}>
                        <KibaIcon iconId='ion-checkmark-circle' variant='large' _color={colors.success} />
                        <Text variant='success'>Approval successful</Text>
                      </Stack>
                    )}
                    {approveStakingTransactionError && (
                      <Text variant='error'>{`Error while approveDoughSpend: ${approveStakingTransactionError.message}`}</Text>
                    )}
                    {approveStakingTransaction ? (
                      <Stack direction={Direction.Horizontal} shouldAddGutters={true} contentAlignment={Alignment.Center} childAlignment={Alignment.Center}>
                        <LoadingSpinner />
                        <Text>Approving...</Text>
                        <IconButton variant='small' target={`https://etherscan.io/tx/${approveStakingTransaction.hash}`} icon={<KibaIcon iconId='ion-open' />} />
                      </Stack>
                    ) : (
                      <React.Fragment>
                        <Button variant='primary' text='Approve staking' onClicked={onApproveStakingClicked} />
                      </React.Fragment>
                    )}
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
            <Spacing variant={PaddingSize.Wide} />
            <Text variant='header3'>Staked Monsters</Text>
            {stakedTokens === undefined || stakingDoughAccumulated === undefined ? (
              <LoadingSpinner />
            ) : stakedTokens === null || stakingDoughAccumulated === null ? (
              <Text variant='error'>Error loading staked monsters</Text>
            ) : stakedTokens.length === 0 ? (
              <Text variant='note'>No staked monsters</Text>
            ) : (
              <React.Fragment>
                <EqualGrid childSizeResponsive={{ base: 12, small: 6, medium: 4, large: 3 }} shouldAddGutters={true}>
                  {stakedTokens.map((token: Token): React.ReactElement => (
                    <LinkBase key={token.tokenId}>
                      <TokenCard token={token} />
                    </LinkBase>
                  ))}
                </EqualGrid>
                {unstakingTransactionReceipt !== null && (
                  <Stack direction={Direction.Horizontal} shouldAddGutters={true}>
                    <KibaIcon iconId='ion-checkmark-circle' variant='large' _color={colors.success} />
                    <Text variant='success'>Unstaking successful</Text>
                  </Stack>
                )}
                {unstakingTransactionError && (
                  <Text variant='error'>{`Error while unstaking: ${unstakingTransactionError.message}`}</Text>
                )}
                {unstakingTransaction ? (
                  <Stack direction={Direction.Horizontal} shouldAddGutters={true} contentAlignment={Alignment.Center} childAlignment={Alignment.Center}>
                    <LoadingSpinner />
                    <Text>Unstaking...</Text>
                    <IconButton variant='small' target={`https://etherscan.io/tx/${unstakingTransaction.hash}`} icon={<KibaIcon iconId='ion-open' />} />
                  </Stack>
                ) : (
                  <React.Fragment>
                    <Text>{`💰💰 ${ethers.utils.formatEther(stakingDoughAccumulated)} $OCMD to claim`}</Text>
                    <Button variant='primary' text='Unstake all to claim' onClicked={onUnstakeAllClicked} />
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
            <Spacing variant={PaddingSize.Wide2} />
            <Button text='Share the love' iconLeft={<KibaIcon iconId='ion-logo-twitter' />} target={`https://twitter.com/intent/tweet?text=${getShareText()}`} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Spacing variant={PaddingSize.Wide3} />
            <Button variant='large-primary' text='Connect Wallet' onClicked={onConnectClicked} />
            <Spacing variant={PaddingSize.Wide3} />
          </React.Fragment>
        )}
        <Stack.Item growthFactor={1} shrinkFactor={1}>
          <Spacing variant={PaddingSize.Wide2} />
        </Stack.Item>
        <Footer />
      </Stack>
    </ResponsiveContainingView>
  );
};
