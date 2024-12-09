import "./App.css";
import Effect from "./Effect";

function Background() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "linear-gradient(233deg, #DB1935 21.41%, #7D000D 72.86%)",
        opacity: 0.3,
      }}
    ></div>
  );
}

function App() {
  return (
    <>
      <Background />
      <Effect />
    </>
  );
}

export default App;
