import {
  useState,
  useEffect
} from "react";

import axios from "axios";

export default function NotesPanel() {

  const [notes, setNotes] =
    useState([]);

  const [text, setText] =
    useState("");

  async function loadNotes() {

    const response =
      await axios.get(
        "http://localhost:3001/notes"
      );

    setNotes(
      response.data
    );
  }

  async function saveNote() {

    if (!text.trim())
      return;

    await axios.post(
      "http://localhost:3001/notes",
      {
        content: text
      }
    );

    setText("");

    loadNotes();
  }

  useEffect(() => {

    loadNotes();

  }, []);

  return (

    <div
      style={{
        flex: 1,
        padding: "35px",
        overflowY: "auto",
        color: "#F8FAFC"
      }}
    >

      <div
        style={{
          marginBottom: "30px"
        }}
      >

        <h1
          style={{
            margin: 0,
            fontSize: "32px"
          }}
        >
          Notes
        </h1>

        <p
          style={{
            color: "#94A3B8",
            marginTop: "10px"
          }}
        >
          Capture ideas, reminders and thoughts.
        </p>

      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "30px"
        }}
      >

        <input
          value={text}

          onChange={e =>
            setText(
              e.target.value
            )
          }

          onKeyDown={e => {

            if (
              e.key === "Enter"
            ) {

              saveNote();
            }
          }}

          placeholder=
            "Write a note..."

          style={{

            flex: 1,

            padding: "14px",

            borderRadius:
              "16px",

            border:
              "1px solid rgba(255,255,255,0.08)",

            background:
              "rgba(255,255,255,0.05)",

            color:
              "#F8FAFC",

            outline:
              "none"
          }}
        />

        <button
          onClick={saveNote}

          style={{

            border: "none",

            borderRadius:
              "16px",

            padding:
              "0 24px",

            cursor:
              "pointer",

            background:
              "linear-gradient(135deg,#6366F1,#8B5CF6)",

            color:
              "white",

            fontWeight:
              "600"
          }}
        >
          Save
        </button>

      </div>

      <div
        style={{
          display: "grid",
          gap: "16px"
        }}
      >

        {notes.map(note => (

          <div
            key={note.id}

            style={{

              padding:
                "20px",

              borderRadius:
                "18px",

              background:
                "rgba(255,255,255,0.05)",

              border:
                "1px solid rgba(255,255,255,0.08)",

              backdropFilter:
                "blur(20px)",

              boxShadow:
                "0 10px 25px rgba(0,0,0,.2)",

              lineHeight:
                "1.7",

              wordBreak:
                "break-word"
            }}
          >

            {note.content}

          </div>

        ))}

      </div>

    </div>
  );
}