import { writeFileSync } from 'fs'
import { TimelockWallet } from '../src/contracts/timelockwallet'
import { privateKey ,} from './privateKey'
import { getRandomAddress } from 'scrypt-ts'
import { bsv, TestWallet, DefaultProvider, sha256, Addr } from 'scrypt-ts'

function getScriptHash(scriptPubKeyHex: string) {
    const res = sha256(scriptPubKeyHex).match(/.{2}/g)
    if (!res) {
        throw new Error('scriptPubKeyHex is not of even length')
    }
    return res.reverse().join('')
}

async function main() {
    await TimelockWallet.compile()

    // Prepare signer. 
    // See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
    const signer = new TestWallet(privateKey, new DefaultProvider({
        network: bsv.Networks.testnet
    }))

    // TODO: Adjust the amount of satoshis locked in the smart contract:
    const amount = 100
    const fatherAddr = getRandomAddress() 
    const motherAddr = getRandomAddress() 
    const brotherddr = getRandomAddress() 
     const sisterAddr = getRandomAddress() 
     const lockTimeMin = Math.round(new Date('2022-12-22').valueOf() / 1000)
    const instance = new TimelockWallet(
        Addr(fatherAddr.toByteString()), 
        Addr(motherAddr.toByteString()), 
        Addr(brotherddr.toByteString()), 
        Addr(sisterAddr.toByteString()),
        BigInt(lockTimeMin)
    )

    // Connect to a signer.
    await instance.connect(signer)

    // Contract deployment.
    const deployTx = await instance.deploy(amount)

    // Save deployed contracts script hash.
    const scriptHash = getScriptHash(instance.lockingScript.toHex())
    const shFile = `.scriptHash`;
    writeFileSync(shFile, scriptHash);

    console.log('Timelockwallet contract was successfully deployed!')
    console.log(`TXID: ${deployTx.id}`)
    console.log(`scriptHash: ${scriptHash}`)
}

main()
