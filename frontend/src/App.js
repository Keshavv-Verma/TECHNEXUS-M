import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Electronics from './pages/Electronics';
import Mobandaccess from './pages/Mobandaccess';
import More from './pages/More';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Category from './components/Category/Category';
import SingleProduct from './components/SingleProduct/SingleProduct';
import AppContext from "./context/AppContext";
import { useLocation } from 'react-router-dom';
import SuccessPage from './components/SuccessPage/SuccessPage';
import ProductPage from './components/productpage/ProductPage';
import AuthForm from './components/Login/AuthForm';
import Dashboard from './components/Dashboard/Dashboard';
import CartPage from './pages/Cart';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import TrackOrder from './pages/TrackOrder';
import AIAssistant from './components/AIAssistant/AIAssistant';

function App() {
  const ScrollToTop = () => {
    const { pathname } = useLocation();
  
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
  
    return null;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <AppContext>
          <Navbar />
          <ScrollToTop />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/Electronics' element={<Electronics />} />
            <Route path='/Mobandaccess' element={<Mobandaccess />} />
            <Route path='/More' element={<More />} />
            <Route path="/login" element={<AuthForm />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/product/:id" element={<SingleProduct />} />
            <Route path='/success' element={<SuccessPage/>} />
            <Route path='/order-success' element={<OrderSuccess />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/track-order/:orderNumber' element={<TrackOrder />} />
            <Route path='/productpage/:id' element={<ProductPage/>} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
          <Footer />
          <AIAssistant />
        </AppContext>
      </BrowserRouter>
    </div>
  );
}

export default App;
