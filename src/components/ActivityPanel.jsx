import {
  useEffect,
  useState
}
from "react";

import axios
from "axios";

export default function ActivityPanel() {

  const [
    activities,
    setActivities
  ] = useState([]);

  useEffect(() => {

    const interval =
      setInterval(
        async () => {

          const response =
            await axios.get(
              "http://localhost:3001/activities"
            );

          setActivities(
            response.data
          );

        },
        1000
      );

    return () =>
      clearInterval(
        interval
      );

  }, []);

  return (

    <div
      style={{
        padding: "12px",
        borderBottom:
          "1px solid rgba(255,255,255,.08)"
      }}
    >

      {
        activities
          .slice(-4)
          .map(
            (
              item,
              index
            ) => (

              <div
                key={index}
              >
                {item.text}
              </div>
            )
          )
      }

    </div>
  );
}