
import { TimelockWallet } from './contracts/timelockwallet';
import { Addr, PandaSigner, ScryptProvider, bsv ,findSig,PubKey,MethodCallOptions, 
  getRandomAddress, Utils, toHex} from 'scrypt-ts';
import { Button } from '@mui/material';


function App() {

  const handleGive = async () => {
    try {
      const provider = new ScryptProvider()
      const signer = new PandaSigner(provider)
      const { isAuthenticated, error } = await signer.requestAuth()
    if (!isAuthenticated) {
      throw new Error(`Unauthenticated: ${error}`)
    }

    const myPublicKey = await signer.getDefaultPubKey()
    let instance: TimelockWallet
    const fatherAddr = getRandomAddress() 
    const motherAddr = getRandomAddress() 
    const brotherddr = getRandomAddress() 
     const sisterAddr = getRandomAddress() 
     const lockTimeMin = Math.round(new Date('2023-12-22').valueOf() / 1000)
     
     instance = new TimelockWallet( 
      Addr(fatherAddr.toByteString()), 
      Addr(motherAddr.toByteString()), 
      Addr(brotherddr.toByteString()), 
      Addr(sisterAddr.toByteString()),
      BigInt(lockTimeMin)
    ) 
   await instance.connect(signer) 
   instance.bindTxBuilder(
    'give', 
    async(
      current : TimelockWallet,
        options: MethodCallOptions<TimelockWallet>,
    ) =>{
        const defaultChangeAddress = await current.signer.getDefaultAddress()
        const father_output = (amount * 35)/100
        const mother_output = (amount * 35)/100
        const brother_output = (amount * 15)/100
        const sister_output = (amount * 15)/100

        const unsignedTx: bsv.Transaction = new bsv.Transaction()
        //add contract input
        .addInput(current.buildContractInput(options.fromUTXO))
        //build father output
        .addOutput( new bsv.Transaction.Output({
            script: bsv.Script.fromHex(Utils.buildPublicKeyHashScript(current.father)),
            satoshis : Number(father_output)
        }))
        //build mother output
        .addOutput( new bsv.Transaction.Output({
            script: bsv.Script.fromHex(Utils.buildPublicKeyHashScript(current.mother)),
            satoshis : Number(mother_output)
        }))
        //build brother output
        .addOutput( new bsv.Transaction.Output({
            script: bsv.Script.fromHex(Utils.buildPublicKeyHashScript(current.brother)),
            satoshis : Number(brother_output)
        }))
        //build sister output
        .addOutput( new bsv.Transaction.Output({
            script: bsv.Script.fromHex(Utils.buildPublicKeyHashScript(current.sister)),
            satoshis : Number(sister_output)
        }))

        if (options.lockTime) {
            unsignedTx.setLockTime(options.lockTime)
        }
        unsignedTx.setInputSequence(0,0)
        //build change output
        .change(options.changeAddress || defaultChangeAddress)
        return {
            tx: unsignedTx,
            atInputIndex : 0,
            nexts:[]
        }
      });
      //200 satoshis is locked and deployed in deployed
      const amount = 200
      const deployTx = await instance.deploy(amount);
      console.log(`Smart contract successfully deployed with txid ${deployTx.id}`);
        
        const today = Math.round(new Date().valueOf() / 1000)

        //call the public method
        const { tx: callTx } = await instance.methods.give(
          // the first argument `sig` is replaced by a callback function which will return the needed signature
          (sigResps) => findSig(sigResps, myPublicKey),
      
          // the second argument is still the value of `pubkey`
          PubKey(toHex(myPublicKey)),
          {
              // A request for signer to sign with the private key corresponding to a public key
              pubKeyOrAddrToSign: myPublicKey,
              lockTime : today 
          } as MethodCallOptions<TimelockWallet>
      );
    
      console.log('contract called: ', callTx.id);
          
    }  
    catch (error: any) {
      console.error("Lock time not yet expired: ", error);
    } 
     
  };
  
  return (
    <div className="App">
      <var >
            <div style={{display: 'center', height: '140px', padding: '30px 250px',
            alignItems: 'center', background : 'greenyellow', textAlign: 'center'  }}className="container">
           <h1> Timelock Wallet</h1>
            </div>
          </var>
          <div style={{ height: '100vh', display: 'center', textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>
            <h3>A digital wallet that incorporates a time-based locking mechanism for funds</h3>
            <h3> The funds stored in the wallet have a specific time constraint or mature period  <br />
              before it can be transfered to recipients addresses
            </h3>
          <Button variant="contained" size="large" onClick={handleGive}>
            Deploy & Give
          </Button>
        </div>
      
    </div>
  );
}

export default App;
