import React from "react";
import { observer } from "mobx-react-lite";
import { InputGroup, Card, Button } from "@blueprintjs/core";

// import { urlToBase64, svgToURL } from 'polotno/utils/svg';
import { SectionTab } from "polotno/side-panel";
import { getKey } from "polotno/utils/validate-key";
// import { getImageSize } from 'polotno/utils/image';
import { getAPI } from "polotno/utils/api";
import { StoreType } from "polotno/model/store";
import { FaComment } from "react-icons/fa6";
import { TAny } from "@/types/common";
import { QuoteItem } from "@/types/polotno";

// import { ImagesGrid } from 'polotno/side-panel/images-grid';

const KEYWORDS = [
  "Love",
  "Movies",
  "Life",
  "History",
  "War",
  "Political",
  "Time",
  "Music",
  "Sport",
  "Business",
  "Think",
  "Travel",
  "Work",
  "Science",
  "Religions",
  "Money",
  "Funny",
];

type Props = Readonly<{
  store: StoreType;
}>;

export const QuotesPanel = observer(({ store }: Props) => {
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [keywords, setKeywords] = React.useState("");
  const [items, setItems] = React.useState<QuoteItem[]>([]);

  React.useEffect(() => {
    store.loadFont("Atma");
  }, [store]);

  const timeout = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const requestQuery = (query: string) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setQuery(query);
    }, 500);
  };

  React.useEffect(() => {
    let skipResults = false;

    const run = async () => {
      setLoading(true);

      const req = await fetch(
        `${getAPI()}/get-quotes?query=${query}&keywords=${keywords}&KEY=${getKey()}`
      );
      if (!req.ok) {
        setLoading(false);
        setItems([]);
        return;
      }
      const json = await req.json();
      if (skipResults) {
        return;
      }
      setLoading(false);
      setItems(json.data);
    };
    run();
    return () => {
      skipResults = true;
    };
  }, [query, keywords]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <InputGroup
        leftIcon="search"
        placeholder="Search..."
        onChange={(e) => {
          requestQuery(e.target.value);
        }}
        style={{
          marginBottom: "20px",
        }}
      />
      <div>
        {KEYWORDS.map((keyword) => (
          <Button
            key={keyword}
            onClick={() => {
              if (keyword === keywords) {
                setKeywords("");
              } else {
                setKeywords(keyword);
              }
            }}
            minimal
            active={keyword === keywords}
            style={{ fontSize: "14px", padding: "2px 8px" }}
          >
            {keyword}
          </Button>
        ))}
      </div>
      {loading && <div style={{ padding: "10px" }}>Loading...</div>}
      <div
        style={{
          height: "100%",
          overflow: "auto",
          display: loading ? "none" : "block",
        }}
      >
        {items.map((item) => (
          <Card
            key={item.id}
            interactive
            style={{ margin: "10px" }}
            onClick={() => {
              const width = 500;
              const textEl = store.activePage.addElement({
                type: "text",
                text: item.text,
                width: width,
                x: store.width / 2 - width / 2,
                y: store.height / 2 - 100,
                fontFamily: "Atma",
                fontSize: 30,
              });
              setTimeout(() => {
                const authorEl = store.activePage.addElement({
                  type: "text",
                  text: item.author,
                  y: textEl.y + textEl.height + 10,
                  x: textEl.x,
                  align: "right",
                  width: width,
                  fontSize: 20,
                  fontFamily: "Atma",
                });
                store.selectElements([textEl.id, authorEl.id]);
              }, 60);
            }}
          >
            <div>{item.text}</div>
            <div style={{ textAlign: "right" }}>{item.author}</div>
          </Card>
        ))}
        {!loading && items.length === 0 && (
          <div style={{ padding: "10px" }}>No results</div>
        )}
      </div>
    </div>
  );
});

// define the new custom section
export const QuotesSection = {
  name: "quotes",
  Tab: (props: React.PropsWithChildren<TAny>) => (
    <SectionTab name="Quotes" {...props}>
      <FaComment />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: QuotesPanel,
};
