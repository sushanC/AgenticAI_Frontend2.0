import { useState, useEffect } from "react";
import axios from "axios";

export function useTasks() {

  const [tasks, setTasks] =
    useState([]);

  useEffect(() => {

    loadTasks();

  }, []);

  async function loadTasks() {

    try {

      const response =
        await axios.get(
          "http://localhost:3001/tasks"
        );

      setTasks(
        response.data
      );

    } catch (err) {

      console.error(
        "Failed to load tasks",
        err
      );
    }
  }

  async function addTask(
    title
  ) {

    if (
      !title.trim()
    ) return;

    try {

      await axios.post(
        "http://localhost:3001/tasks",
        {
          text: title
        }
      );

      await loadTasks();

    } catch (err) {

      console.error(
        "Failed to add task",
        err
      );
    }
  }

  async function toggleTask(
  id
) {

  try {

    await axios.put(
      `http://localhost:3001/tasks/${id}`
    );

    await loadTasks();

  } catch (err) {

    console.error(
      "Failed to update task",
      err
    );
  }
}

async function deleteTask(
  id
) {

  try {

    await axios.delete(
      `http://localhost:3001/tasks/${id}`
    );

    await loadTasks();

  } catch (err) {

    console.error(
      "Failed to delete task",
      err
    );
  }
}

  const completedCount =
    tasks.filter(
      task =>
        task.completed
    ).length;

  const progress =
    tasks.length > 0

      ? Math.round(
          (
            completedCount /
            tasks.length
          ) * 100
        )

      : 0;

  return {

    tasks,

    addTask,

    toggleTask,

    deleteTask,

    completedCount,

    progress
  };
}