import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { getTodaysDate } from "./utils";

ChartJS.register(ArcElement, Tooltip, Legend);

interface APIRESPONSETYPE {
  period: string;
  respondent: string;
  "respondent-name": string;
  fueltype: string;
  "type-name": string;
  timezone: string;
  "timezone-description": string;
  value: number;
  "value-units": string;
}

const backgroundColor = [
  "rgba(255, 99, 132, 0.2)",
  "rgba(54, 162, 235, 0.2)",
  "rgba(255, 206, 86, 0.2)",
  "rgba(75, 192, 192, 0.2)",
  "rgba(153, 102, 255, 0.2)",
  "rgba(255, 159, 64, 0.2)",
];
const borderColor = [
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
];

function EnergySource() {
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id");
  const dateParam = searchParams.get("date");
  const [pieData, setPieData] = useState<any>();

  useEffect(() => {
    const getNewData = async () => {
      await fetchNaturalResourceData();
    };
    getNewData();
  }, [idParam, dateParam]);

  const createDataSet = (dataFromApi: APIRESPONSETYPE[]) => {
    const fueltypeSum: any = {};

    for (const item of dataFromApi) {
      const fueltype = item["type-name"];
      const value = item.value;

      if (!fueltypeSum[fueltype]) {
        fueltypeSum[fueltype] = value;
      } else {
        fueltypeSum[fueltype] += value;
      }
    }

    const fueltypeSumArray = Object.keys(fueltypeSum).map((fueltype) => ({
      fueltype: fueltype,
      sumValue: fueltypeSum[fueltype],
    }));

    const labels = fueltypeSumArray.map((d) => d.fueltype);
    const dataValues = fueltypeSumArray.map((d) => d.sumValue);

    const structuredData = {
      labels: labels,
      datasets: [
        {
          label: "Amount of Electricity from energy source",
          data: dataValues,
          backgroundColor,
          borderColor,
        },
      ],
    };
    setPieData(structuredData);
  };

  const fetchNaturalResourceData = async () => {
    try {
      const requestData = {
        params: {
          frequency: "daily",
          "data[0]": "value",
          "facets[respondent][]": `${idParam ? idParam : "US48"}`,
          start: `${dateParam ? `${dateParam}` : `${getTodaysDate()}`}`,
          end: `${dateParam ? `${dateParam}` : `${getTodaysDate()}`}`,
          "sort[0][column]": "period",
          "sort[0][direction]": "desc",
          "sort[1][column]": "value",
          "sort[1][direction]": "asc",
          offset: 0,
          length: 5000,
          api_key: process.env.REACT_APP_API_KEY,
        },
      };
      const response = await axios.get(
        "https://api.eia.gov/v2/electricity/rto/daily-fuel-type-data/data",
        requestData
      );
      if (response?.status === 200) {
        createDataSet(response?.data?.response?.data);
      }
    } catch (err) {
      console.error("error");
      console.log(err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px 0px 10px 0px",
      }}
    >
      <h2> This chart shows electricity generation sources </h2>

      <div className="lineChart">
        {" "}
        {pieData?.labels?.length ? (
          <Pie data={pieData} />
        ) : (
          <h2> Data not available</h2>
        )}
      </div>
    </div>
  );
}

export default EnergySource;
