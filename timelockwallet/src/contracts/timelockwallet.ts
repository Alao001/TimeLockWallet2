
import {
    Addr,
    assert,
    hash256,
    method,
    prop,
    PubKey,
    Sig,
    SmartContract,
    Utils,
    
} from 'scrypt-ts'
/*This contract is locking some funds that can not be distributed to the four Recipients addresses 
 untill after a specific period mature time has passeed or expired.
 The contract employ timelock mechanism in Bitcoin which ensure that the public method of
 a smart contract can not be called untill specific period of time has passed.
 */
export class TimelockWallet extends SmartContract {
    @prop()
    readonly father : Addr
    @prop()
    readonly mother: Addr
    @prop()
    readonly brother:Addr
    @prop()
    readonly sister: Addr
    @prop()
    readonly matureTime : bigint

    constructor(father : Addr, mother : Addr, brother:Addr,sister: Addr, matureTime : bigint) {
        super(...arguments)
        
        this.father = father
        this.mother = mother
        this.brother = brother
        this.sister = sister
        this.matureTime = matureTime
    }

    @method()
    public give(depositorSig : Sig, depositorPubkey : PubKey ) {

        assert(this.checkSig(depositorSig, depositorPubkey), ' depositor sig invalid')
        assert(this.timeLock(this.matureTime), 'time lock not yet expired')
         const amount = this.ctx.utxo.value
         const father_output = Utils.buildPublicKeyHashOutput(this.father, (amount * 35n)/100n)
         const mother_output = Utils.buildPublicKeyHashOutput(this.mother, (amount * 35n)/100n)
         const brother_output = Utils.buildPublicKeyHashOutput(this.brother, (amount * 15n)/100n)
         const sister_output = Utils.buildPublicKeyHashOutput(this.sister, (amount * 15n)/100n)
         const output = father_output + mother_output + brother_output + sister_output + this.buildChangeOutput()
         console.log('hashoutput:',this.debug.diffOutputs(output))
         assert(hash256(output) === this.ctx.hashOutputs, 'Hashoutput mismatch')
    }
}
