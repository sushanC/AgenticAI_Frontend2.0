import {
  useState,
  useEffect
} from "react";

import axios from "axios";

export default function PDFPanel() {

  const [file, setFile] =
    useState(null);

  const [pdfs, setPdfs] =
    useState([]);

  const [question,
    setQuestion] =
    useState("");

  const [answer,
    setAnswer] =
    useState("");

  const [selected,
    setSelected] =
    useState("");

  async function loadPDFs() {

    const response =
      await axios.get(
        "http://localhost:3001/pdf/list"
      );

    setPdfs(
      response.data
    );
  }

  async function uploadPDF() {

    if (!file)
      return;

    const form =
      new FormData();

    form.append(
      "pdf",
      file
    );

    await axios.post(
      "http://localhost:3001/pdf/upload",
      form
    );

    setFile(null);

    loadPDFs();
  }

  async function askPDF() {

    if (
      !selected ||
      !question.trim()
    ) {
      return;
    }

    const response =
      await axios.post(
        "http://localhost:3001/pdf/ask",
        {
          pdfName:
            selected,

          question
        }
      );

    setAnswer(
      response.data.answer
    );
  }

  useEffect(() => {

    loadPDFs();

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
          PDF Knowledge Base
        </h1>

        <p
          style={{
            color: "#94A3B8",
            marginTop: "10px"
          }}
        >
          Upload PDFs and chat with them.
        </p>

      </div>

      {/* Upload Section */}

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

        <h3
          style={{
            marginTop: 0
          }}
        >
          Upload PDF
        </h3>

        <div
          style={{
            display: "flex",
            gap: "12px"
          }}
        >

          <input
            type="file"

            onChange={e =>
              setFile(
                e.target.files[0]
              )
            }

            style={{
              flex: 1,
              color: "#F8FAFC"
            }}
          />

          <button
            onClick={
              uploadPDF
            }

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
            Upload
          </button>

        </div>

      </div>

      {/* PDF Selection */}

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

        <h3
          style={{
            marginTop: 0
          }}
        >
          Ask Questions
        </h3>

        <select
          value={selected}

          onChange={e =>
            setSelected(
              e.target.value
            )
          }

          style={{

            width: "100%",

            padding:
              "14px",

            borderRadius:
              "14px",

            marginBottom:
              "15px",

            border:
              "1px solid rgba(255,255,255,0.08)",

            background:
              "rgba(255,255,255,0.05)",

            color:
              "#F8FAFC"
          }}
        >

          <option value="">
            Select PDF
          </option>

          {pdfs.map(pdf => (

            <option
              key={pdf}
              value={pdf}
            >
              {pdf}
            </option>

          ))}

        </select>

        <div
          style={{
            display: "flex",
            gap: "12px"
          }}
        >

          <input
            value={question}

            onChange={e =>
              setQuestion(
                e.target.value
              )
            }

            placeholder=
              "Ask anything..."

            style={{

              flex: 1,

              padding:
                "14px",

              borderRadius:
                "14px",

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
            onClick={
              askPDF
            }

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
            Ask
          </button>

        </div>

      </div>

      {/* Answer */}

      {answer && (

        <div
          style={{
            background:
              "rgba(255,255,255,0.05)",

            border:
              "1px solid rgba(255,255,255,0.08)",

            borderRadius:
              "20px",

            padding:
              "24px",

            backdropFilter:
              "blur(20px)",

            lineHeight:
              "1.8",

            whiteSpace:
              "pre-wrap"
          }}
        >

          <h3
            style={{
              marginTop: 0
            }}
          >
            Answer
          </h3>

          {answer}

        </div>

      )}

    </div>
  );
}