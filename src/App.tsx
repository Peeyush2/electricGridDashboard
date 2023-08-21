import React from "react";
import "./App.css";
import MapChart from "./MapChart";
import "bootstrap/dist/css/bootstrap.min.css";
import { Input } from "reactstrap";
import { useSearchParams } from "react-router-dom";
import HourlyDemand from "./HourlyDemand";
import EnergySource from "./EnergySource";

const today = new Date();
const maxDate = today.toISOString().split("T")[0];

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");
  const date = searchParams.get("date");
  return (
    <div className="App">
      <Input
        type="date"
        max={maxDate}
        value={date || ""}
        onChange={(e) =>
          setSearchParams(() => ({
            date: e.target.value,
            id: id || "",
          }))
        }
      />
      <div>
        <MapChart />
      </div>
      <div>
        <HourlyDemand />
      </div>
      <div>
        <EnergySource />
      </div>
    </div>
  );
}

export default App;
