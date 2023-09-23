import { useState, useEffect } from "react";
import "./App.css";
import Papa from "papaparse";

function App() {
  const [data, setData] = useState<Array<{ Name: string }>>([]);

  if (data.length === 0) {
    return (
      <>
        <div>
          <textarea
            onChange={(event) =>
              setData(
                Papa.parse<{ Name: string }[]>(event.target.value, {
                  header: true,
                })
              )
            }
            value={data}
          />
        </div>
      </>
    );
  }
  return (
    <>
      <div>
        <button onClick={() => setData("")}>reset</button>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </>
  );
}

export default App;
