import { useState } from "react";

function App() {
  const [step, setStep] = useState(1); // Paso del wizard
  const [grantUrl, setGrantUrl] = useState("");
  const [message, setMessage] = useState("");

  const [monto, setMonto] = useState("");
  const [concepto, setConcepto] = useState("");
  const [tipoServicioOtro, setTipoServicioOtro] = useState(""); // Campo adicional si elige "Otro"

  const [origen, setOrigen] = useState("USD");   // Moneda de la billetera
  const [destino, setDestino] = useState("MXN"); // Moneda a enviar
  const [tipoServicio, setTipoServicio] = useState("Transporte");

  const monedas = [
    { code: "PKR", label: "PKR (Pakistán)" },
    { code: "PEB", label: "PEB" },
    { code: "CAD", label: "CAD (Canadá)" },
    { code: "SGD", label: "SGD (Singapur)" },
    { code: "MXN", label: "MXN (México)" },
    { code: "GBP", label: "GBP (Reino Unido)" },
    { code: "ZAR", label: "ZAR (Sudáfrica)" },
    { code: "EUR", label: "EUR (Europa)" },
    { code: "USD", label: "USD (Estados Unidos)" }
  ];

  const tiposServicio = ["Transporte", "Comida", "Venta", "Alojamiento", "Otro"];

  const crearPago = async () => {
    const conceptoFinal = tipoServicio === "Otro" ? tipoServicioOtro : concepto;
    if (!monto || !conceptoFinal) {
      setMessage("Debes ingresar monto y concepto");
      return;
    }

    setMessage("Generando pago...");
    try {
      const res = await fetch("http://localhost:4000/pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto, concepto: conceptoFinal, origen, destino, tipoServicio }),
      });
      const data = await res.json();
      if (data.url) {
        setGrantUrl(data.url);
        setMessage("Abre el enlace para aceptar el pago y luego presiona 'Finalizar pago'.");
      } else {
        setMessage(data.error || "Error al crear pago");
      }
    } catch (err) {
      setMessage("Error de conexión con el servidor");
    }
  };

  const finalizarPago = async () => {
    setMessage("Finalizando pago...");
    try {
      const res = await fetch("http://localhost:4000/finalizar-pago", { method: "POST" });
      const data = await res.json();
      if (data.outgoingPayment) {
        setMessage("✅ Pago completado!");
        setStep(1); // Reinicia el wizard
      } else {
        setMessage(data.error || "Error al finalizar pago");
      }
    } catch (err) {
      setMessage("Error de conexión con el servidor");
    }
  };

  // Función para avanzar al paso 2 con validación
  const handleNextStep = () => {
    if (tipoServicio === "Otro" && tipoServicioOtro.trim() === "") {
      setMessage("Debes especificar el tipo de servicio");
      return;
    }
    setMessage("");
    setStep(2);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1> Propinas por servicios </h1>

      {/* Paso 1: Moneda y tipo de servicio */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: "10px" }}>
            <label>Moneda de tu billetera:</label>
            <select value={origen} onChange={(e) => setOrigen(e.target.value)} style={{ marginLeft: "10px" }}>
              {monedas.map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Moneda destino:</label>
            <select value={destino} onChange={(e) => setDestino(e.target.value)} style={{ marginLeft: "10px" }}>
              {monedas.map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Tipo de servicio:</label>
            <select value={tipoServicio} onChange={(e) => setTipoServicio(e.target.value)} style={{ marginLeft: "10px" }}>
              {tiposServicio.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Campo adicional si selecciona "Otro" */}
          {tipoServicio === "Otro" && (
            <div style={{ marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="Escribe el tipo de servicio"
                value={tipoServicioOtro}
                onChange={(e) => setTipoServicioOtro(e.target.value)}
              />
            </div>
          )}

          <button onClick={handleNextStep}>Continuar</button>
        </div>
      )}

      {/* Paso 2: Monto y concepto */}
      {step === 2 && (
        <div>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="number"
              placeholder="Monto"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              style={{ marginRight: "10px" }}
            />
            {tipoServicio !== "Otro" && (
              <input
                type="text"
                placeholder="Concepto"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
              />
            )}
          </div>
          <button onClick={crearPago}>Crear pago</button>
          <button onClick={() => setStep(1)} style={{ marginLeft: "10px" }}>Regresar</button>
        </div>
      )}

      {/* Paso 3: Mostrar grant y finalizar */}
      {grantUrl && (
        <div style={{ marginTop: "15px" }}>
          <p>Grant generado. Abre el enlace:</p>
          <a href={grantUrl} target="_blank" rel="noopener noreferrer">{grantUrl}</a>
          <br />
          <button onClick={finalizarPago} style={{ marginTop: "10px" }}>Finalizar pago</button>
        </div>
      )}

      {message && <p style={{ marginTop: "10px", fontWeight: "bold", color: "red" }}>{message}</p>}
    </div>
  );
}

export default App;
