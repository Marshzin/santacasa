import React, { useState, useEffect } from "react";

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

  // Carregar pacientes salvos no localStorage após login
  useEffect(() => {
    if (logado) {
      const dadosSalvos = localStorage.getItem("pacientes");
      if (dadosSalvos) {
        setPacientes(JSON.parse(dadosSalvos));
      }
    }
  }, [logado]);

  // Salvar pacientes no localStorage sempre que mudarem (se estiver logado)
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
      // Editando paciente existente
      setPacientes((old) =>
        old.map((p) =>
          p.id === editandoId
            ? { id: editandoId, nome, leito, fc, fr, t, sat, pa, dx }
            : p
        )
      );
    } else {
      // Cadastrando paciente novo
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
        (p) => 
      <div style="margin-bottom:10px; padding:8px; border:1px solid #ddd; border-radius:6px;">
        <strong>${p.nome}</strong> — Leito: ${p.leito}<br/>
        FC: ${p.fc} | FR: ${p.fr} | T: ${p.t} | Sat: ${p.sat} | PA: ${p.pa}<br/>
        <strong>DX:</strong> ${p.dx.filter(Boolean).join(" | ")}
      </div>
      )
      .join("");

    const janela = window.open("", "_blank", "width=700,height=600");
    janela.document.write(
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
    );
    janela.document.close();
  };

  if (!logado) {
    return (
      <div style={styles.login}>
        <img src={logoUrl} alt="Logo" style={styles.logoLogin} />
        <h1 style={styles.setor}>Setor: Politrauma</h1>
        <button onClick={handleLogin} style={styles.loginButton}>
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <img src={logoUrl} alt="Logo" style={styles.logoHeader} />
        <h1 style={styles.title}>Santa Casa - Cadastro de Pacientes</h1>
      </header>

      <div style={styles.tabs}>
        <button
          style={abaAtiva === "cadastro" ? styles.tabActive : styles.tab}
          onClick={() => {
            limparFormulario();
            setAbaAtiva("cadastro");
          }}
        >
          Cadastro de paciente
        </button>
        <button
          style={abaAtiva === "lista" ? styles.tabActive : styles.tab}
          onClick={() => {
            limparFormulario();
            setAbaAtiva("lista");
          }}
        >
          Pacientes em leito
        </button>
      </div>

      <div style={styles.content}>
        {abaAtiva === "cadastro" && (
          <form onSubmit={handleCadastro} style={styles.form} autoComplete="off">
            <div style={styles.fullWidth}>
              <label style={styles.label}>Nome:</label>
              <input
                style={styles.input}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div style={styles.fullWidth}>
              <label style={styles.label}>Leito:</label>
              <select
                style={styles.input}
                value={leito}
                onChange={(e) => setLeito(e.target.value)}
              >
                {[...Array(8)].map((_, i) => {
                  const l = "L" + (i + 1);
                  const ocupado =
                    leitoOcupado(l) &&
                    (editandoId === null || pacientes.find(p => p.id === editandoId)?.leito !== l);
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
                    (editandoId === null || pacientes.find(p => p.id === editandoId)?.leito !== l);
                  return (
                    <option key={l} value={l} disabled={ocupado}>
                      {l} {ocupado ? "(Ocupado)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>FC:</label>
                <input
                  style={styles.input}
                  value={fc}
                  onChange={(e) => setFc(e.target.value)}
                />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>FR:</label>
                <input
                  style={styles.input}
                  value={fr}
                  onChange={(e) => setFr(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>T (Temperatura):</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    style={styles.buttonSmall}
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
                    style={{ ...styles.input, width: 80, textAlign: "center" }}
                    value={t}
                    onChange={(e) => setT(e.target.value)}
                  />
                  <button
                    type="button"
                    style={styles.buttonSmall}
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
              <div style={styles.col}>
                <label style={styles.label}>Sat:</label>
                <input
                  style={styles.input}
                  value={sat}
                  onChange={(e) => setSat(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.fullWidth}>
              <label style={styles.label}>PA:</label>
              <input
                style={styles.input}
                value={pa}
                onChange={(e) => setPa(e.target.value)}
              />
            </div>

            <div style={{ ...styles.fullWidth, marginTop: 10 }}>
              <label style={styles.label}>DX (Diagnósticos):</label>
              <div style={styles.dxContainer}>
                {dx.map((valor, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={DX ${i + 1}}
                    value={valor}
                    onChange={(e) => handleDxChange(i, e.target.value)}
                    style={styles.dxInput}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button type="submit" style={styles.button}>
                {editandoId ? "Concluir" : "Cadastrar"}
              </button>
              {editandoId && (
                <button
                  type="button"
                  style={{ ...styles.button, backgroundColor: "#999" }}
                  onClick={limparFormulario}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}

        {abaAtiva === "lista" && (
          <div style={styles.pacientes}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={styles.subtitle}>Pacientes Cadastrados</h2>
              <button onClick={handleImprimir} style={styles.printButton}>
                Imprimir
              </button>
            </div>

            {pacientes.length === 0 && <p>Nenhum paciente cadastrado.</p>}

            {pacientes.map((p) => (
              <div key={p.id} style={styles.card}>
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
                  style={styles.updateButton}
                >
                  Atualizar
                </button>
                <button
                  onClick={() => handleExcluir(p.id)}
                  style={styles.deleteButton}
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

const styles = {
  login: {
    height: "100vh",
    background: "#d7eaff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  logoLogin: {
    width: 160,
    marginBottom: 20,
  },
  setor: {
    fontSize: 24,
    color: "#346bbd",
    marginBottom: 30,
  },
  loginButton: {
    padding: "12px 28px",
    fontSize: 18,
    background: "#7AB8FF",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  dashboard: {
    fontFamily: "Arial, sans-serif",
    background: "#f0f8ff",
    minHeight: "100vh",
    paddingBottom: 60,
  },
  header: {
    background: "#7AB8FF",
    color: "#fff",
    padding: "20px 30px",
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  logoHeader: {
    width: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  tabs: {
    display: "flex",
    justifyContent: "center",
    marginTop: 20,
    gap: 20,
  },
  tab: {
    padding: "10px 24px",
    backgroundColor: "#b3d1ff",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    border: "none",
    color: "#346bbd",
  },
  tabActive: {
    padding: "10px 24px",
    backgroundColor: "#346bbd",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
    border: "none",
    color: "white",
  },
  content: {
    maxWidth: 800,
    margin: "30px auto",
    padding: 20,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  row: {
    display: "flex",
    gap: 20,
  },
  col: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  fullWidth: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: 4,
    fontWeight: "bold",
    color: "#346bbd",
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #add8ff",
    fontSize: 16,
  },
  button: {
    padding: "12px",
    backgroundColor: "#7AB8FF",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  buttonSmall: {
    width: 30,
    height: 30,
    borderRadius: 6,
    border: "none",
    backgroundColor: "#7AB8FF",
    color: "#fff",
    fontSize: 20,
    cursor: "pointer",
    userSelect: "none",
  },
  printButton: {
    padding: "8px 16px",
    backgroundColor: "#346bbd",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  deleteButton: {
    marginLeft: 10,
    padding: "6px 12px",
    backgroundColor: "#e74c3c",
    border: "none",
    color: "white",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },
  updateButton: {
    padding: "6px 12px",
    backgroundColor: "#3498db",
    border: "none",
    color: "white",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },
  dxContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    width: "100%",
    boxSizing: "border-box",
  },
  dxInput: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #add8ff",
    fontSize: 16,
    width: "100%",
    boxSizing: "border-box",
  },
  pacientes: {
    marginTop: 10,
  },
  card: {
    padding: 12,
    border: "1px solid #ddd",
    borderRadius: 8,
    marginBottom: 12,
  },
  subtitle: {
    marginBottom: 12,
    color: "#346bbd",
  },
};
