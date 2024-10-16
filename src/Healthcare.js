import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const Healthcare = () => {
    const [contrato, setContrato] = useState(null);
    const [conta, setConta] = useState(null);
    const [proprietario, setProprietario] = useState(null); // Nome de estado com letra minúscula para consistência
    const [enderecoProvedor, setProvedorEndereco] = useState("");
    const [pacienteID, setPacienteID] = useState("");
    const [registrosPaciente, setRegistrosPaciente] = useState([]);
    const [diagnostico, setDiagnostico] = useState("");
    const [tratamento, setTratamento] = useState("");

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


    const buscarRegistroPaciente = async () => {
        try {
            const registros = await contrato.getRegistroPaciente(pacienteID);
            console.log(registros);
            setRegistrosPaciente(registros);

        } catch (error) { 
            console.error("Erro ao buscar registro do paciente:", error)
        }
    }

    const addRegistro = async () => {
        try {
            const tx = await contrato.addRegistro(pacienteID, "", diagnostico, tratamento);
            await tx.wait();
            buscarRegistroPaciente();
            await tx.wait();
            alert(`Provedor ${enderecoProvedor} autorizado!`);
        } catch (error) {
            console.error("Erro ao adicionar registro:", error);
        }
    }

    const autorizarProvedor = async () => {
        if (proprietario) {
            try {
                const tx = await contrato.autorizarProvedor(enderecoProvedor);
                await tx.wait();
                alert(`Provedor ${enderecoProvedor} autorizado!`);
            } catch (error) {
                console.error("Somente proprietado do contrato pode autorizar diferentes provedores", error);
            }
        } else {
            alert("Somente proprietario do contrato pode chamar essa função");
        }
    }


    return (
        <div className="container">
            <h1 className="title">Healthcare Aplicativo</h1>
            {conta && <p className="account-info">Conta conectada: {conta}</p>}
            {proprietario && <p className="owner-info">Você é o proprietario do contrato</p>}

            <div className="form-section">
                <h2>Buscar registro do paciente</h2>
                <input className="input-field" type="text" placeholder="Insira o ID do paciente" value={pacienteID} onChange={(e) => setPacienteID(e.target.value)}></input>
                <button className="action-button" onClick={buscarRegistroPaciente}>Procurar registros</button>
            </div>

            <div className="form-section">
                <h2>Adicionar registro do paciente</h2>
                <input className="input-field" type="text" placeholder="Diagnosticos" value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)}></input>
                <input className="input-field" type="text" placeholder="Tratamento" value={tratamento} onChange={(e) => setTratamento(e.target.value)}></input>
                <button className="action-button" onClick={addRegistro}>Adicionar registros</button>

            </div>


            <div className="form-section">
                <h2>Autorizar provedor Healthcare</h2>
                <input className="input-field" type="text" placeholder="Endereço do provedor" value={enderecoProvedor} onChange={(e) => setProvedorEndereco(e.target.value)} />
                <button className="action-button" onClick={autorizarProvedor}>autorizar Provedor</button>
            </div>

            <div className="records-section">
                <h2>Registros do paciente</h2>
                {registrosPaciente.map((registro, index) => (
                <div key = {index}>
                    <p>Registro ID: {registro.registroID.toNumber()}</p>
                    <p>diagnostico: {registro.diagnostico}</p>
                    <p>Tratamento: {registro.tratamento}</p>
                    <p>Timestamp: {new Date(registro.timestamp.toNumber() * 1000).toLocaleString()}</p>
            </div>
            ))}
            </div>
        </div>
    );
};

export default Healthcare;
