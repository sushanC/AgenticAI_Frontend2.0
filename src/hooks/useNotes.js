import { useState, useEffect } from "react";
import axios from "axios";

export function useNotes() {

  const [notes, setNotes] =
    useState([]);

  const [search, setSearch] =
    useState("");

  useEffect(() => {

    loadNotes();

  }, []);

  async function loadNotes() {

    try {

      const response =
        await axios.get(
          "http://localhost:3001/notes"
        );

      const formatted =
        response.data.map(
          note => ({
            id: note.id,
            title: note.content,
            body: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        );

      setNotes(formatted);

    } catch (err) {

      console.error(
        "Failed to load notes",
        err
      );
    }
  }

  async function addNote(
    title,
    body = ""
  ) {

    if (!title.trim())
      return;

    try {

      await axios.post(
        "http://localhost:3001/notes",
        {
          content:
            body
              ? `${title}\n\n${body}`
              : title
        }
      );

      await loadNotes();

    } catch (err) {

      console.error(
        "Failed to add note",
        err
      );
    }
  }

async function updateNote(
  id,
  patch
) {

  try {

    await axios.put(
      `http://localhost:3001/notes/${id}`,
      {
        content:
          patch.body
            ? `${patch.title}\n\n${patch.body}`
            : patch.title
      }
    );

    await loadNotes();

  } catch (err) {

    console.error(
      err
    );
  }
}

async function deleteNote(
  id
) {

  try {

    await axios.delete(
      `http://localhost:3001/notes/${id}`
    );

    await loadNotes();

  } catch (err) {

    console.error(
      err
    );
  }
}

  const filtered =
    notes.filter(
      note =>
        note.title
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        note.body
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  return {

    notes,

    filtered,

    search,

    setSearch,

    addNote,

    updateNote,

    deleteNote
  };
}