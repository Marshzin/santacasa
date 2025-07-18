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
          </div>
        `
      )
      .join("");

    const janela = window.open("", "_blank", "width=700,height=600");
    janela.document.write(`
      <html>
        <head>
          <title>Pacientes em Leito</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #346bbd; }
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
        {/* Aqui viriam os formulários e lista, omitido para brevidade */}
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
};
