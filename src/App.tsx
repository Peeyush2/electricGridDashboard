import { useEffect } from "react";
import "./App.css";
import MapChart from "./MapChart";
import "bootstrap/dist/css/bootstrap.min.css";
import { Input, Label } from "reactstrap";
import { useSearchParams } from "react-router-dom";
import HourlyDemand from "./HourlyDemand";
import EnergySource from "./EnergySource";
import HourlyNeighboringUsage from "./HourlyNeighboringUsage";

const today = new Date();
const maxDate = today.toISOString().split("T")[0];

function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id");
  const date = searchParams.get("date");
  useEffect(() => {
    if (!id && !date) {
      setSearchParams({
        id: "US48",
        date: maxDate,
      });
    }
  }, []);
  return (
    <div className="App">
      <div className="marginDiv">
        <div className="header">Daily Electricity Dashboard</div>
        <div className="mainContent">
          <div className="dateSelector">
            <Label for="inputDate">
              Please provide date for which you want to see data:
            </Label>
            <Input
              className="dateInput"
              id="inputDate"
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
          </div>
          <hr />
          <div>
            <MapChart />
          </div>
          <hr />
          <div>
            <HourlyDemand />
          </div>
          <hr />
          <div>
            <EnergySource />
          </div>
          <hr />
          <div>
            <HourlyNeighboringUsage />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
