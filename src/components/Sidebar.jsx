import VoiceButton from "./VoiceButton";
import { motion } from "framer-motion";

export default function Sidebar({
  setPage
}) {

  const buttonStyle = {
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    border: "none",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.05)",
    color: "#E5E7EB",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "15px",
    transition: "all 0.25s ease"
  };

  return (

    <div
      style={{
        width: "280px",
        height: "100vh",

        background:
          "rgba(18,18,24,0.75)",

        backdropFilter:
          "blur(20px)",

        borderRight:
          "1px solid rgba(255,255,255,0.08)",

        color: "white",

        padding: "24px",

        boxSizing: "border-box"
      }}
    >

      <div
        style={{
          marginBottom: "30px"
        }}
      >
        <h2
          style={{
            margin: 0,
            fontWeight: "700",
            letterSpacing: "1px"
          }}
        >
          Personal Agent
        </h2>

        <p
          style={{
            color: "#9CA3AF",
            marginTop: "8px",
            fontSize: "13px"
          }}
        >
          AI Assistant
        </p>
      </div>

      <motion.button

  whileHover={{
    scale: 1.03,
    x: 4
  }}

  whileTap={{
    scale: 0.98
  }}
        style={buttonStyle}
        onClick={() =>
          setPage("chat")
        }
      >
        💬 Chat
      </motion.button>

      <motion.button

  whileHover={{
    scale: 1.03,
    x: 4
  }}

  whileTap={{
    scale: 0.98
  }}
        style={buttonStyle}
        onClick={() =>
          setPage("notes")
        }
      >
        📝 Notes
      </motion.button>

      <motion.button

  whileHover={{
    scale: 1.03,
    x: 4
  }}

  whileTap={{
    scale: 0.98
  }}
        style={buttonStyle}
        onClick={() =>
          setPage("tasks")
        }
      >
        ✅ Tasks
      </motion.button>

      <motion.button

  whileHover={{
    scale: 1.03,
    x: 4
  }}

  whileTap={{
    scale: 0.98
  }}
        style={buttonStyle}
        onClick={() =>
          setPage("pdfs")
        }
      >
        📄 PDFs
      </motion.button>

      <div
        style={{
          marginTop: "20px"
        }}
      >
        <VoiceButton />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "30px",
          left: "24px",
          right: "24px"
        }}
      >
        <motion.button

  whileHover={{
    scale: 1.03,
    x: 4
  }}

  whileTap={{
    scale: 0.98
  }}
          style={buttonStyle}
        >
          ⚙ Settings
        </motion.button>
        <motion.button
  whileHover={{
    scale: 1.03,
    x: 4
  }}
  whileTap={{
    scale: 0.98
  }}
  style={buttonStyle}
  onClick={() =>
    setPage("memory")
  }
>
  🧠 Memory
</motion.button>
      </div>

    </div>

    
  );

  
}