import { motion } from "framer-motion";
import {
  useEffect,
  useRef
} from "react";

export default function ChatWindow({
  messages
  
}) {

  const bottomRef =
  useRef(null);

  useEffect(() => {

  bottomRef.current
    ?.scrollIntoView({
      behavior: "smooth"
    });

}, [messages]);

  return (

    <div
      style={{
        flex: 1,
        height: "100%",
        padding: "20px 30px",
        overflow: "hidden",
        background: "#0B0F19",
        display: "flex",
        flexDirection: "column"
      }}
    >

      <div
        style={{
          marginBottom: "20px"
        }}
      >

        <h2
          style={{
            color: "#F8FAFC",
            margin: 0,
            fontSize: "28px"
          }}
        >
          Personal Agent
        </h2>

        <p
          style={{
            color: "#94A3B8",
            marginTop: "8px"
          }}
        >
          Online • Memory Active
        </p>

      </div>

      {

        messages.length === 0

        ? (

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "#94A3B8"
            }}
          >

            <h1
              style={{
                marginBottom: "10px"
              }}
            >
              Personal Agent
            </h1>

            <p>
              Ask anything...
            </p>

          </div>

        )

        : (

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              paddingTop: "10px"
            }}
          >

            {messages.map(
              (
                msg,
                index
              ) => {

                const isUser =
                  msg.role === "user";

                return (

                  <motion.div
                    key={index}

                    initial={{
                      opacity: 0,
                      y: 20
                    }}

                    animate={{
                      opacity: 1,
                      y: 0
                    }}

                    transition={{
                      duration: 0.25
                    }}

                    style={{
                      display: "flex",

                      justifyContent:
                        isUser
                          ? "flex-end"
                          : "flex-start"
                    }}
                  >

                    <div
                      style={{

                        maxWidth:
                          "850px",

                        width:
                          "fit-content",

                        padding:
                          "16px 20px",

                        borderRadius:
                          "18px",

                        background:
                          isUser
                            ? "linear-gradient(135deg,#6366F1,#8B5CF6)"
                            : "rgba(255,255,255,0.05)",

                        color:
                          "#F8FAFC",

                        backdropFilter:
                          "blur(20px)",

                        border:
                          isUser
                            ? "none"
                            : "1px solid rgba(255,255,255,0.08)",

                        boxShadow:
                          "0 10px 30px rgba(0,0,0,.25)",

                        lineHeight:
                          "1.7"
                      }}
                    >

                      <div
                        style={{
                          fontSize:
                            "12px",

                          opacity:
                            0.7,

                          marginBottom:
                            "6px"
                        }}
                      >

                        {
                          isUser
                            ? "You"
                            : "AI Assistant"
                        }

                      </div>

                      {msg.content}

                    </div>

                  </motion.div>

                );
              }
            )}
            <div ref={bottomRef} />

          </div>

        )

      }

    </div>

  );
}