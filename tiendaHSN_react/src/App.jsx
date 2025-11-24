import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Login from './componentes/zonaCliente/Login/Login.jsx'
import Registro from './componentes/zonaCliente/Registro/Registro.jsx'
import Layout from './componentes/zonaTienda/LayOut/Layout.jsx'
import Home from './componentes/zonaTienda/Inicio/Home.jsx'
import ProductosCat from './componentes/zonaTienda/Productos/ProductosCat.jsx'
import PedidoComp from './componentes/zonaTienda/Pedido/PedidoComp.jsx'
import FinPedido from './componentes/zonaTienda/FinalizarPedido/FinPedidoComp/FinPedido.jsx'
import FinPedidoOk from './componentes/zonaTienda/FinalizarPedido/FinPedidoOKTrasPago/FinPedidoOk.jsx'
import MiCuenta from './componentes/zonaCliente/CuentaPanel/MiCuenta.jsx'
import MisDatos from './componentes/zonaCliente/CuentaPanel/1_MisDatosPersonales/MisDatos.jsx'

//en el componente raiz definimos el contunto de rutas que va a interceptar el modulo de enrutamient REACT-ROUTER-DOM
//1º paso) para defeinirlas se usa la funcion createBrowserRouter() <---- se le pasa un array de objetos Route 
// cada objeto Route define una ruta y el componente que se va a renderizar cuando se acceda a esa ruta

//2º paso) se usa el componente RouterProvider que recibe como prop el objeto router que hemos creado en el paso 1 para activar dichas rutas
// en el arbol de compononentes

const rutasAplicacion = createBrowserRouter(
  [
    { 
      element:<Layout />,
      loader:async ( {request, params } ) =>{
        //el cuerpo de esta funcion loader se ejecuta antes de que se renderice el componente asociado a la ruta, en nuestro caso el Layout
        //¿para que nos sirve? para recuperar CATEGORIAS PRINCIPALES desde nodejs y pasarselas al Heder del  Layout...
        console.log(`ejecutando loader de la ruta ${request.url} con params:`, params);
        const petCategoriasPpales= await fetch('http://localhost:3000/api/Tienda/Categorias?pathCat=principales',{ method:'GET'});
        const respuestaServer= await petCategoriasPpales.json();
        return respuestaServer.categorias;
       }, 
      children:[
        { path:'/', element:<Home />}, 
        {  path:'Cliente', 
           children:[
            { path:'Login', element: <Login />},
            { path:'Registro', element: <Registro />},
            { path: 'Cuenta', 
             element: <MiCuenta />,
              children:[
                { path: 'misDatosPersonales', element: <MisDatos /> },
            ] 
          }
            //  { path:'Panel', 
            //   children:[
            //               { path:'MisPedidos', element:<MisPedidos />},
            //               { path:'MisDirecciones', element:<MisDirecciones />},
            //               { path:'MisListas', element:<MisListas />},
            //               { path:'MiCuenta', element:<MiCuenta />},
            //  ]}
          ]
        },
        { path:'Productos/:pathCategoria', 
          element:<ProductosCat />, 
          loader: async ( { params } ) =>{
            //funcion LOADER que se ejecuta antes de cargar el componente ProductosCat.jsx  para cargar los productos de la categoria indicada en la URL
            console.log(`ejecutando LOADER antes de la carga del componente ProductosCat.jsx, variables params=${JSON.stringify(params)}`);
            let petProductos= await fetch(`http://localhost:3000/api/Tienda/Productos?pathCat=${params.pathCategoria}`);
            let bodyRespuesta= await petProductos.json();
            return bodyRespuesta.productos;
          }
        },
        { path:'Pedido',  
          children:[
            { path:'PedidoActual', element:<PedidoComp /> },
            { path:'FinalizarPedido', element:<FinPedido /> },
             { path:'FinPedidoOK', element:<FinPedidoOk /> }
          ]
        },
        { path:'*', element:<div><img src="/images/error404.png" alt="Error 404" /></div>}
      ] 
    }
  ]
);

function App() {

  return (
   <>
      <RouterProvider router={rutasAplicacion} />
   </>
  )
}

export default App
