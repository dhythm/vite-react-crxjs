import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const query = useRef<HTMLInputElement>(null);
  const [allBookmarks, setAllBookMarks] = useState<
    chrome.bookmarks.BookmarkTreeNode[]
  >([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<
    chrome.bookmarks.BookmarkTreeNode[]
  >([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    chrome.bookmarks.search({}, (bookmarkItems) => {
      setAllBookMarks(bookmarkItems.filter((item) => "url" in item));
    });
  }, []);

  useEffect(() => {
    const debounced = debounce(() => {
      const regexp = new RegExp(`.*${searchText}.*`);
      setFilteredBookmarks(
        allBookmarks.filter((bookmark) => {
          return regexp.test(bookmark.title);
        })
      );
    }, 100);
    debounced();
    return () => {
      debounced.cancel();
    };
  }, [allBookmarks, searchText]);

  return (
    <div className="App">
      <input
        autoFocus={true}
        type="text"
        ref={query}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            for (const bookmark of filteredBookmarks) {
              chrome.tabs.create({ url: bookmark.url });
            }
          }
        }}
      />
      {filteredBookmarks.map((bookmark) => {
        return <p key={bookmark.id}>{bookmark.title}</p>;
      })}
    </div>
  );
}

export default App;
