/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import {
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
  Connection,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import {Buffer} from 'buffer';

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const BK_DEV_SECRET = new Buffer([
  181, 74, 222, 193, 247, 42, 40, 85, 228, 88, 172, 45, 191, 134, 50, 129, 189,
  240, 139, 73, 218, 78, 78, 249, 179, 234, 45, 163, 16, 17, 46, 159, 46, 75,
  163, 60, 60, 111, 140, 193, 19, 53, 250, 233, 247, 149, 221, 11, 194, 124,
  152, 200, 157, 224, 61, 208, 67, 104, 143, 183, 216, 139, 92, 235,
]);

const RECEIVER = new PublicKey('EcxjN4mea6Ah9WSqZhLtSJJCZcxY73Vaz6UVHFZZ5Ttz');

const WALLET = Keypair.fromSecretKey(BK_DEV_SECRET);
const network = clusterApiUrl('mainnet-beta');
console.log('network', network);
let connection = new Connection('https://swr.xnfts.dev/rpc-proxy/');

async function requestAirdrop(publicKey: PublicKey) {
  console.log('request airdrop: publicKey', publicKey);
  const [signature, {blockhash, lastValidBlockHeight}] = await Promise.all([
    connection.requestAirdrop(publicKey, 3000000000),
    connection.getLatestBlockhash(),
  ]);

  console.log('signature', signature);
  console.log('blockhash', blockhash);
  console.log('lastValidBlockHeight', lastValidBlockHeight);

  const accountInfo = await connection.getAccountInfo(publicKey);
  console.log('accountInfo', accountInfo);

  try {
    const res = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      'processed',
    );

    console.log('confirm transaction success', res);
  } catch (error) {
    console.error('confirm transaction success', error);
  }
}

async function makeTransaction(payer, receiver: PublicKey) {
  console.log('sending...');
  const blockhash = await connection.getLatestBlockhash();
  console.log('blockhash', blockhash);
  console.log('payer', payer);
  console.log('receiver', receiver);
  try {
    console.log('getting payer');
    const payerInfo = await connection.getAccountInfo(payer.publicKey);
    console.log('payerInfo', payerInfo);
  } catch (err) {
    console.log('payerinfo error', err);
  }

  try {
    console.log('getting receiver');
    const receiverInfo = await connection.getAccountInfo(receiver);
    console.log('receiverInfo', receiverInfo);
  } catch (err) {
    console.log('receiverinfo error', err);
  }

  // Airdrop SOL for paying transactions
  // try {
  //   console.log('request air drop ');
  //   // await requestAirdrop(payer.publicKey);
  //   console.log('airdrop success');
  // } catch (err) {
  //   console.error('airdrop error', err);
  // }

  const sp = new TransactionInstruction({
    keys: [
      {
        pubkey: payer.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: receiver,
        isSigner: false,
        isWritable: true,
      },
    ],
    programId: new PublicKey('11111111111111111111111111111111'),
    data: new Buffer([2, 0, 0, 0, 128, 150, 152, 0, 0, 0, 0, 0]),
  });

  const instruction = new TransactionInstruction(sp);

  let transaction = new Transaction();
  console.log('create instructions');
  transaction.add(instruction);

  try {
    console.log('send transaction');
    const res = await sendAndConfirmTransaction(connection, transaction, [
      payer,
    ]);
    console.log('transaction success', res);
  } catch (error) {
    console.error('sendAndConfirmTransaction error', error);
  }
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Header />
      <Button
        title="Send Money"
        onPress={() => {
          console.log('pressed');
          makeTransaction(WALLET, RECEIVER);
        }}
      />
    </SafeAreaView>
  );
}

export default App;
