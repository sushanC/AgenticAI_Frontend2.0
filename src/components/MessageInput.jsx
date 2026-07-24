import {
  useState
} from "react";

export default function MessageInput({
  onSend
}) {

  const [text, setText] =
    useState("");

  function handleSend() {

    if (!text.trim())
      return;

    onSend(text);

    setText("");
  }

  return (

    <div
      style={{
        padding: "20px",
        background:
          "#0B0F19",

        borderTop:
          "1px solid rgba(255,255,255,0.08)"
      }}
    >

      <div
        style={{

          display: "flex",

          alignItems:
            "center",

          gap: "12px",

          background:
            "rgba(255,255,255,0.05)",

          border:
            "1px solid rgba(255,255,255,0.08)",

          backdropFilter:
            "blur(20px)",

          borderRadius:
            "20px",

          padding:
            "12px",

          boxShadow:
            "0 10px 30px rgba(0,0,0,.25)"
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

              handleSend();
            }
          }}

          placeholder=
            "Ask anything..."

          style={{

            flex: 1,

            border: "none",

            outline: "none",

            background:
              "transparent",

            color:
              "#F8FAFC",

            fontSize:
              "15px"
          }}
        />

        <button
          style={{

            width: "42px",

            height: "42px",

            borderRadius:
              "50%",

            border: "none",

            cursor:
              "pointer",

            background:
              "rgba(255,255,255,0.08)",

            color:
              "#F8FAFC",

            fontSize:
              "18px"
          }}
        >
          🎤
        </button>

        <button
          onClick={
            handleSend
          }

          style={{

            width: "42px",

            height: "42px",

            borderRadius:
              "50%",

            border: "none",

            cursor:
              "pointer",

            background:
              "linear-gradient(135deg,#6366F1,#8B5CF6)",

            color:
              "white",

            fontSize:
              "18px",

            fontWeight:
              "bold"
          }}
        >
          ➜
        </button>

      </div>

    </div>
  );
}