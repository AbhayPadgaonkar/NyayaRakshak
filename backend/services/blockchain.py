from web3 import Web3
from pathlib import Path
import json
import os
import hashlib


EVIDENCE_TYPE_MAP = {
    "CCTV": 0,
    "FIR": 1,
    "LOG": 2,
    "DOCUMENT": 3
}

GANACHE_URL = "http://127.0.0.1:7545"  
CONTRACT_ADDRESS = "Your address"
if not CONTRACT_ADDRESS:
    raise Exception("CONTRACT_ADDRESS not set in environment")


w3 = Web3(Web3.HTTPProvider(GANACHE_URL))

if not w3.is_connected():
    raise Exception("Blockchain not connected. Is Ganache running?")

ACCOUNT = w3.eth.accounts[0] 



BASE_DIR = Path(__file__).resolve().parent
ABI_PATH = BASE_DIR / "CaseRegistry.json"

if not ABI_PATH.exists():
    raise FileNotFoundError(f"ABI file not found at {ABI_PATH}")

with open(ABI_PATH, "r") as f:
    ABI = json.load(f)["abi"]

contract = w3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS),
    abi=ABI
)



def sha256_bytes(data: bytes) -> str:
    """Create SHA256 hash for files (FIR / evidence)"""
    return hashlib.sha256(data).hexdigest()


def store_fir_hash_on_chain(fir_hash: str, police_station: str, ipc_sections: str):
    """
    Stores FIR hash on blockchain
    """
    tx = contract.functions.addFIR(
        fir_hash,
        police_station,
        ipc_sections
    ).transact({
        "from": ACCOUNT
    })

    receipt = w3.eth.wait_for_transaction_receipt(tx)

    return {
        "tx_hash": receipt.transactionHash.hex(),
        "block_number": receipt.blockNumber
    }


def store_evidence_hash_on_chain(file_hash: str,ev_type: str, desc=""):
  
    tx = contract.functions.addEvidence(
        file_hash,
        EVIDENCE_TYPE_MAP[ev_type],
        desc
    ).transact({"from": ACCOUNT})

    receipt = w3.eth.wait_for_transaction_receipt(tx)
    return receipt.transactionHash.hex()
