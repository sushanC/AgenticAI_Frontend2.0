import {
  useState,
  useEffect
} from "react";

import axios from "axios";

export default function TasksPanel() {

  const [tasks, setTasks] =
    useState([]);

  const [text, setText] =
    useState("");

  async function loadTasks() {

    const response =
      await axios.get(
        "http://localhost:3001/tasks"
      );

    setTasks(
      response.data
    );
  }

  async function addTask() {

    if (!text.trim())
      return;

    await axios.post(
      "http://localhost:3001/tasks",
      {
        text
      }
    );

    setText("");

    loadTasks();
  }

  async function toggleTask(
    id
  ) {

    await axios.put(
      `http://localhost:3001/tasks/${id}`
    );

    loadTasks();
  }

  useEffect(() => {

    loadTasks();

  }, []);

  const completed =
    tasks.filter(
      task => task.completed
    ).length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round(
          (completed /
            tasks.length) *
            100
        );

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
          Task Manager
        </h1>

        <p
          style={{
            color: "#94A3B8",
            marginTop: "10px"
          }}
        >
          Stay organized and track your goals.
        </p>

      </div>

      <div
        style={{
          background:
            "rgba(255,255,255,0.05)",

          border:
            "1px solid rgba(255,255,255,0.08)",

          borderRadius:
            "20px",

          padding: "20px",

          marginBottom:
            "25px",

          backdropFilter:
            "blur(20px)"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            marginBottom: "10px"
          }}
        >

          <span>
            Progress
          </span>

          <span>
            {progress}%
          </span>

        </div>

        <div
          style={{
            height: "10px",
            borderRadius:
              "999px",

            background:
              "rgba(255,255,255,0.08)",

            overflow:
              "hidden"
          }}
        >

          <div
            style={{
              width:
                `${progress}%`,

              height: "100%",

              background:
                "linear-gradient(90deg,#6366F1,#8B5CF6)",

              transition:
                "0.3s"
            }}
          />

        </div>

      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "25px"
        }}
      >

        <input
          value={text}

          onChange={e =>
            setText(
              e.target.value
            )
          }

          placeholder=
            "Add a new task..."

          onKeyDown={e => {

            if (
              e.key === "Enter"
            ) {

              addTask();
            }
          }}

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

            outline: "none"
          }}
        />

        <button
          onClick={addTask}

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
          Add
        </button>

      </div>

      <div
        style={{
          display: "flex",
          flexDirection:
            "column",
          gap: "15px"
        }}
      >

        {tasks.map(task => (

          <div
            key={task.id}

            style={{

              display: "flex",

              alignItems:
                "center",

              gap: "15px",

              padding:
                "18px",

              borderRadius:
                "18px",

              background:
                "rgba(255,255,255,0.05)",

              border:
                "1px solid rgba(255,255,255,0.08)",

              backdropFilter:
                "blur(20px)",

              transition:
                "0.25s"
            }}
          >

            <input
              type="checkbox"

              checked={
                task.completed
              }

              onChange={() =>
                toggleTask(
                  task.id
                )
              }

              style={{
                width: "20px",
                height: "20px"
              }}
            />

            <span
              style={{

                flex: 1,

                fontSize:
                  "15px",

                textDecoration:
                  task.completed
                    ? "line-through"
                    : "none",

                opacity:
                  task.completed
                    ? 0.5
                    : 1
              }}
            >
              {task.text}
            </span>

            {task.completed && (

              <span
                style={{
                  color:
                    "#22C55E",
                  fontWeight:
                    "600"
                }}
              >
                Completed
              </span>

            )}

          </div>

        ))}

      </div>

    </div>
  );
}