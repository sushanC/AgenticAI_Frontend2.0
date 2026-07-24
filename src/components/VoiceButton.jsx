import axios from "axios";
import { useState } from "react";

export default function VoiceButton() {

  const [loading,
    setLoading] =
    useState(false);

  async function startVoice() {

    try {

      setLoading(true);

      const response =
        await axios.post(
          "http://localhost:3001/voice"
        );

      console.log(
        "Transcript:",
        response.data.transcript
      );

      console.log(
        "Answer:",
        response.data.answer
      );

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  }

  return (

    <button
      onClick={startVoice}

      disabled={loading}

      style={{

        width: "100%",

        height: "56px",

        border: "none",

        borderRadius:
          "18px",

        cursor:
          loading
            ? "not-allowed"
            : "pointer",

        color: "white",

        fontSize:
          "15px",

        fontWeight:
          "600",

        background:
          loading
            ? "rgba(255,255,255,0.08)"
            : "linear-gradient(135deg,#6366F1,#8B5CF6)",

        boxShadow:
          loading
            ? "none"
            : "0 10px 25px rgba(99,102,241,.35)",

        transition:
          "all .25s ease"
      }}
    >

      {loading
        ? "🎙 Listening..."
        : "🎤 Voice Assistant"}

    </button>
  );
}