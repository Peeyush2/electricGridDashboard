import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { getNextDay, getTodaysDate, getUniqueValuesByKey } from "./utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
interface DailyDataType {
  period: string;
  fromba: string;
  "fromba-name": string;
  toba: string;
  "toba-name": string;
  timezone: string;
  value: number;
  "value-units": string;
}

interface DatasetType {
  label: string;
  data: number[];
  backgroundColor: string;
}

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Electricity usage",
    },
  },
};

function HourlyNeighboringUsage() {
  const [dataForChart, setData] = useState<any>();
  const [searchParams] = useSearchParams();
  const idParam = searchParams.get("id");
  const dateParam = searchParams.get("date");

  const createDataSet = (apiData: DailyDataType[] = []) => {
    const possiblelabels: any[] = getUniqueValuesByKey(apiData, "toba");
    const datasetsComplete: any[] = [];
    for (const possibleLabelIdx in possiblelabels) {
      const differentTobaData = apiData.filter(
        (val) => val.toba === possiblelabels[possibleLabelIdx]
      );
      console.log(differentTobaData);
      const totalForToba = differentTobaData?.reduce(
        (accumlator, currVal) => accumlator + currVal.value,
        0
      );
      datasetsComplete.push(totalForToba);
    }

    setData({
      labels: possiblelabels,
      datasets: [
        {
          label: "Electricity sharing with neighbouring reigons",
          data: datasetsComplete,
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    });
  };

  const fetchHourlyData = async () => {
    try {
      const requestData = {
        params: {
          frequency: "daily",
          "data[0]": "value",
          "facets[fromba][]": `${idParam ? idParam : "US48"}`,
          start: `${dateParam ? `${dateParam}` : `${getTodaysDate()}`}`,
          end: `${
            dateParam
              ? `${getNextDay(dateParam)}`
              : `${getNextDay(getTodaysDate())}`
          }`,
          "sort[0][column]": "period",
          "sort[0][direction]": "desc",
          "sort[1][column]": "value",
          "sort[1][direction]": "asc",
          offset: 0,
          length: 5000,
          api_key: process.env.REACT_APP_API_KEY, // Add the API key as a parameter
        },
      };
      const response = await axios.get(
        "https://api.eia.gov/v2/electricity/rto/daily-interchange-data/data/",
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

  useEffect(() => {
    const fetchNewData = async () => await fetchHourlyData();
    fetchNewData();
  }, [idParam, dateParam]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px 0px 10px 0px",
        marginTop: "20px",
      }}
    >
      <h2>
        {" "}
        This chart shows hourly usage of electricity in different fields{" "}
      </h2>
      <div className="lineChart">
        {dataForChart && <Bar options={options} data={dataForChart} />}
      </div>
    </div>
  );
}

export default HourlyNeighboringUsage;
