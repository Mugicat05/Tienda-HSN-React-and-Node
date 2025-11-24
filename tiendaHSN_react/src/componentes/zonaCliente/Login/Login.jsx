import './Login.css';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HTMLInput from '../../../componentes/compGlobals/InputBoxComponent/HTMLInput';
import useGlobalStore from '../../../globalState/GlobalState';
import ReCAPTCHA from 'react-google-recaptcha';

function Login() {
  const [formLogin, setFormLogin] = useState({});
  const { setCliente } = useGlobalStore();
  const recaptchaRef = useRef();
  const navigate = useNavigate();
  const [captchaValue, setCaptchaValue] = useState(null);

  function onchange(value) {
    const token = recaptchaRef.current.getValue();
    setCaptchaValue(token);
    if (token) {
      console.log('✅ Captcha completado:', token);
    }
  }

  function handlerOnChange(ev) {
    setFormLogin((prev) => ({
      ...prev,
      [ev.target.name]: ev.target.value
    }));
  }

  async function handlerOnSubmit(ev) {
    ev.preventDefault();

    const captchaToken = recaptchaRef.current.getValue();
    if (!captchaToken) {
      alert('Por favor, completa el reCAPTCHA antes de continuar.');
      return;
    }

    console.log('📩 Datos del formulario de login:', formLogin);

    try {
      const petNodeLogin = await fetch('http://localhost:3000/api/Cliente/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formLogin,
          captchaToken
        })
      });

      const resNodeLogin = await petNodeLogin.json();
      console.log('📦 Respuesta del servidor:', resNodeLogin);

      if (resNodeLogin.codigo !== 0) {
        throw new Error(`No se ha podido iniciar sesión: ${resNodeLogin.mensaje}`);
      }

      setCliente(resNodeLogin.datosCliente);
      navigate('/');
    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error.message);
    }
  }

  return (
    <div className="container my-5">
      <div className="border p-4">
        <div className="row">
          {/* Sección izquierda: acceso */}
          <div className="col-lg-6">
            {!captchaValue && (
              <div className="alert alert-warning" role="alert">
                Por favor, completa el reCAPTCHA para continuar.
              </div>
            )}
            <h1 style={{ color: '#e1522e' }} className="fw-bold mb-2">
              Acceso a mi cuenta HSN
            </h1>
            <p className="mb-4">
              Si ya eres usuario registrado, introduce tu email y la contraseña que
              utilizaste en el registro
            </p>
            <form className="needs-validation" noValidate onSubmit={handlerOnSubmit}>
              {['email', 'password'].map((el, pos) => (
                <HTMLInput
                  key={pos}
                  nameInput={el}
                  tipoInput={el === 'email' ? 'email' : 'password'}
                  labelInput={el === 'email' ? 'Correo electrónico' : 'Contraseña'}
                  eventoOnChange={handlerOnChange}
                />
              ))}

              <div className="recaptcha">
                <ReCAPTCHA
                  sitekey="6LeZ-gcsAAAAAKH6b6BzQwJiw1SxFasmSynejkPg"
                  onChange={onchange}
                  ref={recaptchaRef}
                />
              </div>

              <button
                type="submit"
                className="btn w-100"
                style={{
                  backgroundColor: '#fff',
                  borderColor: '#e1522e',
                  color: '#e1522e',
                  fontWeight: 600
                }}
              >
                INICIAR SESIÓN
              </button>

              <div className="mt-2 d-flex justify-content-between align-items-center">
                <a href="#" className="text-primary small">
                  ¿Olvidó su contraseña?
                </a>
                <span className="text-success small d-flex align-items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="me-1"
                  >
                    <path d="M8 1a3 3 0 00-3 3v2h6V4a3 3 0 00-3-3z" />
                    <path d="M3.5 8V7a1 1 0 011-1h7a1 1 0 011 1v1a1 1 0 011 1v5a1 1 0 01-1 1h-9a1 1 0 01-1-1V9a1 1 0 011-1z" />
                  </svg>
                  Conexión segura
                </span>
              </div>
            </form>
          </div>

          {/* Sección derecha: alta y redes */}
          <div className="col-lg-6 mt-4 mt-lg-0">
            <div className="p-4 bg-light h-100">
              <h5 className="fw-bold text-uppercase mb-1">
                ¿Todavía no tienes cuenta?
              </h5>
              <p className="mb-3">
                Acumula puntos, obtén descuentos exclusivos, recibe regalos sorpresa...
                todas estas ventajas y muchas más con la cuenta HSN
              </p>
              <button className="btn btn-success w-100 mb-4">
                CREAR UNA CUENTA
              </button>
              <h6 className="fw-bold text-uppercase mb-2">
                Crea o accede con tus redes sociales
              </h6>
              <button
                type="button"
                className="btn w-100 mb-2 d-flex align-items-center border"
                style={{ backgroundColor: '#fff', borderColor: '#dadce0' }}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  width={20}
                  height={20}
                  className="me-2"
                />
                <span className="flex-grow-1 text-center">
                  Continuar con Google
                </span>
              </button>
              <button
                type="button"
                className="btn w-100 d-flex align-items-center border"
                style={{ backgroundColor: '#fff', borderColor: '#dadce0' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="#1877F2"
                  className="me-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M12.73 2h-2.6C8.84 2 8.5 2.77 8.5 4v1H11l-.5 3H8.5v7H5.5V8H3.5V5h2v-.75C5.5 2.83 6.79 1 9.73 1H12v3z" />
                </svg>
                <span className="flex-grow-1 text-center">
                  Continuar con Facebook
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="small text-muted mt-4">
          Si haces clic en Continuar con Facebook, Google o Amazon y no eres usuario
          de HSN, pasarás a estar registrado y aceptas los{' '}
          <a href="#" className="text-primary text-decoration-underline">
            Términos y Condiciones
          </a>{' '}
          y la{' '}
          <a href="#" className="text-primary text-decoration-underline">
            Política de Privacidad
          </a>{' '}
          de HSN.
        </p>
      </div>
    </div>
  );
}

export default Login;
