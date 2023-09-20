// Import necessary packages
import { useState, useEffect } from "react";
import axios from "axios";
axios.defaults.baseURL = "http://localhost:5000";
function Test() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState({
    page: 1,
    current_page: 1,
    last_page: null,
    total: 0,
  });

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`/items?page=${page.page}&limit=${10}`);

      // @ts-ignore
      setItems((prevPosts) => [...prevPosts, ...response.data.items]);
      setPage((prevPage) => ({
        page: prevPage.page + 1,
        ...response.data.pagination,
      }));
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    try {
      let response = await axios.post("/items", {
        randomNumber: Math.random() * 300,
      });
      setItems((prevPosts) => [response.data, ...prevPosts]);
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };
  const handleDeleteItem = async (id) => {
    try {
      await axios.delete("/items/" + id);
      setItems((prevPosts) => prevPosts.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Failed to Delete item:", error);
    }
  };

  return (
    <div className="App">
      <div>
        <button onClick={handleCreateItem}>Create</button>
      </div>

      <h1>Item List</h1>
      <ul
        style={{
          listStyle: "none",
        }}
      >
        {items.map((item, i) => (
          <li key={item._id}>
            ({i + 1}) <strong>{item?.randomNumber}</strong>
            <button onClick={() => handleDeleteItem(item._id)}>Delete</button>
          </li>
        ))}
      </ul>
      {loading && "loadng..."}
      {page?.current_page !== page?.last_page && page.total > 10 && (
        <button
          onClick={() => {
            fetchPosts();
          }}
        >
          load more
        </button>
      )}
    </div>
  );
}

export default Test;
