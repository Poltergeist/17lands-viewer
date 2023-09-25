import { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Image,
  ListItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Select,
  SimpleGrid,
  Textarea,
  UnorderedList,
} from "@chakra-ui/react";

type CsvData = {
  Name: string;
  "GP WR": string;
  Rarity: "C" | "U" | "R" | "M" | null;
  Color: string;
};

const parsePercent = (percantage: string) => {
  return percantage.trim() === "" ? 0 : parseFloat(percantage);
};
function App() {
  const [data, setData] = useState<CsvData[]>([]);
  const [cardData, setCardData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [rarity, setRarity] = useState<CsvData.Rarity>(null);
  const [color, setColor] = useState<CsvData.Color>("");

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
        <Container>
          <Textarea
            onChange={(event) => {
              setData(
                Papa.parse<CsvData>(event.target.value, {
                  header: true,
                }).data
              );
              setLoading(true);
            }}
          />
        </Container>
      </>
    );
  }
  return (
    <>
      <Container maxW="container.lg">
        <Box>
          <SimpleGrid columns={3} gap="6">
            <FormControl>
              <FormLabel>Filter for Rarity</FormLabel>
              <Select
                placeholder="Select Rarity"
                onChange={(event) =>
                  setRarity(
                    event.target.value !== "" ? event.target.value : null
                  )
                }
              >
                <option value="C">Common</option>
                <option value="U">Uncommon</option>
                <option value="R">Rare</option>
                <option value="M">Mythic</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Filter for Color</FormLabel>
              <Select
                placeholder="Select Color"
                onChange={(event) => setColor(event.target.value)}
              >
                <option value="W">White</option>
                <option value="U">Blue</option>
                <option value="B">Black</option>
                <option value="R">Red</option>
                <option value="G">Green</option>
                <option value="M">Multicolor</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Restart with data input?</FormLabel>
              <Button onClick={() => setData([])}>Restart</Button>
            </FormControl>
          </SimpleGrid>
        </Box>
        <Divider marginY="6" />
        <SimpleGrid columns={4}>
          {data
            .filter((card) => {
              let show = true;
              if (rarity != null) {
                show = card.Rarity === rarity;
              }
              if (show && color !== "" && color !== "M") {
                show = card.Color.includes(color);
              }
              if (show && color !== "" && color === "M") {
                show = card.Color.length > 1;
              }
              return show;
            })
            .sort((a, b) =>
              parsePercent(a["GP WR"]) === parsePercent(b["GP WR"])
                ? 0
                : parsePercent(a["GP WR"]) > parsePercent(b["GP WR"])
                ? -1
                : 1
            )
            .map((card) => (
              <Box
                key={card.Name}
                maxW="sm"
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
              >
                <Popover>
                  <PopoverTrigger>
                    <Image
                      src={cardData[card.Name]}
                      title={`${card.Name} - ${card["GP WR"]}`}
                    />
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader>Stats</PopoverHeader>
                    <PopoverBody>
                      <UnorderedList>
                        <ListItem> Win Rate: {card["GP WR"]}</ListItem>
                      </UnorderedList>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Box>
            ))}
        </SimpleGrid>
      </Container>
    </>
  );
}

export default App;
