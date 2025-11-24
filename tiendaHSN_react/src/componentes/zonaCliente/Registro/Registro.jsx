import './Registro.css'
import {useState} from 'react'
import HTMLInput from '../../compGlobals/InputBoxComponent/HTMLInput';

function Registro() {
  // ------------- variables de estado del componente -------------
  // const [nombre, setNombre] = useState('introduce tu nombre');
  // const [apellidos, setApellidos] = useState('introduce tus apellidos');
  // const [email, setEmail] = useState('tu email');
  // const [password, setPassword] = useState('');
  // const [genero, setGenero] = useState('');
  const [ formulario, setFormulario ] = useState( { tipoRegistro: 'cliente'} )


  // ------------ funciones manejadoras de eventos------------
    async function handlerSubmitButton(ev) {
    try {
    //submit campos del formulario a url externa 
    ev.preventDefault(); //<----- evita el comportamiento por defecto del evento submit del formulario: mandar datos a url externa y refrescar
    console.log(`variables del state del componente -> ${formulario}`);
    
    //mando datos al servidor de nodejs al servicio API-REST
    //#region ---- codigo con .then y .catch ----
    // fetch('http://localhost:3000/api/registro',
    //       {   
    //           method:'POST',
    //           headers:{
    //             'Content-Type':'application/json'
    //           },
    //           body: JSON.stringify( { nombre, apellidos, email, password, genero } ) //<---serializamos el objeto literal a texto para incluirlo en la peticion
    //         }
    //       ).then( respuesta => console.log(`respuesta del servidor: ${respuesta}`) )
    //        .catch( error => console.log(`error en la peticion: ${error}`) );
    //#endregion
    const respuesta=await fetch('http://localhost:3000/api/Cliente/Registro', //<--- el await espera valor de promesa correcto como el .then()
          {   
              method:'POST',
              headers:{
                'Content-Type':'application/json'
              },
              body: JSON.stringify( formulario ) //<---serializamos el objeto literal a texto para incluirlo en la peticion
            }
          );
    console.log(`respuesta del servidor: ${respuesta}`);
      
    } catch (error) { //<--- el catch captura cualquier error en el try, incluyendo error en la promesa, como el .catch()
      console.log(`error en la peticion: ${error}`);
    }

  }

  function OnChangeHandler(ev){
    console.log(`la variable de estado formulario vale: ${JSON.stringify(formulario)}`);
    console.log(`el evento onChange se ha disparado y el valor en la caja es....${ev.target.value}`);
    setFormulario( valorAnterior => { return { ...valorAnterior, [ev.target.name]: ev.target.value } }  ); //setFormulario( formulario.nombre=ev.target.value) } <--- kaska no funciona
  }

  return (
    <div className="container my-5">
      <div className="row">
        {/* Columna izquierda: introducción y redes sociales */}
        <div className="col-lg-5 mb-4 mb-lg-0">
          <h1 style={{ color: "#e1522e" }} className="fw-bold mb-3">
            Hola, ¿creamos tu cuenta?
          </h1>
          <p className="text-muted">
            Estás a punto de crear tu cuenta en HSNstore con lo que conseguirás
            acceder a promociones especiales, acumular puntos, y ahorrarte
            dinero...
          </p>
          <p>
            <a href="#" className="text-primary text-decoration-underline">
              Uy, si yo ya tengo una cuenta creada.
            </a>
          </p>
          {/* Lista de ventajas */}
          <div className="mb-3">
            {[
              "Accederás a promociones y descuentos antes que nadie.",
              "Acumularás puntos = dinero para futuras compras.",
              "Recibirás cupones, regalos sorpresa sólo para registrados.",
              "Podrás invitar a tus amigos y conseguir 5€ en futuras compras.",
              "Puedes cargar tus pedidos anteriores con un solo click.",
              "Y mucho más...",
            ].map((item, idx) => (
              <p key={idx} className="mb-2 d-flex align-items-start">
                <span
                  className="me-2"
                  style={{
                    color: "#e1522e",
                    fontSize: "1.1rem",
                    lineHeight: 1,
                  }}
                >
                  ✔
                </span>
                <span>{item}</span>
              </p>
            ))}
          </div>
          {/* Redes sociales */}
          <div className="p-3" style={{ backgroundColor: "#f5f5f5" }}>
            <h6 className="fw-bold text-uppercase mb-3">
              Crea o accede con tus redes sociales
            </h6>
            <button
              type="button"
              className="btn w-100 mb-2 d-flex align-items-center border"
              style={{ backgroundColor: "#fff", borderColor: "#dadce0" }}
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
              style={{ backgroundColor: "#fff", borderColor: "#dadce0" }}
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

        {/* Columna derecha: formulario de registro */}
        <div className="col-lg-7">
          <div className="border p-4">
            <h2 className="h5 fw-bold mb-3">Datos de identificación de cuenta</h2>
            {/* Selector de tipo de cuenta */}
            <div className="btn-group mb-2" role="group" aria-label="Tipo de cuenta">
              <button
                type="button"
                className="btn"
                style={{
                  borderColor: "#e1522e",
                  color: "#e1522e",
                  fontWeight: 600,
                }}
              >
                Particular
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  borderColor: "#b0b0b0",
                  color: "#b0b0b0",
                  fontWeight: 600,
                }}
                disabled
              >
                Empresa
              </button>
            </div>
            <p className="small text-danger">
              * Atención: si eres autónomo o empresa y necesitas una factura
              selecciona la opción EMPRESA.
            </p>
            {/* Formulario */}
            <form className="needs-validation" noValidate onSubmit={ handlerSubmitButton }>

                {
                  [ 'nombre', 'apellidos', 'email', 'password', 'planAmigo' ].map( ( campo, pos  ) =>
                    <HTMLInput  key={pos} 
                               nameInput={campo} 
                               labelInput={ campo==='planAmigo' ? 'Código Plan Amigo' : campo.charAt(0).toUpperCase() + campo.slice(1) } 
                               tipoInput={ campo==='email' ? 'email' : ( campo==='password' ? 'password' : 'text' ) } 
                               eventoOnChange={ OnChangeHandler } />
                  )

                }


              <div className="mb-3">
                <label htmlFor="genero" className="form-label">
                  Género <span className="text-danger">*</span>
                </label>
                <select
                  id="genero"
                  className="form-select"
                  name="genero"
                  defaultValue=""
                  onChange={ OnChangeHandler }
                  required
                >
                  <option value="" disabled>
                    Selecciona un género
                  </option>
                  <option>Hombre</option>
                  <option>Mujer</option>
                  <option>No binario</option>
                  <option>Prefiero no decirlo</option>
                </select>
                <div className="invalid-feedback">
                  Selecciona una opción.
                </div>
              </div>
              {/* Promociones y privacidad */}
              <h6 className="fw-bold">Enviar promociones especiales para clientes</h6>
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="promo"
                />
                <label className="form-check-label" htmlFor="promo">
                  Quiero recibir promociones exclusivas y contenidos personalizados
                </label>
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="privacidad"
                  required
                />
                <label className="form-check-label" htmlFor="privacidad">
                  He leído y acepto la{" "}
                  <a href="#" className="text-primary text-decoration-underline">
                    Política de privacidad
                  </a>
                </label>
                <div className="invalid-feedback">
                  Debes aceptar la política de privacidad.
                </div>
              </div>
              {
              /* Botón de envío 
              <button type="button" className="btn btn-success w-100" onClick={ handlerSubmitButton }>
                REGISTRARME YA
              </button>              
              */}
              <button type="submit" className="btn btn-success w-100">
                REGISTRARME YA
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro

              /* <div className="mb-3">
                <label htmlFor="nombre" className="form-label">
                  Nombre <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  name="nombre"
                  placeholder={formulario.nombre || "Intrduce tu nombre"}
                  onChange={ OnChangeHandler }//setFormulario( formulario.nombre=ev.target.value) } <--- kaska no funciona
                  required
                />
                <div className="invalid-feedback">Introduce tu nombre.</div>
              </div> *


              <div className="mb-3">
                <label htmlFor="apellido" className="form-label">
                  Apellidos <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="apellido"
                  name="apellidos"
                  placeholder={ formulario.apellidos || "Introduce tus apellidos"}
                  onChange={ OnChangeHandler   }//setFormulario( formulario.nombre=ev.target.value) } <--- kaska no funciona
                  required
                />
                <div className="invalid-feedback">Introduce tus apellidos.</div>
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="Email"
                  onChange={ OnChangeHandler }
                  required
                />
                <div className="invalid-feedback">
                  Introduce un email válido.
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Introduce tu contraseña <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type= "password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Introduce tu contraseña"
                    onChange={ OnChangeHandler }
                    required
                    minLength={8}
                  />
                  <button type="button" className="input-group-text bg-white border-start-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-eye-slash"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.359 11.238l2.122 2.122-1.414 1.414-2.122-2.122a8.455 8.455 0 01-5.945 2.112C4.998 14.764 2.63 13.633 1 12.143l1.5-1.5c1.236 1.059 2.851 1.821 4.5 2.021v.002c.376.055.764.085 1.156.085.393 0 .78-.03 1.156-.085v-.003a8.456 8.456 0 005.148-2.471zM3.738 4.523l-2.122-2.122 1.414-1.414 2.122 2.122A8.455 8.455 0 018.5 1.236 8.455 8.455 0 0114.357 3.8l-1.5 1.5a8.456 8.456 0 00-5.148-2.471L8.5 2.828a2.5 2.5 0 00-3.535 0L3.738 4.523zm8.354.976l1.5 1.5a8.455 8.455 0 01.006 4.638l-1.494-1.494a5.471 5.471 0 00-.013-1.65l-1.008-1.008a5.5 5.5 0 00-7.748-.87l-1.502-1.502a8.456 8.456 0 015.148-2.471z" />
                      </svg>
                  </button>
                </div>
                <div className="invalid-feedback">
                  La contraseña debe tener al menos 8 caracteres.
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="planAmigo" className="form-label">
                  Código Plan Amigo
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="planAmigo"
                  name="planAmigo"
                  placeholder="Código Plan Amigo"
                  style={{ borderStyle: "dashed" }}
                  onChange={ OnChangeHandler }
                />
              </div>

              */
