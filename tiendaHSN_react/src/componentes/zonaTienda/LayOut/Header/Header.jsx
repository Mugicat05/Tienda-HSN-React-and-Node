import React, { useEffect, useState,useRef } from 'react';
import {Link, Navigate, useLoaderData} from 'react-router-dom';
import './Header.css';
import useGlobalState from '../../../../globalState/GlobalState';


const Header = () => {
  const { pedido, cliente }=useGlobalState(); // const pedidoActual = useGlobalState( state => state.pedidoActual );
  //#region ------------------- STATE DEL COMPONENTE ---------------------
  //const [ categorias, setCategorias] = useState([]); // categorias principales
  const categorias=useLoaderData(); // categorias principales recuperadas por el loader de la ruta padre (Layout.jsx)
  const [subcats, setSubCats] = useState([]); // subcategorias de la categoria principal activa
  
  const hideTimer = useRef(null); // timer para ocultar el mega panel
  const [activeParent, setActiveParent] = useState(null); // pathCategoria activa
  const [showPanel, setShowPanel] = useState(false); // mostrar/ocultar mega panel
  
  //#endregion ------------------------------------------------------------
  
  //#region ------------------- EFECTOS DEL COMPONENTE ---------------------
  // useEffect(
  //   ()=>{
  //       console.log('EFECTO dentro del HEADER.JSX para recuperar categorias principales desde nodejs solo UNA VEZ al montar el componente');

  //       fetch('http://localhost:3000/api/Tienda/Categorias?pathCat=principales',{ method:'GET'})
  //       .then( async  respuestaServer =>{
  //         let bodyRespuesta= await respuestaServer.json(); //<-- formato: { codigo:.., mensaje:.., categorias:[ .. ]}
  //         console.log(`respuesta del server de node: ${JSON.stringify(bodyRespuesta)}`);
          
  //         if (bodyRespuesta.codigo !== 0) throw new Error( bodyRespuesta.mensaje);
          
  //         setCategorias( bodyRespuesta.categorias );
  //       } )
  //       .catch( errorFetch => {
  //           console.log(`error en la peticion fetch de categorias principales: ${errorFetch.message}`);
  //           setCategorias( [] );
  //       })

  //     }, //<--- 1º parametro: funcion que se ejecuta en el efecto para recuperar cats.principales
  //   []  //<--- 2º parametro: array de dependencias (si esta vacio se ejecuta solo una vez al montar el componente)
  // )
      useEffect(
    () => {
      async function fetchSubcategories() {
        if(!activeParent) { setSubCats([]); return;}
        try {
          let response = await fetch(`http://localhost:3000/api/Tienda/Categorias?pathCat=${encodeURIComponent(activeParent)}`);
          if (!response.ok) throw new Error(`error al obtener subcategorias ${response.status}`);
          let respBody = await response.json();
          console.log('Subcategorias cargadas para: ', activeParent, respBody.categorias);
          // Aquí podrías actualizar el estado para almacenar las subcategorías y renderizarlas en el panel
          if(respBody.codigo !==0) throw new Error(`error en la respuesta al obtener subcategorias, ${respBody.mensaje}`);

          let subcats=[]; 
          respBody.categorias
                  .sort( (a,b)=>  a.pathCategoria > b.pathCategoria ? 1 : -1)
			            .forEach( 
                      cat => { 
				                  if ( /^\d+-\d+$/.test(cat.pathCategoria)){
					                    //categoría de 2º nivel, añadimos propiedad 'subcategorias':
						                  subcats.push( { ...cat, subcategorias:[] } );
					                } else {
						                  //categoría terciaria a procesar y a añadir a array 'subcategorias' creado arriba
				                      let catppal=subcats.find( c=> new RegExp(`${cat.pathCategoria.split('-').slice(0,2).join('-')}$`).test(c.pathCategoria));	
				                      //console.log('categoría ppal a la q pertence subcat..',cat.pathCategoria.split('-').slice(0,2).join('-'), catppal);				
				                      catppal['subcategorias'].push(cat);
					                } 
                     }
                  );

          console.log('Subcategorias procesadas: ', subcats);
          setSubCats(subcats);

        } catch (error) {
          console.error('Error cargando subcategorías:', error);
          setSubCats([]);
        }
      }
      fetchSubcategories();

  }, [activeParent]);
  //#endregion ------------------------------------------------------------

  //#region -------------------- codigo JS propio del componente -----------
  
  //#region ------------------- funciones manejadoras de eventos -----------
    const handleEnterParent = (categoria) => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setActiveParent(categoria.pathCategoria);
    setShowPanel(true);
  };

  const handleLeaveAll = () => {
    // esperar un poco antes de ocultar para permitir mover el raton al panel
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setShowPanel(false);
      setActiveParent(null);
      hideTimer.current = null;
    }, 180);
  };

  const handleEnterPanel = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setShowPanel(true);
  };

  const handleLeavePanel = () => {
    handleLeaveAll();
  };
  //#endregion ------------------------------------------------------------

  //#endregion ------------------------------------------------------------

  return (
    <div className='container'>

      <div className='row'>
        <div className='col d-flex flex-row justify-content-between' style={{ color: '#999', borderBottom:'1px solid #f1f1f1', fontWeight:'400', fontFamily:'"Roboto","Open Sans",sans-serif' }}>          
          <div><p>Envio gratuito a partir de 29,99€*</p></div>
          <div><p style={{ textAlign:'center'}}><a href="https://www.hsnstore.com/contacts" style={{ textDecoration:'underline', color:'inherit' }}>Contacta con nosotros aqui</a></p></div>
          <div>
            {
              cliente ? (
                <>                
                  <div className="dropdown">
                    <button className="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <span >Hola, {cliente.nombre} {cliente.apellidos} ({cliente.cuenta.email})</span>
                    </button>
                    <ul className="dropdown-menu">
                      {
                        ['Mis datos personales', 'Mis Pedidos', 'Mis Tickets', 'Plan Ahorro', 'Libreta de direcciones', 'Guardados para luego', 'Mis favoritos', 'Puntos HSN', 'Plan Amigo', 'SALIR'].map( (item,pos) => 
                          <li key={pos}><a className="dropdown-item" href={`/Cliente/Cuenta/${item.replace(/\s+/g, '').toLowerCase()}`}><span style={{ fontSize: '0.9em' }}>{item}</span></a></li>
                        )
                      }
                    </ul>
                  </div>                  
                </>
              ) : (
                <>                
                  <a href="/Cliente/Login" style={{  marginRight:8 }}>Iniciar sesión</a>
                  <a href="/Cliente/Registro" >Crear Cuenta</a>
                </>
              )
            }
          </div>
        </div>
      </div> 

      <div className='row'>
          <div className='col'>
              {/* Main navbar */}
              <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
                  <div className="container">
                  <Link className="navbar-brand d-flex align-items-center" to="/">
                      <img src="https://www.hsnstore.com/skin/frontend/default/hsnreborn/images/logoHSNReduced.svg" alt="HSN" style={{ width:115,height: 40, marginRight: 8 }} />
                  </Link>

                  <form className="d-none d-lg-flex flex-grow-1 mx-3">
                      <div className="input-group w-100">
                      <input type="search" className="form-control" placeholder="Buscar por: Producto, Objetivo, Ingrediente..." aria-label="Buscar" />
                      <button className="btn btn-outline-secondary" type="submit">Buscar</button>
                      </div>
                  </form>

                  <div className="d-flex align-items-center">
                      <Link to="/Pedido/PedidoActual" className="text-muted me-2 position-relative">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-cart-fill" viewBox="0 0 16 16">
                          <path d="M0 1.5A.5.5 0 0 1 .5 1h1a.5.5 0 0 1 .485.379L2.89 5H14.5a.5.5 0 0 1 .491.592l-1.5 6A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L1.01 1.607 1 1.5H.5zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                      </svg>
                      {/* en hsn oficial en el icono del carrito no aparecen el numero de elemento sino SUMA CANTIDADES...ERROR TOTAL!!! */}
                      <span className="badge bg-danger rounded-pill position-absolute hsn-cart-badge">{ pedido.itemsPedido.length }</span>
                      </Link>
                  </div>
                  </div>
              </nav>
          </div>
      </div>

      <div className='row'>
        <div className='col'>
          {/* Categories navbar */}
          <div className=" border-bottom">
            <div className="container">
              <ul id="catsppales" className="nav d-flex align-items-center overflow-auto" style={{ whiteSpace: 'nowrap' }}>


                { categorias.length > 0 && categorias.map((categoria,pos) => (
                  <li
                    className="nav-item"
                    key={pos}
                    onMouseEnter={() => handleEnterParent(categoria)}
                    onMouseLeave={() => handleLeaveAll()}
                  >
                    <Link className={`nav-link px-3 ${activeParent === categoria.pathCategoria ? 'active' : ''}`} to={`/Productos/${encodeURIComponent(categoria.pathCategoria)}`}>
                      <span className="catsppales">{categoria.nombreCategoria} <i className='fa-solid fa-chevron-down'></i></span>   
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mega panel: aparece bajo la barra de categorias */}
      { showPanel && subcats.length > 0 && (
        <>
          <div className='heading2'>Selecciona Categoria</div>
          <div className='menucontainer'
              onMouseEnter={handleEnterPanel}
              onMouseLeave={handleLeavePanel}
          >          
            <ul>
              {
                subcats.map(
                              (subcat,pos) => <li key={pos} className='first-lvl'>
                                                <Link to={`/Productos/${encodeURIComponent(subcat.pathCategoria)}`}>{subcat.nombreCategoria}</Link>
                                                {
                                                  subcat.subcategorias.length > 0 && (
                                                  <ul>
                                                    {subcat.subcategorias.map((tercat, tercpos) => (
                                                      <li key={tercpos} style={{borderBottom:'none', font:'normal 10px "Roboto","Open Sans",sans-serif', color:'#666'}}>
                                                        <Link to={`/Productos/${encodeURIComponent(tercat.pathCategoria)}`}>{tercat.nombreCategoria}</Link>
                                                      </li>
                                                    ))}
                                                  </ul>                                                  
                                                  )
                                                }
                                            </li>
                            )
              }
            </ul>
          </div>
        </>

      )}

    </div>
  );

};

export default Header;
