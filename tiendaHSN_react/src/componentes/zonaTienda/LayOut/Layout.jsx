import { Outlet } from 'react-router-dom';
import Header from './Header/Header';
import Footer from './Footer/Footer';
export async function loader() {
  const res = await fetch('http://localhost:3000/api/Tienda/Categorias?pathCat=principales');
  const data = await res.json();
  return data.categorias;
}


function Layout() {
      return (
        <div className="container-fluid">
            <div className='row'>
                <div className='col'>
                    <Header />
                </div>
            </div>

            <div className="row">
                <div className="col">
                    {/* componente de react-router-dom para incrustar el contenido de un componente asociado a una ruta*/}
                    <Outlet />
                </div>
            </div>

            <div className='row'>
                <div className='col'>
                    <Footer />
                </div>
            </div>

        </div>
        );
}   
export default Layout;