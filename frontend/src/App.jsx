import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Checkout from "./Checkout";
import PaymentCallback from "./PaymentCallback";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Checkout />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
