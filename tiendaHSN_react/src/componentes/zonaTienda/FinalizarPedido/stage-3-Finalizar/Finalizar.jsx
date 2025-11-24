import './Finalizar.css'
import useGlobalStore from '../../../../globalState/GlobalState';
import { useRef,useEffect } from 'react';
import { useNavigate} from 'react-router-dom';

function Finalizar({setCurrentStage}) {
    const {cliente,accessToken, pedido, setPedido}=useGlobalStore();
    const navigate = useNavigate(); //<--- la ejecucion del hook useNavigate() devuelve una funcion, "navigate" 
    //al cual le pasas como parametro una ruta, invoca al modulo de enrutamiento y te redirige a esa ruta

    const windowPopup=useRef(null); //<--- referencia al popup de paypal, google-pay, etc...
    //#region ... solucion con timer cuando nodejs nos redirecciona en popup a la URL de fin de pedido ok...
    //el problema es que si el timer tarda mucho en ejecutarse, el usuario puede cerrar el popup o pueden aparacer tanto en el popup
    //como en la ventana padre dos componentes distintos de la tienda, el finpedidok y el finalizar.jsx
    // const timerPopup=useRef(null);

    // useEffect(
    //   ()=>{
    //     timerPopup.current=setInterval( 
    //       ()=>{
    //               let parametrosUrl=new URLSearchParams(windowPopup.current?.location.search); //<--- idCliente.... & idPedido=... & captureOrder=...  & pagoCancelado=true
                  
    //               console.log(`Comproando la url del popup de pago en paypal...${windowPopup.current?.location.href}, los parametros son: ${parametrosUrl.toString()} `);
                  
    //               if( parametrosUrl.get('pagCancelado') === 'true' ){
    //                 //pago canccelado por el cliente....cierro popup y notifico en la vista o con un alert
    //                 alert('Has cancelado el pago del pedido. Si lo deseas, puedes volver a intentarlo.');
    //                 windowPopup.current.close();
    //                 clearInterval( timerPopup.current );
    //                 return;
    //               }
    //               if( parametrosUrl.get('idPedido') && parametrosUrl.get('captureOrder') && parametrosUrl.get('idCliente') ){
    //                 //pago ok, cierro popup y cargo componente finpedidoOK
    //                 windowPopup.current.close();
    //                 clearInterval( timerPopup.current );
    //                 navigate(`/Pedido/FinPedidoOK?idCliente=${parametrosUrl.get('idCliente')}&idPedido=${parametrosUrl.get('idPedido')}&captureOrder=${JSON.parse(parametrosUrl.get('captureOrder'))}`);
    //               }
    //     },6000); //cada 6 segundos compruebo la url  del popup si sigue en paypal o ya me ha redirigido a finpedidook

    //     return ()=>{
    //       //limpio el timer
    //       clearInterval( timerPopup.current );
    //       //cerramos popup si aun y no ha sido cerrado
    //       if( windowPopup.current && ! windowPopup.current.closed ) windowPopup.current.close();
    //     }

    //   },
    //   []
    // )

    //#endregion

    useEffect(
      ()=>{
        //listener para recibir mensajes de la ventana popup de PayPal en ventana padre
        function onMsg(event){
            console.log('Mensaje recibido en ventana padre desde popup de PayPal:', event.data);

            const {idCliente,idPedido, captureOrder, pagoCancelado}=event.data;
            const { status, id, payer, payment_source } = captureOrder || {};

            if( id && status==='COMPLETED' ){
              //pago completado correctamente
              alert('Compra realizada correctamente con PayPal. En breve recibiras un email con los detalles de tu pedido y la factura.');
              
              setPedido('setMetodoPago', { tipo: 'PayPal', detalles: { orderID: id, payer, payment_source } } );
              navigate('/Pedido/FinPedidoOK');
            
            } else {
              //error en el pago
              alert('Error en la tramitacion del pago con PayPal. Por favor, reintentalo o elige otro metodo de pago.');
            }
        }
        
        window.addEventListener('message', onMsg);

        //funcion q se ejecuta al desmontar el componente, cerramos popup por si sigue abierto y eliminamos el listener y limpiamos la referencia
        return ()=>{
          if( windowPopup.current && !windowPopup.current.closed ) windowPopup.current.close(); //cerrar la ventana popup si sigue abierta
          window.removeEventListener('message', onMsg);        
          windowPopup.current=null;
        }
      },[]
    )

    async function HandlerConfCompra(){
      try {
          console.log('click en confirmar compra, pedido y datos cliente a enviar:', pedido, cliente);
          //...aqui llamariamos al endpoint de finalizar compra, enviando el objeto pedido y cliente al servidor para procesar la compra...
          const petFinCompra=await fetch('http://localhost:3000/api/Tienda/FinalizarCompra',{
            method:'POST',
            headers:{
              'Content-Type':'application/json',
              //deberia mandar el access token en cabecera para validar el usuario en el servidor...
              'Authorization': `Bearer ${accessToken}`  
            },
            body:JSON.stringify({ pedido, cliente })
          });
          const resFinCompra=await petFinCompra.json();
          console.log('respuesta del servidor al finalizar compra:', resFinCompra);
          if(resFinCompra.codigo===0){
            //lo suyo seria crear un componente donde mostrar el mensaje de pago ok y procesado del pedido con sus detalles
            //se puede incluir la factura en pdf ...nosotros un alert cutre de cojones y redirecciono a la pagina de inicio
            //OJO!!! hay que limpiar el carrito 
            //navigate('/Pedido/FinPedidoOk')
            switch (pedido.metodoPago.tipo) {
              case 'PayPal':                
                if( resFinCompra.approveUrl){
                  console.log(`Redirigiendo a la URL de aprobación de Paypal: ${resFinCompra.approveUrl}`);

                  //listener o manejador de evetnos "message" para interceptar mensajes enviados por popup hijo
                  //mejor hacerlo en efecto nada mas cargar componente, no cada vez q hagamos click en el boton finalizar compra pq se añadiria varias veces el listener
                  //si se hacen varios pedidos consecutivos,ejecutando multiples veces la misma funcion
                  // window.addEventListener('message', (event) => {
                  //   console.log(`Datos mandados por popup hijo: ${JSON.stringify(event.data)}`);
                  //   navigate(`/Pedido/FinPedidoOK?idCliente=${event.data.idCliente}&idPedido=${event.data.idPedido}&captureOrder=${event.data.captureOrder}`);

                  // })


                  windowPopup.current=window.open( resFinCompra.approveUrl, 'Pagar Pedido HSN en paypal', 'width=600,height=400');
                  return;
                }
                break;
            
              case 'Tarjeta de Credito/Debito':

                alert('Compra realizada con exito! En breve recibiras un email con los detalles de tu pedido.');
                navigate('/Pedido/FinPedidoOk');
                break;

                default:
                break;
            }


          } else {
            //notificar en la vista el mensaje: 'Ha ocurrido un error al procesar tu compra en la pasarela de pago, intentalo mas tarde'
            console.log(`error al pagar...${resFinCompra.mensaje}`)
          }       

        } catch (error) {
          console.log('error al tramitar el pedido:', error);
        }
    }



  return (
    <div className='container'>
        
        <div className='row mt-4'>
            <div className='col'>
                <h3>Resumen final</h3>
                <hr />
            </div>
        </div>

        <div className='row'>
            <div className='col'>
              <div className='final-message-checkout'>
                <span><i className="fa-solid fa-bag-shopping"></i>&nbsp;&nbsp;Revisa todos tus datos. Todo tiene solución, pero mejor que salga perfecto a la primera</span>
              </div>
              <div className=' d-flex justify-content-between alin-items-center'>
                <h5>Direccion de envio</h5>
                <div className="modify-link" onClick={ ()=> setCurrentStage(1)}>Modificar</div>
              </div>
              <div>
                { cliente.direcciones && cliente.direcciones.length > 0 && ( 
                    cliente.direcciones.filter(dir => dir.esPrincipal)
                                        .map( (dir, index) => 
                                                              <div key={index}>
                                                                  <p>{dir.datosContacto.nombre} {dir.datosContacto.apellidos}, {dir.calle}, {dir.municipio.DMUN50} ({dir.provincia.PRO}) cp: {dir.cp} - {dir.pais}</p>
                                                                  { dir.EsFacturacion && <span style={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '0.75em' }}>Usar para facturación*</span> }
                                                              </div>                                          
                                            )
                  )
                } 
              </div>
              <hr />
            </div>
        </div>

        <div className='row mt-3'>
            <div className='col'>
              <div className=' d-flex justify-content-between alin-items-center'>
                <h5>Forma de pago</h5>
                <div className="modify-link" onClick={ ()=> setCurrentStage(2)}>Modificar</div>
              </div>
              
              <div>
                { pedido.metodoPago.tipo } <br />
                { pedido.metodoPago.detalles.numeroTarjeta && (
                  <span>**** **** **** { pedido.metodoPago.detalles.numeroTarjeta.slice(-4) }</span>
                )}
              </div>
            </div>
        </div>
        <hr />

        <div className='row mt-3'>
            <div className='col'>
              <div className=' d-flex justify-content-between alin-items-center'>
                <h5>Metodo de envio</h5>
                <div className="modify-link" onClick={ ()=> setCurrentStage(1)}>Modificar</div>
              </div>
              <div>
                { pedido.metodoEnvio.transportista } - { pedido.metodoEnvio.servicio } ({ pedido.metodoEnvio.coste } €)
              </div>
            </div>
        </div>
        <hr />

        <div className='row mt-3'>
            <div className='col'>
                <h5>¿Alguna instruccion para el transportista? (max.40 caracteres)</h5>
                <textarea maxLength={40} className='form-control' placeholder='Escribe aqui tus instrucciones...' ></textarea>
            </div>
        </div>
        <hr />

        <div className='row m-4'>
            <div className='col d-flex flex-row justify-content-end align-items-center'>
                <button className='btn btn-hsn-1'onClick={HandlerConfCompra}>CONFIRMAR COMPRA</button>
            </div>
        </div>


    </div>
  )
}
export default Finalizar