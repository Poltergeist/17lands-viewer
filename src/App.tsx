import { useState, useEffect } from "react";
import "./App.css";
import Papa from "papaparse";

type CsvData = {
  Name: string;
  "GP WR": string;
};

const parsePercent = (percantage: string) => {
  return percantage.trim() === "" ? 0 : parseFloat(percantage);
};
function App() {
  const [data, setData] = useState<CsvData[]>([]);
  const [cardData, setCardData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    for (let x = Math.ceil(data.length / 30); x > 0; x--) {
      const images = {};
      const reqData = {
        identifiers: data
          .slice((x - 1) * 30, x * 30)
          .reduce<Array<{ name: string; set: string }>>(
            (acc, card) => [
              ...acc,
              { name: card.Name, set: "woe" },
              { name: card.Name, set: "wot" },
            ],
            []
          ),
      };
      fetch("https://api.scryfall.com/cards/collection", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(reqData),
      })
        .then((response) => response.json())
        .then((json) => {
          json.data.forEach((card) => {
            if (card.card_faces != null) {
              images[card.card_faces?.[0]?.name] = card.image_uris.normal;
            } else {
              images[card.name] = card.image_uris.normal;
            }
          });
          setCardData((cardData) => ({ ...cardData, ...images }));
        });
    }
    setLoading(false);
  }, [data]);

  if (loading) {
    console.log("loading");
    return (
      <>
        <h1>Loading</h1>
      </>
    );
  }

  if (data.length === 0) {
    return (
      <>
        <div>
          <textarea
            onChange={(event) => {
              setData(
                Papa.parse<CsvData>(event.target.value, {
                  header: true,
                }).data
              );
              setLoading(true);
            }}
          />
        </div>
      </>
    );
  }
  return (
    <>
      <div>
        <button onClick={() => setData([])}>reset</button>
        {data
          .sort((a, b) =>
            parsePercent(a["GP WR"]) === parsePercent(b["GP WR"])
              ? 0
              : parsePercent(a["GP WR"]) > parsePercent(b["GP WR"])
              ? -1
              : 1
          )
          .map((card) => (
            <img
              key={card.Name}
              src={cardData[card.Name]}
              title={`${card.Name} - ${card["GP WR"]}`}
            />
          ))}
      </div>
    </>
  );
}

export default App;
