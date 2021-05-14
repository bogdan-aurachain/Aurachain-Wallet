import React from 'react';
import {Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
// IMPORTS ORDER MUST BE KEPT
import 'react-native-get-random-values';
import '@ethersproject/shims';
import {ethers} from 'ethers';


const blueColor = '#4285F4';

export default class App extends React.Component {

    provider = new ethers.getDefaultProvider('rinkeby');
    contract;
    wallet;

    constructor(props) {

        super(props);

        this.state = {
            address: null,
            isSeedInputVisible: false,
            seedPhrase: null,
            balance: null,
            storeValue: null,
            storeResult: null,
            retrieveResult: null,
        };
    }

    generateSeed(): void {

        this.wallet = new ethers.Wallet.createRandom();
        this.wallet = this.wallet.connect(this.provider);

        this.setAccountDetails(this.wallet.address);
    }

    importSeed(): void {

        this.wallet = new ethers.Wallet.fromMnemonic(this.state.seedPhrase);
        this.wallet = this.wallet.connect(this.provider);

        console.log('wallet', this.wallet);

        this.setState({isSeedInputVisible: false});

        this.setAccountDetails(this.wallet.address);
    }

    setAccountDetails(address): void {

        this.setState({address: address});

        this.provider.getBalance(address).then((balance) => {
            this.setState({balance: ethers.utils.formatEther(balance, {commify: true})});
        }).catch(e => {
            console.log('error in getBalance', e);
        });

        this.initContract();
    }

    initContract(): void {

        const contractAddress = '0x94AAAfC3685A5b1b3dd626e5E33e164103dabd21';
        const abi = [
            {
                'inputs': [
                    {
                        'internalType': 'uint256',
                        'name': 'num',
                        'type': 'uint256',
                    },
                ],
                'name': 'store',
                'outputs': [],
                'stateMutability': 'nonpayable',
                'type': 'function',
            },
            {
                'inputs': [],
                'name': 'retrieve',
                'outputs': [
                    {
                        'internalType': 'uint256',
                        'name': '',
                        'type': 'uint256',
                    },
                ],
                'stateMutability': 'view',
                'type': 'function',
            },
        ];

        this.contract = new ethers.Contract(contractAddress, abi, this.wallet);

        this.contract.connect(this.provider);

        console.log('contract', this.contract);
    }

    store(): void {

        this.contract.store(ethers.BigNumber.from(this.state.storeValue)).then(result => {
            console.log('store result', result);
        }).catch(e => {
            console.log('store e', e);
        });
    }

    retrieve(): void {

        this.contract.retrieve().then((result) => {
            this.setState({retrieveResult: ethers.utils.formatEther(result, {commify: true})});
        }).catch(e => {
            console.log('e', e);
        });
    }

    render(): * {

        return (
            <SafeAreaView style={styles.mainContainer}>
                <View style={styles.container}>
                    {<Image
                        style={styles.logo}
                        source={require('./assets/logo-aurachain.png')}
                    />}

                    {this.state.address && (
                        <View style={styles.accountDetails}>
                            <Text
                                style={styles.titleText}
                                numberOfLines={1}
                            >
                                Address: {this.state.address}
                            </Text>

                            <Text
                                style={styles.titleText}
                            >
                                Balance: {this.state.balance} ETH
                            </Text>
                            <View>
                                <TextInput
                                    style={styles.input}
                                    type={'number'}
                                    onChangeText={(text) => this.setState({storeValue: text})}
                                />
                                <TouchableOpacity style={[styles.button, styles.buttonPrimary]}
                                                  onPress={() => this.store()}>
                                    <Text style={styles.buttonPrimaryText}> Store value {this.state.storeResult} </Text>
                                </TouchableOpacity>
                            </View>
                            <View>
                                <TouchableOpacity style={[styles.button, styles.buttonPrimary]}
                                                  onPress={() => this.retrieve()}>
                                    <Text style={styles.buttonPrimaryText}> Retrieve
                                        value {this.state.retrieveResult} </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}


                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={[styles.button, styles.buttonOutline]}
                                          onPress={() => this.setState({isSeedInputVisible: true})}>
                            <Text style={styles.buttonOutlineText}> Import seed phrase </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonPrimary]}
                                          onPress={() => this.generateSeed()}>
                            <Text style={styles.buttonPrimaryText}> Generate seed phrase </Text>
                        </TouchableOpacity>

                        {this.state.isSeedInputVisible && (
                            <View style={styles.importContainer}>
                                <TextInput
                                    style={styles.seedInput}
                                    placeholder='Enter your seed'
                                    multiline={true}
                                    onChangeText={(text) => {
                                        this.setState({seedPhrase: text});
                                    }}
                                />
                                <TouchableOpacity style={[styles.button, styles.buttonPrimary]}
                                                  onPress={() => this.importSeed()}>
                                    <Text style={styles.buttonPrimaryText}> Import </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        height: '100%',
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '80%',
    },
    accountDetails: {
        justifyContent: 'center',
        marginHorizontal: 'auto',
        marginBottom: 20,
    },
    logo: {
        width: '100%',
        height: 100,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
    importContainer: {
        width: '100%',
    },
    seedInput: {
        height: 200,
        borderRadius: 5,
        borderColor: '#dedede',
        borderWidth: 3,
        width: '100%',
        padding: 7,
    },
    buttonsContainer: {
        marginTop: 'auto',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        padding: 10,
        marginBottom: 10,
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        borderRadius: 5,
        width: '100%',
    },
    buttonOutline: {
        color: blueColor,
        backgroundColor: '#fff',
        borderColor: blueColor,
        borderWidth: 2,
    },
    buttonOutlineText: {
        color: blueColor,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonPrimary: {
        backgroundColor: '#4285F4',
        color: '#fff',
    },
    buttonPrimaryText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    titleText: {
        fontWeight: 'bold',
    },
    input: {
        borderColor: '#cecece',
        borderWidth: 1,
        marginTop: 20,
        marginBottom: 5,
    },
});
