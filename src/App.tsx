import { useState } from "react";
import "./App.css";
import Papa from "papaparse";

function App() {
  const [data, setData] = useState<string>("");

  if (data === "") {
    return (
      <>
        <div>
          <textarea
            onChange={(event) => setData(event.target.value)}
            value={data}
          />
        </div>
      </>
    );
  }
  const parsedData = Papa.parse(data, { header: true });
  return (
    <>
      <div>
        <button onClick={() => setData("")}>reset</button>
        <pre>{JSON.stringify(parsedData.data, null, 2)}</pre>
      </div>
    </>
  );
}

export default App;
