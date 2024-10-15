import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const Healthcare = () => {
    const [contrato, setContrato] = useState(null);
    const [conta, setConta] = useState(null);
    const [proprietario, setProprietario] = useState(null); // Nome de estado com letra minúscula para consistência
    
    const enderecoContrato = "0xbc083ee2225777b899ab236f3e8534fa8462d093";
    
    const contratoABI = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "pacienteID",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "pacienteNome",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "diagnostico",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "tratamento",
                    "type": "string"
                }
            ],
            "name": "addRegistro",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "provider",
                    "type": "address"
                }
            ],
            "name": "autorizarProvedor",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "getProprietario",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "pacienteID",
                    "type": "uint256"
                }
            ],
            "name": "getRegistroPaciente",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "registroID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "pacienteNome",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "diagnostico",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "tratamento",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct HealthcareRegistro.Registro[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    useEffect(() => {
        const conectarCarteira = async () => {
            try {
                const provedor = new ethers.providers.Web3Provider(window.ethereum);
                await provedor.send('eth_requestAccounts', []);
                const signer = provedor.getSigner();

                const enderecoContas = await signer.getAddress();
                setConta(enderecoContas); // Correção do nome da variável

                const contrato = new ethers.Contract(enderecoContrato, contratoABI, signer); // Passa o signer ao contrato
                setContrato(contrato);

                const proprietarioEndereco = await contrato.getProprietario();

                setProprietario(enderecoContas.toLowerCase() === proprietarioEndereco.toLowerCase());
            } catch (error) {
                console.error("Erro ao conectar carteira:", error); // Melhor prática para depuração
            }
        };

        conectarCarteira(); // Chama a função de conexão dentro do useEffect
    }, []); // Adiciona um array vazio como dependência para que o efeito seja executado uma vez

    return (
        <div>
            <h1>Healthcare App</h1>
            <p>Conta: {conta}</p>
            <p>É proprietário: {proprietario ? "Sim" : "Não"}</p>
        </div>
    );
};

export default Healthcare;
