import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "store/store";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>
        <Component {...pageProps} />
      </PersistGate>
    </ReduxProvider>
  );
}

export default MyApp;
