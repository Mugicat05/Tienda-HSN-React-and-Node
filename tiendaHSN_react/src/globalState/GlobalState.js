    import { create } from "zustand";

    const useGlobalState = create(
        ( set, get, store)=>{
            //los parametros que recibe la funcion pasada al create son:
            //- set: es una funcion q permite actualizar el state global
            //- get: es una funcion q permite obtener el state global
            //- store: es un objeto q contiene el state global y los metodos para actualizarlo
            console.log(`definiendo el state global, los parametros de la funcion create son:`, set, get, store);
            //el return de la funcion es el objeto global del state
            return {
                cliente: JSON.parse(localStorage.getItem('cliente')) || null, //<--- objeto con los datos del cliente: { nombre, email, telefono, cuenta, direcciones,... }
                accessToken: JSON.parse(localStorage.getItem('accessToken')) || null,
                pedido: {
                    itemsPedido:[], //<--- array de items en formato: { producto:{ ....}, cantidad: ... }
                    estado: '', //<--- que puede ser: 'en formacion', 'confirmado', 'enviado', 'entregado',...
                    fechaPago: null, //<---- fecha en q se realizo el pago EN MILISEGUNDOS
                    metodoPago: {}, //<--- objeto asi: { tipo: 'Tarjeta credito| paypal  | ...', detalles: { numeroTarjeta: '**** **** **** 1234', titular: 'Juan Perez', fechaCaducidad: '12/25' } }
                    metodoEnvio: {}, //<--- objeto asi: { transportista: 'DHL | SEUR | MRW | ...', servicio: '24h | 48h | ...', coste: 5.99 }
                    direccionEnvio: null, //<--- objeto con los datos de la direccion de envio
                    direccionFacturacion: null, //<--- objeto con los datos de la direccion de facturacion
                    subtotal:0,
                    gastosEnvio:0,
                    total:0
                },
                setCliente: (nuevoDatoCliente)=>{
                    //actualizar la propiedad "cliente" del state global
                    //set ( state => ({ ...state, cliente: { ...state.cliente, ...nuevoDatoCliente} }) );
                    set ( state => {
                        localStorage.setItem('cliente', JSON.stringify({ ...state.cliente, ...nuevoDatoCliente}));
                        return ({ ...state, cliente: { ...state.cliente, ...nuevoDatoCliente} });
                    })
                    },
                setAccessToken: (nuevoAccessToken)=>{
                    //actualizar la propiedad "accessToken" del state global
                    //set( state => ({ ...state, accessToken: nuevoAccessToken }) );
                    set ( state => {
                        localStorage.setItem('accessToken', JSON.stringify(nuevoAccessToken));
                        return ({ ...state, accessToken: nuevoAccessToken });
                    })
                },
                setPedido: (accion, item)=>{
                    set ( state => {
                        
                        console.log(`accion en setPedido: ${accion}, itemPedido: ${JSON.stringify(item)}`);
                        
                        switch (accion) {
                            case 'setDirEnvio':
                            case 'setDirFacturacion':
                                return { 
                                            ...state, 
                                            pedido: { 
                                                ...state.pedido, 
                                                [ accion === 'setDirEnvio' ? 'direccionEnvio' : 'direccionFacturacion' ]: item 
                                            } 
                                        };
                            case 'setMetodoPago':
                                return { 
                                            ...state,
                                            pedido: { 
                                                ...state.pedido, 
                                                metodoPago: item 
                                            } 
                                        };
                        
                            default:
                                let _itemsPedido = [ ...state.pedido.itemsPedido ];
                                let _posItem = _itemsPedido.findIndex( it => it.producto._id === item.producto._id );
            
                                switch(accion){
                                    case 'agregar':
                                        //logica para agregar un item al pedido.itemsPedido
                                        //tengo q comprobar si el producto ya existe en el array
                                        if( _posItem >= 0 ){
                                            //el producto ya existe en el array, solo actualizo la cantidad
                                            _itemsPedido[_posItem].cantidad += item.cantidad;
                                        } else {
                                            //el producto no existe en el array, lo agrego
                                            _itemsPedido.push( item );
                                        }
                                        break;
            
                                    case 'eliminar':
                                        //logica para eliminar un item del pedido.itemsPedido
                                        _itemsPedido = _itemsPedido.filter( it => it.producto._id !== item.producto._id );
                                        break;
            
                                    case 'modificar':
                                        //logica para modificar un item del pedido.itemsPedido
                                        if( _posItem >= 0 ){
                                            //el producto ya existe en el array, actualizo la cantidad
                                            _itemsPedido[_posItem].cantidad = item.cantidad;
                                        }
                                        break;
                                    
                                        case 'vaciarCesta':
                                        _itemsPedido = [];
                                        break;
                                }
                                let _subtotal=_itemsPedido.reduce( (ac, item)=> ac + (item.producto.Precio * (1-item.producto.Oferta/100) *  item.cantidad), 0);
                                let _total= _subtotal + state.pedido.gastosEnvio;
            
                                return {
                                    ...state,
                                    pedido: {
                                        ...state.pedido,
                                        itemsPedido: _itemsPedido,
                                        subtotal: _subtotal,
                                        total: _total
                                    }
                                }
                        }
                    }
                    )
                }

        }
    }
    );

    export default useGlobalState;