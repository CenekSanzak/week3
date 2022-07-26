//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const {  assert, expect } = require("chai");
const wasm_tester = require("circom_tester").wasm;
const {buildPoseidon} = require("circomlibjs");


const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("MastermindVariation Circuit", function () {
    let privSalt, fakeSalt, circuit, poseidon, F


    beforeEach(async function () {
        privSalt = ethers.BigNumber.from("0x0000000000000000000000000000000000000000000000000000000000000abc")
        fakeSalt = ethers.BigNumber.from("0x0000000000000000000000000000000000000000000000000000000000000def")
        poseidon = await buildPoseidon()
        F = poseidon.F
        circuit = await wasm_tester("contracts/circuits/MastermindVariation.circom") // Wasm_tester object for the MastermindVariation circuit

    });

    it("It should return the correct solution hash and return true if everything is correct", async function () {
        
        pubSolnHash = F.toObject(poseidon([privSalt, 1,2,3,4,5]))

        const Input = {
            pubGuessA: 1,
            pubGuessB: 2,
            pubGuessC: 3,
            pubGuessD: 4,
            pubGuessE: 5,
            pubNumHit: 5,
            pubNumBlow: 0,
            pubSolnHash,
            privSolnA: 1,
            privSolnB: 2,
            privSolnC: 3,
            privSolnD: 4,
            privSolnE: 5,
            privSalt
        }

        const witness = await circuit.calculateWitness(Input, true); // Calculates the witness for the circuit

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1))); // Sanity Check
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(pubSolnHash)));            
    });
    it("It should throw an assertion error if salt is different", async function () {
        
        pubSolnHash = F.toObject(poseidon([privSalt, 1,2,3,4,5]))

        const Input = {
            pubGuessA: 1,
            pubGuessB: 2,
            pubGuessC: 3,
            pubGuessD: 4,
            pubGuessE: 5,
            pubNumHit: 5,
            pubNumBlow: 0,
            pubSolnHash,
            privSolnA: 1,
            privSolnB: 2,
            privSolnC: 3,
            privSolnD: 4,
            privSolnE: 5,
            privSalt: fakeSalt
        }
        try{
            await circuit.calculateWitness(Input, true);
            assert(false);
        }
        catch(e){
            assert(true);
        }
    });

});
