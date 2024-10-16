import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const Healthcare = () => {
    const [contrato, setContrato] = useState(null);
    const [conta, setConta] = useState(null);
    const [proprietario, setProprietario] = useState(null);
    const [enderecoProvedor, setProvedorEndereco] = useState("");
    const [pacienteID, setPacienteID] = useState(""); // Mantido para buscar registros
    const [pacienteNome, setPacienteNome] = useState(""); // Nome do paciente para adicionar registro
    const [registrosPaciente, setRegistrosPaciente] = useState([]);
    const [diagnostico, setDiagnostico] = useState("");
    const [tratamento, setTratamento] = useState("");

    const enderecoContrato = "0x54e2db6b8fc23d0f6e1ada4d58f69e4b56caa9a3";

    const contratoABI = [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "pacienteID",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "registroID",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "pacienteNome",
                    "type": "string"
                }
            ],
            "name": "RegistroAdicionado",
            "type": "event"
        },
        {
            "inputs": [
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

                const enderecoConta = await signer.getAddress();
                setConta(enderecoConta);

                const contrato = new ethers.Contract(enderecoContrato, contratoABI, signer);
                setContrato(contrato);

                const proprietarioEndereco = await contrato.getProprietario();
                setProprietario(enderecoConta.toLowerCase() === proprietarioEndereco.toLowerCase());
            } catch (error) {
                console.error("Erro ao conectar carteira:", error);
            }
        };
        conectarCarteira();
    }, []);

    const buscarRegistroPaciente = async () => {
        try {
            if (!pacienteID) {
                alert("Por favor, insira o ID do paciente.");
                return;
            }

            const registros = await contrato.getRegistroPaciente(pacienteID);
            console.log(registros);
            setRegistrosPaciente(registros);
        } catch (error) {
            console.error("Erro ao buscar registro do paciente:", error);
        }
    };

    const addRegistro = async () => {
        try {
            if (!pacienteNome || !diagnostico || !tratamento) {
                alert("Nome do paciente, diagnóstico e tratamento são obrigatórios.");
                return;
            }

            const tx = await contrato.addRegistro(pacienteNome, diagnostico, tratamento);
            await tx.wait();
            alert(`Registro adicionado para o paciente ${pacienteNome}!`);
        } catch (error) {
            console.error("Erro ao adicionar registro:", error);
        }
    };

    const autorizarProvedor = async () => {
        if (proprietario) {
            try {
                const tx = await contrato.autorizarProvedor(enderecoProvedor);
                await tx.wait();
                alert(`Provedor ${enderecoProvedor} autorizado!`);
            } catch (error) {
                console.error("Erro ao autorizar provedor:", error);
            }
        } else {
            alert("Somente o proprietário pode autorizar provedores.");
        }
    };

    return (
        <div className="container">
            <h1>Healthcare Registro</h1>
            {conta && <p>Conta conectada: {conta}</p>}
            {proprietario && <p>Você é o proprietário do contrato</p>}

            <div className="form-section">
                <h2>Buscar registro do paciente</h2>
                <input
                    className="input-field"
                    type="text"
                    placeholder="Insira o ID do paciente"
                    value={pacienteID}
                    onChange={(e) => setPacienteID(e.target.value)}
                />
                <button className="action-button" onClick={buscarRegistroPaciente}>Procurar registros</button>
            </div>

            <div className="form-section">
                <h2>Adicionar registro do paciente</h2>
                <input
                    className="input-field"
                    type="text"
                    placeholder="Nome do Paciente"
                    value={pacienteNome}
                    onChange={(e) => setPacienteNome(e.target.value)}
                />
                <input
                    className="input-field"
                    type="text"
                    placeholder="Diagnóstico"
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                />
                <input
                    className="input-field"
                    type="text"
                    placeholder="Tratamento"
                    value={tratamento}
                    onChange={(e) => setTratamento(e.target.value)}
                />
                <button className="action-button" onClick={addRegistro}>Adicionar Registro</button>
            </div>

            <div className="form-section">
                <h2>Autorizar Provedor</h2>
                <input
                    className="input-field"
                    type="text"
                    placeholder="Endereço do Provedor"
                    value={enderecoProvedor}
                    onChange={(e) => setProvedorEndereco(e.target.value)}
                />
                <button className="action-button" onClick={autorizarProvedor}>Autorizar Provedor</button>
            </div>

            <div className="records-section">
                <h2>Registros do paciente</h2>
                {registrosPaciente.map((registro, index) => (
                    <div key={index}>
                        <p>Registro ID: {registro.registroID.toString()}</p>
                        <p>Nome do Paciente: {registro.pacienteNome}</p>
                        <p>Diagnóstico: {registro.diagnostico}</p>
                        <p>Tratamento: {registro.tratamento}</p>
                        <p>Timestamp: {new Date(registro.timestamp.toNumber() * 1000).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Healthcare;
