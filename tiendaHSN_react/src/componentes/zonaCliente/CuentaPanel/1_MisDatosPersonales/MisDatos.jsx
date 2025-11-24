import React, { useRef, useState } from "react";
import "./MisDatos.css";
import useGlobalState from "../../../../globalState/GlobalState";
import ReCAPTCHA from "react-google-recaptcha";

function MisDatos() {
  const { cliente, setCliente } = useGlobalState();
  if (!cliente) return <p>Cargando datos del cliente...</p>;
  
  const selectorImagen = useRef(null);
  const botonGuardarRef = useRef(null);
  const recaptchaRef = useRef();

  const [form, setForm] = useState({
    tipoCuenta: "particular",
    nombre: cliente.nombre || "",
    apellidos: cliente.apellidos || "",
    email: cliente.cuenta.email || "",
    telefonoContacto: cliente.cuenta.telefonoContacto || "",
    fechaNacimiento: cliente.fechaNacimiento || "",
    genero: cliente.genero || "",
    nifcif: "",
    nombreEmpresa: "",
    avatarUsuario: cliente.cuenta.imagenAvatar || "",
    fichImagenUsuario: null,
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  // Nuevo: variables para modificar el email
  const [emailSaved, setEmailSaved] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
    setSaved(false);
  };

  const validate = () => {
    const err = {};
    if (form.tipoCuenta === "particular") {
      if (!form.nombre?.trim()) err.nombre = 'Introduce tu nombre';
      if (!form.apellidos?.trim()) err.apellidos = 'Introduce tus apellidos';
    } else {
      if (!form.nombreEmpresa?.trim())
        err.nombreEmpresa = "Introduce el nombre de la empresa";
    }
    if (!form.email?.trim()) err.email = "Introduce tu email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Email inválido";
    if (!form.nifcif?.trim())
      err.nifcif =
        form.tipoCuenta === "empresa"
          ? "Introduce el CIF"
          : "Introduce el DNI";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      setSaved(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/Cliente/ModificarCliente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tipo: "datosPersonales",
          idCliente: cliente._id,
          nuevosDatos: form
        })
      });

      const data = await res.json();

      if (data?.clienteActualizado) {
        setCliente(data.clienteActualizado);
        setSaved(true);
      } else {
        setSaved(false);
      }
    } catch (error) {
      console.error("Error al guardar en la base de datos:", error);
      setSaved(false);
    }
  };

  const InputImagenOnChange = (ev) => {
    let _imagen = ev.target.files[0];
    let _lector = new FileReader();

    _lector.addEventListener("load", (evt) => {
      let _contenidoFichSerializado = evt.target.result;
      setForm((prev) => ({
        ...prev,
        avatarUsuario: _contenidoFichSerializado,
      }));
    });
    _lector.readAsDataURL(_imagen);
  };

  function onRecaptchaChange(value) {
    setCaptchaValue(value);
  }

  const handleEmailUpdate = async (e) => {
    e.preventDefault();

    if (!form.email?.trim()) {
      setErrors((prev) => ({ ...prev, email: "Introduce tu email" }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors((prev) => ({ ...prev, email: "Email inválido" }));
      return;
    }

    const captchaToken = recaptchaRef.current?.getValue();
    if (!captchaToken) {
      alert("Por favor, completa el reCAPTCHA antes de modificar el email.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/Cliente/ModificarEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idCliente: cliente._id,
          nuevoEmail: form.email,
          captchaToken
        })
      });
      const data = await res.json();
      if (data?.emailCambiado) {
        setEmailSaved(true);
        setErrors({});
      } else {
        setEmailSaved(false);
        setErrors((prev) => ({
          ...prev,
          email: data?.mensaje || "No se pudo modificar el email.",
        }));
      }
    } catch (err) {
      setEmailSaved(false);
      setErrors((prev) => ({
        ...prev,
        email: "Error del servidor modificando el email.",
      }));
    }
  };

  return (
    <div className="container">
      <div className="row m-4">
        <div className="col-12">
          <h5>Mis Datos Personales</h5>
          <hr></hr>
          <p>Aquí puedes ver y editar los datos de tu cuenta.</p>
        </div>
      </div>

      <div className="row m-4">
        <div className="col-12">
          <form className="mis-datos-form" onSubmit={handleSubmit} noValidate>
            {/* Tipo de cliente */}
            <div className="mb-3">
              <label className="form-label me-3">Tipo de cliente</label>
              <div className="form-check form-check-inline">
                <label
                  className="form-check-label"
                  htmlFor="clientParticular"
                  style={{
                    color: form.tipoCuenta === "particular" ? "#00b22d" : "#ccc",
                  }}
                >
                  Soy Particular
                  <input
                    className="form-check-input"
                    type="radio"
                    id="clientParticular"
                    name="tipoCuenta"
                    value="particular"
                    checked={form.tipoCuenta === "particular"}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                </label>
              </div>
              <div className="form-check form-check-inline">
                <label
                  className="form-check-label"
                  htmlFor="clientEmpresa"
                  style={{
                    color: form.tipoCuenta === "empresa" ? "#00b22d" : "#ccc",
                  }}
                >
                  Soy Empresa
                  <input
                    className="form-check-input"
                    type="radio"
                    id="clientEmpresa"
                    name="tipoCuenta"
                    value="empresa"
                    checked={form.tipoCuenta === "empresa"}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                </label>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="nombre">
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  type="text"
                  className="form-control"
                  placeholder="Nombre"
                />
                {errors.nombre && (
                  <div className="invalid-feedback d-block">
                    {errors.nombre}
                  </div>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="apellidos">
                  Apellidos
                </label>
                <input
                  id="apellidos"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  type="text"
                  className="form-control"
                  placeholder="Apellidos"
                />
                {errors.apellidos && (
                  <div className="invalid-feedback d-block">
                    {errors.apellidos}
                  </div>
                )}
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label" htmlFor="telefonoContacto">
                  Teléfono
                </label>
                <input
                  id="telefonoContacto"
                  name="telefonoContacto"
                  value={form.telefonoContacto}
                  onChange={handleChange}
                  type="tel"
                  className="form-control"
                  placeholder="+34 600 000 000"
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label" htmlFor="nifcif">
                  {form.tipoCuenta === "empresa" ? "CIF" : "DNI"}
                </label>
                <input
                  id="nifcif"
                  name="nifcif"
                  value={form.nifcif}
                  onChange={handleChange}
                  type="text"
                  className="form-control"
                  placeholder={form.tipoCuenta === "empresa" ? "CIF" : "DNI"}
                />
                {errors.nifcif && (
                  <div className="invalid-feedback d-block">
                    {errors.nifcif}
                  </div>
                )}
              </div>

              {form.tipoCuenta === "particular" && (
                <>
                  <div className="col-md-8 mb-3">
                    <label className="form-label" htmlFor="fechaNacimiento">
                      Genero
                    </label>
                    <select
                      className="form-select"
                      aria-label="Default select example"
                      onChange={handleChange}
                      name="genero"
                      value={form.genero}
                    >
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label" htmlFor="fechaNacimiento">
                      Fecha de nacimiento
                    </label>
                    <input
                      id="fechaNacimiento"
                      name="fechaNacimiento"
                      value={form.fechaNacimiento}
                      onChange={handleChange}
                      type="date"
                      className="form-control"
                    />
                  </div>
                </>
              )}
              <div className="col-md-4">
                <div className="text-muted">
                  {form.tipoCuenta == "particular"
                    ? "Foto"
                    : "Logo empresa"}
                </div>
                <div
                  id="avatarPerfil"
                  className="card"
                  style={{
                    width: "200px",
                    height: "250px",
                    backgroundColor: "aliceblue",
                  }}
                  onClick={() => selectorImagen.current.click()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={selectorImagen}
                    style={{ visibility: "hidden" }}
                    onChange={InputImagenOnChange}
                  />
                  <img
                    src={
                      form.avatarUsuario ||
                      "/images/imagen_usuario_sinavatar.jpg"
                    }
                    id="imagenUsuario"
                    style={{ objectFit: "cover" }}
                    alt="..."
                  />
                </div>
              </div>
            </div>

            {form.tipoCuenta === "empresa" && (
              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label" htmlFor="nombreEmpresa">
                    Nombre de la empresa
                  </label>
                  <input
                    id="nombreEmpresa"
                    name="nombreEmpresa"
                    value={form.nombreEmpresa}
                    onChange={handleChange}
                    type="text"
                    className="form-control"
                    placeholder="Razón social"
                  />
                  {errors.nombreEmpresa && (
                    <div className="invalid-feedback d-block">
                      {errors.nombreEmpresa}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="d-flex flex-row justify-content-end ">
              <button
                type="submit"
                ref={botonGuardarRef}
                className="btn btn-hsn-1 w-50"
              >
                <i className="fa-solid fa-check"></i> Guardar Cambios
              </button>
            </div>
            {saved && (
              <div className="text-danger">Datos guardados correctamente.</div>
            )}
          </form>
        </div>
      </div>

      <div className="row m-4">
        <div className="col-12">
          <h5>Editar Email</h5>
          <hr></hr>
          <p>
            Recibirás un email en tu cuenta actual para confirmar el cambio de dirección:
          </p>
        </div>
      </div>
      <form className="row m-4" onSubmit={handleEmailUpdate} noValidate>
        <div className="col-8">
          <input
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            className="form-control"
            placeholder="usuario@correo.com"
          />
          {errors.email && (
            <div className="invalid-feedback d-block">{errors.email}</div>
          )}
        </div>
        <div className="col-4 d-flex flex-row justify-content-end align-items-center">
          <button type="submit" className="btn btn-hsn-1 me-3">
            <i className="fa-solid fa-check"></i> MODIFICAR EMAIL
          </button>
          <div style={{ transform: "scale(0.85)" }}>
            <ReCAPTCHA
              sitekey="6LeZ-gcsAAAAAKH6b6BzQwJiw1SxFasmSynejkPg"
              onChange={onRecaptchaChange}
              ref={recaptchaRef}
            />
          </div>
        </div>
        {emailSaved && (
          <div className="text-success mt-2">Email modificado con éxito. Revisa tu correo para confirmar.</div>
        )}
      </form>
    </div>
  );
}

export default MisDatos;
