import React, { useState, useEffect } from "react";
import "./App.css";

const logoUrl = process.env.PUBLIC_URL + "/logo.png";

export default function App() {
  const [logado, setLogado] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("lista");

  const [pacientes, setPacientes] = useState([]);
  const [nome, setNome] = useState("");
  const [leito, setLeito] = useState("L1");
  const [fc, setFc] = useState("");
  const [fr, setFr] = useState("");
  const [t, setT] = useState("");
  const [sat, setSat] = useState("");
  const [pa, setPa] = useState("");
  const [dx, setDx] = useState(["", "", "", ""]);

  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    if (logado) {
      const dadosSalvos = localStorage.getItem("pacientes");
      if (dadosSalvos) {
        setPacientes(JSON.parse(dadosSalvos));
      }
    }
  }, [logado]);

  useEffect(() => {
    if (logado) {
      localStorage.setItem("pacientes", JSON.stringify(pacientes));
    }
  }, [pacientes, logado]);

  const handleLogin = () => {
    setLogado(true);
    setAbaAtiva("lista");
  };

  const handleDxChange = (i, val) => {
    const newDx = [...dx];
    newDx[i] = val;
    setDx(newDx);
  };

  const limparFormulario = () => {
    setNome("");
    setLeito("L1");
    setFc("");
    setFr("");
    setT("");
    setSat("");
    setPa("");
    setDx(["", "", "", ""]);
    setEditandoId(null);
  };

  const leitoOcupado = (l) =>
    pacientes.some((p) => p.leito === l && p.id !== editandoId);

  const handleCadastro = (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert("Digite o nome do paciente.");
      return;
    }
    if (leitoOcupado(leito)) {
      alert("Leito ocupado!");
      return;
    }
    if (editandoId) {
      setPacientes((old) =>
        old.map((p) =>
          p.id === editandoId
            ? { id: editandoId, nome, leito, fc, fr, t, sat, pa, dx }
            : p
        )
      );
    } else {
      const novoPaciente = {
        id: Date.now().toString(),
        nome,
        leito,
        fc,
        fr,
        t,
        sat,
        pa,
        dx,
      };
      setPacientes((old) => [...old, novoPaciente]);
    }
    limparFormulario();
    setAbaAtiva("lista");
  };

  const handleExcluir = (id) => {
    if (window.confirm("Excluir paciente?")) {
      setPacientes((old) => old.filter((p) => p.id !== id));
      if (editandoId === id) limparFormulario();
    }
  };

  const handleEditar = (p) => {
    setNome(p.nome);
    setLeito(p.leito);
    setFc(p.fc);
    setFr(p.fr);
    setT(p.t);
    setSat(p.sat);
    setPa(p.pa);
    setDx(p.dx.length === 4 ? p.dx : ["", "", "", ""]);
    setEditandoId(p.id);
    setAbaAtiva("cadastro");
  };

  const handleImprimir = () => {
    const conteudo = pacientes
      .map(
        (p) => `
      <div style="margin-bottom:10px; padding:8px; border:1px solid #ddd; border-radius:6px;">
        <strong>${p.nome}</strong> — Leito: ${p.leito}<br/>
        FC: ${p.fc} | FR: ${p.fr} | T: ${p.t} | Sat: ${p.sat} | PA: ${p.pa}<br/>
        <strong>DX:</strong> ${p.dx.filter(Boolean).join(" | ")}
      </div>`
      )
      .join("");

    const janela = window.open("", "_blank", "width=700,height=600");
    janela.document.write(`
      <html>
      <head>
        <title>Pacientes em Leito</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align:center; color:#346bbd; }
        </style>
      </head>
      <body>
        <h1>Pacientes em Leito</h1>
        ${conteudo}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);
    janela.document.close();
  };

  if (!logado) {
    return (
      <div className="login">
        <img src={logoUrl} alt="Logo" className="logoLogin" />
        <h1 className="setor">Setor: Politrauma</h1>
        <button onClick={handleLogin} className="loginButton">
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <img src={logoUrl} alt="Logo" className="logoHeader" />
        <h1 className="title">Santa Casa - Cadastro de Pacientes</h1>
      </header>

      <div className="tabs">
        <button
          className={abaAtiva === "cadastro" ? "tabActive" : "tab"}
          onClick={() => {
            limparFormulario();
            setAbaAtiva("cadastro");
          }}
        >
          Cadastro de paciente
        </button>
        <button
          className={abaAtiva === "lista" ? "tabActive" : "tab"}
          onClick={() => {
            limparFormulario();
            setAbaAtiva("lista");
          }}
        >
          Pacientes em leito
        </button>
      </div>

      <div className="content">
        {abaAtiva === "cadastro" && (
          <form onSubmit={handleCadastro} className="form" autoComplete="off">
            <div className="fullWidth">
              <label className="label">Nome:</label>
              <input
                className="input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="fullWidth">
              <label className="label">Leito:</label>
              <select
                className="input"
                value={leito}
                onChange={(e) => setLeito(e.target.value)}
              >
                {[...Array(8)].map((_, i) => {
                  const l = "L" + (i + 1);
                  const ocupado =
                    leitoOcupado(l) &&
                    (editandoId === null ||
                      pacientes.find((p) => p.id === editandoId)?.leito !== l);
                  return (
                    <option key={l} value={l} disabled={ocupado}>
                      {l} {ocupado ? "(Ocupado)" : ""}
                    </option>
                  );
                })}
                {[...Array(8)].map((_, i) => {
                  const l = "EX" + (i + 1);
                  const ocupado =
                    leitoOcupado(l) &&
                    (editandoId === null ||
                      pacientes.find((p) => p.id === editandoId)?.leito !== l);
                  return (
                    <option key={l} value={l} disabled={ocupado}>
                      {l} {ocupado ? "(Ocupado)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="row">
              <div className="col">
                <label className="label">FC:</label>
                <input
                  className="input"
                  value={fc}
                  onChange={(e) => setFc(e.target.value)}
                />
              </div>
              <div className="col">
                <label className="label">FR:</label>
                <input
                  className="input"
                  value={fr}
                  onChange={(e) => setFr(e.target.value)}
                />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label className="label">T (Temperatura):</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    className="buttonSmall"
                    onClick={() =>
                      setT((prev) =>
                        Math.round(((parseFloat(prev) || 0) - 0.1) * 10) / 10
                      )
                    }
                  >
                    -
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    className="input"
                    style={{ width: 80, textAlign: "center" }}
                    value={t}
                    onChange={(e) => setT(e.target.value)}
                  />
                  <button
                    type="button"
                    className="buttonSmall"
                    onClick={() =>
                      setT((prev) =>
                        Math.round(((parseFloat(prev) || 0) + 0.1) * 10) / 10
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="col">
                <label className="label">Sat:</label>
                <input
                  className="input"
                  value={sat}
                  onChange={(e) => setSat(e.target.value)}
                />
              </div>
            </div>

            <div className="fullWidth">
              <label className="label">PA:</label>
              <input
                className="input"
                value={pa}
                onChange={(e) => setPa(e.target.value)}
              />
            </div>

            <div className="fullWidth" style={{ marginTop: 10 }}>
              <label className="label">DX (Diagnósticos):</label>
              <div className="dxContainer">
                {dx.map((valor, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`DX ${i + 1}`}
                    value={valor}
                    onChange={(e) => handleDxChange(i, e.target.value)}
                    className="dxInput"
                  />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button type="submit" className="button">
                {editandoId ? "Concluir" : "Cadastrar"}
              </button>
              {editandoId && (
                <button
                  type="button"
                  className="button cancelButton"
                  onClick={limparFormulario}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}

        {abaAtiva === "lista" && (
          <div className="pacientes">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 className="subtitle">Pacientes Cadastrados</h2>
              <button onClick={handleImprimir} className="printButton">
                Imprimir
              </button>
            </div>

            {pacientes.length === 0 && <p>Nenhum paciente cadastrado.</p>}

            {pacientes.map((p) => (
              <div key={p.id} className="card">
                <strong>{p.nome}</strong> — Leito: {p.leito}
                <br />
                FC: {p.fc} | FR: {p.fr} | T: {p.t} | Sat: {p.sat} | PA: {p.pa}
                <br />
                <strong>DX:</strong>{" "}
                {p.dx.filter(Boolean).length > 0
                  ? p.dx.filter(Boolean).join(" | ")
                  : "—"}
                <br />
                <button
                  onClick={() => handleEditar(p)}
                  className="updateButton"
                >
                  Atualizar
                </button>
                <button
                  onClick={() => handleExcluir(p.id)}
                  className="deleteButton"
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
