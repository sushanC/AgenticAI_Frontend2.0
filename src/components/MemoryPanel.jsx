import {
  useState,
  useEffect
} from "react";

import axios from "axios";

export default function MemoryPanel() {

    const [memory,
  setMemory] =
  useState({});

const [search,
  setSearch] =
  useState("");

<input
  value={search}
  onChange={e =>
    setSearch(
      e.target.value
    )
  }
  placeholder="Search memory..."
/>
Object.entries(memory)
.filter(([key]) =>
  key
    .toLowerCase()
    .includes(
      search.toLowerCase()
    )
)

  async function loadMemory() {

    const response =
      await axios.get(
        "http://localhost:3001/memory"
      );

    setMemory(
      response.data
    );
  }

  async function deleteFact(
    key
  ) {

    await axios.delete(
      `http://localhost:3001/memory/${key}`
    );

    loadMemory();
  }

  useEffect(() => {

    loadMemory();

  }, []);

  const filteredMemory =
  Object.entries(memory)
    .filter(([key]) =>
      key
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

<div
  style={{
    flex: 1,
    overflowY: "auto",
    padding: "30px",
    color: "white",
    height: "100%"
  }}
>

      <h2>
        Memory
      </h2>

      <input
  value={search}
  onChange={e =>
    setSearch(
      e.target.value
    )
  }
  placeholder="Search memory..."
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    borderRadius: "12px",
    border:
      "1px solid rgba(255,255,255,0.08)",
    background:
      "rgba(255,255,255,0.05)",
    color: "white",
    outline: "none"
  }}
/>
      <p
  style={{
    color: "#94A3B8"
  }}
>
  {Object.keys(memory).length}
  facts stored
</p>

      {
        filteredMemory.map(
          ([key, value]) => (

            <div
              key={key}
              style={{
                padding: "16px",
                marginBottom:
                  "12px",
                background:
"rgba(255,255,255,0.04)",

backdropFilter:
"blur(20px)",

border:
"1px solid rgba(255,255,255,0.08)",

boxShadow:
"0 10px 30px rgba(0,0,0,.2)",
                borderRadius:
                  "12px"
              }}
            >

              <strong>
                {key}
              </strong>

              <br />

              {value}

              <br />
              <br />

              <button
                onClick={() =>
                  deleteFact(
                    key
                  )
                }
              >
                Delete
              </button>

            </div>
          )
        )
      }

    </div>
  );
}